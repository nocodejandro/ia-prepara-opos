// Worker de publicación de TRIAL REELS en Instagram.
//
// Lo invoca pg_cron cada 2 minutos. Cada tick hace UN paso, nunca se queda
// esperando: Meta tarda 30-120s en procesar un vídeo y una Edge Function que
// bloquea ese rato se queda sin tiempo. Por eso el estado vive en la tabla.
//
//   pendiente  --crear contenedor-->  subiendo  --publicar-->  publicado
//                                        |
//                                        +--------------------> error
//
// Un trial reel solo llega a NO seguidores. Lo que lo convierte en trial es el
// parámetro trial_params; sin él Meta publica un reel normal al feed.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// --- Reglas de plataforma (metodología F100K) -------------------------------
// Pasarse de 5 al día dispara el aviso de "tu trial reel no tendrá mucho
// alcance". Menos de 5 minutos entre variantes y compiten entre sí por la
// misma ventana de distribución.
const MAX_POR_DIA = Number(Deno.env.get("TRIAL_REELS_MAX_POR_DIA") ?? "5");
const MIN_MINUTOS_ENTRE_POSTS = Number(Deno.env.get("TRIAL_REELS_MIN_MINUTOS") ?? "5");
const MAX_INTENTOS = 3;

const GRAPH_HOST = Deno.env.get("IG_GRAPH_HOST") ?? "graph.instagram.com";
const GRAPH_VERSION = Deno.env.get("IG_GRAPH_VERSION") ?? "v23.0";
const IG_USER_ID = Deno.env.get("IG_USER_ID") ?? "";
const IG_ACCESS_TOKEN = Deno.env.get("IG_ACCESS_TOKEN") ?? "";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

const graph = (path: string) => `https://${GRAPH_HOST}/${GRAPH_VERSION}/${path}`;

// --- Acceso a la cola vía PostgREST ----------------------------------------

async function db(path: string, init: RequestInit = {}) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
      ...(init.headers ?? {}),
    },
  });
  const texto = await res.text();
  if (!res.ok) throw new Error(`PostgREST ${res.status}: ${texto}`);
  return texto ? JSON.parse(texto) : null;
}

const actualizar = (id: string, campos: Record<string, unknown>) =>
  db(`trial_reels_queue?id=eq.${id}`, { method: "PATCH", body: JSON.stringify(campos) });

async function fallar(fila: Fila, motivo: string) {
  const intentos = fila.intentos + 1;
  console.error(`[${fila.titulo}] intento ${intentos}/${MAX_INTENTOS}: ${motivo}`);
  // Un contenedor que falla no se reutiliza: Meta exige uno nuevo. Por eso se
  // limpia ig_container_id y la fila vuelve a 'pendiente' para reintentar.
  await actualizar(fila.id, {
    estado: intentos >= MAX_INTENTOS ? "error" : "pendiente",
    intentos,
    ultimo_error: motivo.slice(0, 2000),
    ig_container_id: null,
  });
}

interface Fila {
  id: string;
  titulo: string;
  video_url: string;
  caption: string;
  graduation_strategy: string;
  scheduled_at: string;
  intentos: number;
  ig_container_id: string | null;
}

// --- Pasos ------------------------------------------------------------------

/** Paso 2: el contenedor ya existe. ¿Terminó de procesar? Publicar. */
async function publicarSiEstaListo(fila: Fila) {
  const estadoRes = await fetch(
    graph(`${fila.ig_container_id}?fields=status_code,status&access_token=${IG_ACCESS_TOKEN}`),
  );
  const estado = await estadoRes.json();

  if (!estadoRes.ok) {
    await fallar(fila, `consultando estado: ${JSON.stringify(estado)}`);
    return { accion: "error_estado", titulo: fila.titulo };
  }

  if (estado.status_code === "IN_PROGRESS") {
    return { accion: "procesando", titulo: fila.titulo };
  }

  if (estado.status_code !== "FINISHED") {
    await fallar(fila, `contenedor en ${estado.status_code}: ${estado.status ?? ""}`);
    return { accion: "contenedor_fallido", titulo: fila.titulo };
  }

  const pubRes = await fetch(graph(`${IG_USER_ID}/media_publish`), {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      creation_id: fila.ig_container_id!,
      access_token: IG_ACCESS_TOKEN,
    }),
  });
  const pub = await pubRes.json();

  if (!pubRes.ok) {
    await fallar(fila, `publicando: ${JSON.stringify(pub)}`);
    return { accion: "publicacion_fallida", titulo: fila.titulo };
  }

  // El permalink es informativo; si falla no invalida la publicación.
  let permalink: string | null = null;
  try {
    const metaRes = await fetch(
      graph(`${pub.id}?fields=permalink&access_token=${IG_ACCESS_TOKEN}`),
    );
    if (metaRes.ok) permalink = (await metaRes.json()).permalink ?? null;
  } catch (_) { /* ignorado a propósito */ }

  await actualizar(fila.id, {
    estado: "publicado",
    ig_media_id: pub.id,
    permalink,
    published_at: new Date().toISOString(),
    ultimo_error: null,
  });

  console.log(`[${fila.titulo}] PUBLICADO como trial reel: ${permalink ?? pub.id}`);
  return { accion: "publicado", titulo: fila.titulo, permalink };
}

/** Paso 1: crear el contenedor con trial_params. */
async function crearContenedor(fila: Fila) {
  const params = new URLSearchParams({
    media_type: "REELS",
    video_url: fila.video_url,
    caption: fila.caption,
    // Esto es lo que lo hace TRIAL. Sin este parámetro sale un reel normal.
    trial_params: JSON.stringify({ graduation_strategy: fila.graduation_strategy }),
    access_token: IG_ACCESS_TOKEN,
  });

  const res = await fetch(graph(`${IG_USER_ID}/media`), {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params,
  });
  const datos = await res.json();

  if (!res.ok || !datos.id) {
    await fallar(fila, `creando contenedor: ${JSON.stringify(datos)}`);
    return { accion: "contenedor_fallido", titulo: fila.titulo };
  }

  await actualizar(fila.id, {
    estado: "subiendo",
    ig_container_id: datos.id,
    ultimo_error: null,
  });

  console.log(`[${fila.titulo}] contenedor ${datos.id} creado, procesando`);
  return { accion: "contenedor_creado", titulo: fila.titulo };
}

// --- Handler ----------------------------------------------------------------

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const responder = (cuerpo: unknown, status = 200) =>
    new Response(JSON.stringify(cuerpo), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  // Endurecimiento opcional. Sin WORKER_SECRET la función queda abierta, y lo
  // peor que puede hacer un desconocido es adelantar una publicación ya
  // programada — no puede inyectar contenido, que solo entra por el encolador.
  const workerSecret = Deno.env.get("WORKER_SECRET");
  if (workerSecret && req.headers.get("x-worker-secret") !== workerSecret) {
    return responder({ error: "No autorizado" }, 401);
  }

  if (!IG_ACCESS_TOKEN || !IG_USER_ID) {
    return responder(
      { error: "Faltan los secretos IG_ACCESS_TOKEN y/o IG_USER_ID en la Edge Function." },
      500,
    );
  }

  try {
    // Una fila 'subiendo' tiene prioridad: su contenedor caduca en ~24h.
    const subiendo: Fila[] = await db(
      "trial_reels_queue?estado=eq.subiendo&order=scheduled_at.asc&limit=1",
    );
    if (subiendo.length > 0) {
      return responder(await publicarSiEstaListo(subiendo[0]));
    }

    const ahora = Date.now();

    // Tope diario.
    const hace24h = new Date(ahora - 24 * 3600_000).toISOString();
    const delDia: { published_at: string }[] = await db(
      `trial_reels_queue?estado=eq.publicado&published_at=gte.${hace24h}` +
        `&select=published_at&order=published_at.desc`,
    );
    if (delDia.length >= MAX_POR_DIA) {
      return responder({ accion: "tope_diario", publicados_24h: delDia.length });
    }

    // Separación mínima entre publicaciones.
    if (delDia.length > 0) {
      const minutos = (ahora - Date.parse(delDia[0].published_at)) / 60_000;
      if (minutos < MIN_MINUTOS_ENTRE_POSTS) {
        return responder({ accion: "esperando_separacion", minutos_desde_ultimo: minutos });
      }
    }

    // Siguiente pendiente cuya hora ya llegó.
    const pendientes: Fila[] = await db(
      `trial_reels_queue?estado=eq.pendiente&scheduled_at=lte.${new Date(ahora).toISOString()}` +
        `&order=scheduled_at.asc&limit=1`,
    );
    if (pendientes.length === 0) {
      return responder({ accion: "nada_pendiente" });
    }

    return responder(await crearContenedor(pendientes[0]));
  } catch (e) {
    console.error("Fallo del worker:", e);
    return responder({ error: String(e) }, 500);
  }
});
