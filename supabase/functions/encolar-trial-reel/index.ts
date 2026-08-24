// Encola trial reels: mete filas en trial_reels_queue con su hora de publicación.
//
// Por qué rehospeda el vídeo en vez de pasarle a Meta la URL de Drive:
// el fetcher de Meta falla con redirecciones y con páginas intermedias, y toda
// URL de descarga de Drive redirige. Aquí se descarga servidor a servidor (donde
// las redirecciones no molestan) y se sirve desde Storage como un .mp4 plano.
//
// Protegida por ENCOLAR_SECRET porque la anon key del proyecto es pública: sin
// ese muro, cualquiera podría programar publicaciones en la cuenta.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-encolar-secret",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const ENCOLAR_SECRET = Deno.env.get("ENCOLAR_SECRET") ?? "";
const BUCKET = "trial-reels";

interface Entrada {
  titulo: string;
  drive_file_id?: string;
  video_url?: string;
  caption?: string;
  scheduled_at: string;           // ISO 8601 con zona horaria
  tanda?: string;
  graduation_strategy?: "MANUAL" | "SS_PERFORMANCE";
}

/** Descarga el vídeo y lo deja en Storage con una URL pública limpia. */
async function rehospedar(entrada: Entrada): Promise<string> {
  const origen = entrada.drive_file_id
    ? `https://drive.usercontent.google.com/download?id=${entrada.drive_file_id}&export=download`
    : entrada.video_url!;

  const descarga = await fetch(origen, { redirect: "follow" });
  if (!descarga.ok) {
    throw new Error(`No se pudo descargar el vídeo (${descarga.status}) desde ${origen}`);
  }

  // Drive devuelve HTML en vez del binario cuando el archivo no es accesible
  // por enlace. Detectarlo aquí ahorra un fallo opaco de Meta 20 minutos después.
  const tipo = descarga.headers.get("content-type") ?? "";
  if (tipo.includes("text/html")) {
    throw new Error(
      `Drive devolvió HTML en vez del vídeo: el archivo ${entrada.drive_file_id} ` +
        `no es accesible por enlace. Ponlo en "cualquiera con el enlace".`,
    );
  }

  const bytes = new Uint8Array(await descarga.arrayBuffer());
  const nombre = `${Date.now()}-${entrada.titulo.replace(/[^a-zA-Z0-9._-]/g, "_")}.mp4`;

  const subida = await fetch(`${SUPABASE_URL}/storage/v1/object/${BUCKET}/${nombre}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${SERVICE_KEY}`,
      "Content-Type": "video/mp4",
      "x-upsert": "true",
    },
    body: bytes,
  });
  if (!subida.ok) {
    throw new Error(`Subida a Storage fallida (${subida.status}): ${await subida.text()}`);
  }

  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${nombre}`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const responder = (cuerpo: unknown, status = 200) =>
    new Response(JSON.stringify(cuerpo), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  if (!ENCOLAR_SECRET || req.headers.get("x-encolar-secret") !== ENCOLAR_SECRET) {
    return responder({ error: "No autorizado" }, 401);
  }

  try {
    const cuerpo = await req.json();
    const entradas: Entrada[] = Array.isArray(cuerpo) ? cuerpo : cuerpo.items ?? [cuerpo];

    const resultados = [];
    for (const entrada of entradas) {
      if (!entrada.titulo || !entrada.scheduled_at) {
        resultados.push({ titulo: entrada.titulo ?? "(sin título)", error: "faltan titulo o scheduled_at" });
        continue;
      }
      if (!entrada.drive_file_id && !entrada.video_url) {
        resultados.push({ titulo: entrada.titulo, error: "hace falta drive_file_id o video_url" });
        continue;
      }

      try {
        const video_url = await rehospedar(entrada);

        const [fila] = await (async () => {
          const res = await fetch(`${SUPABASE_URL}/rest/v1/trial_reels_queue`, {
            method: "POST",
            headers: {
              apikey: SERVICE_KEY,
              Authorization: `Bearer ${SERVICE_KEY}`,
              "Content-Type": "application/json",
              Prefer: "return=representation",
            },
            body: JSON.stringify({
              titulo: entrada.titulo,
              drive_file_id: entrada.drive_file_id ?? null,
              video_url,
              caption: entrada.caption ?? "",
              scheduled_at: entrada.scheduled_at,
              tanda: entrada.tanda ?? null,
              graduation_strategy: entrada.graduation_strategy ?? "MANUAL",
            }),
          });
          if (!res.ok) throw new Error(`Insert fallido (${res.status}): ${await res.text()}`);
          return await res.json();
        })();

        resultados.push({
          titulo: entrada.titulo,
          id: fila.id,
          scheduled_at: fila.scheduled_at,
          video_url,
        });
        console.log(`Encolado [${entrada.titulo}] para ${fila.scheduled_at}`);
      } catch (e) {
        resultados.push({ titulo: entrada.titulo, error: String(e) });
      }
    }

    const fallos = resultados.filter((r) => "error" in r).length;
    return responder({ encolados: resultados.length - fallos, fallos, resultados });
  } catch (e) {
    console.error("Fallo encolando:", e);
    return responder({ error: String(e) }, 500);
  }
});
