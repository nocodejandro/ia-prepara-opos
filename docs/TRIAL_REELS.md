# Publicación automática de Trial Reels

Sube vídeos de Google Drive a Instagram **como Trial Reels**, a la hora que se
programe, sin intervención manual.

Un *trial reel* solo se reparte entre **no seguidores**. Sirve para medir un
gancho con datos reales antes de arriesgar el feed. Grid y trials son sistemas
separados: el mismo archivo puede ir a los dos sin penalización por duplicado.

## Por qué no vale Composio ni Metricool

| Vía | Problema |
|---|---|
| **Composio** | Su herramienta `INSTAGRAM_POST_IG_USER_MEDIA` tiene el esquema cerrado (`additionalProperties: false`) y no incluye `trial_params`. Publica reels normales, no trials. Tampoco expone una llamada cruda a la Graph API. |
| **Metricool** | Sí soporta `TRIAL_REEL`, pero el plan gratuito tapa en 20 publicaciones por semana. |

Lo único que convierte un reel en trial reel es el parámetro `trial_params` de la
Graph API. Por eso este sistema llama a la API directamente.

## Cómo funciona

```
Google Drive (compartido por enlace)
      │  descarga servidor a servidor
      ▼
encolar-trial-reel ──► Supabase Storage (bucket público `trial-reels`)
      │                          │
      ▼                          ▼
trial_reels_queue        URL limpia .mp4
 (con scheduled_at)
      │
      │  pg_cron cada 2 min
      ▼
publicar-trial-reel ──► Graph API: /media (trial_params) → poll → /media_publish
      ▼
        Trial Reel publicado
```

El worker es una **máquina de estados**, no un proceso que espera:

```
pendiente ──crear contenedor──► subiendo ──publicar──► publicado
                                    │
                                    └──────────────────► error
```

Meta tarda 30-120 s en procesar un vídeo. Una Edge Function que se quedara
esperando agotaría su tiempo, así que cada tick de cron avanza un solo paso y el
estado vive en la tabla.

### Por qué se rehospeda el vídeo

El fetcher de Meta falla con redirecciones y páginas intermedias, y **toda** URL
de descarga de Drive redirige. La función de encolado descarga el vídeo desde el
servidor (donde las redirecciones no importan) y lo sirve desde Storage como un
`.mp4` plano. Si Drive devuelve HTML en vez del binario, el encolador lo detecta
al momento en lugar de dejar que Meta falle de forma opaca 20 minutos después.

## Reglas de plataforma que impone el worker

Salen de la metodología F100K (`trial-reels-lab-f100k`) y son guardarraíles
duros, no sugerencias:

| Regla | Valor | Ajustable con |
|---|---|---|
| Máximo de trial reels al día | 5 | `TRIAL_REELS_MAX_POR_DIA` |
| Separación mínima entre publicaciones | 5 min | `TRIAL_REELS_MIN_MINUTOS` |
| Reintentos antes de marcar error | 3 | — |

Pasarse de 5 al día dispara el aviso de *"tu trial reel no tendrá mucho
alcance"*. Menos de 5 minutos entre variantes y compiten entre sí por la misma
ventana de distribución.

Un contenedor que falla **no se reutiliza**: Meta exige crear uno nuevo. Por eso
al fallar se limpia `ig_container_id` y la fila vuelve a `pendiente`.

## Requisitos de la cuenta

- Cuenta **Business o Creator** (aquí: `@alejandro_con_ia`, tipo `MEDIA_CREATOR`)
- **1.000 seguidores mínimo** para publicar trial reels (aquí: 2.052)
- Cuota de publicación de la Graph API: 100 cada 24 h

## Instalación

### 1. Secretos de las Edge Functions

En **Supabase → Edge Functions → Secrets**:

| Secreto | Valor |
|---|---|
| `IG_USER_ID` | `28452546977664791` |
| `IG_ACCESS_TOKEN` | Token con permiso `instagram_business_content_publish` |
| `ENCOLAR_SECRET` | Una cadena larga aleatoria, la que quieras |
| `IG_GRAPH_HOST` | *(opcional)* `graph.instagram.com` por defecto; usa `graph.facebook.com` si el token es de Facebook Login |
| `WORKER_SECRET` | *(opcional)* endurece el worker; si se pone, el cron debe mandar la cabecera `x-worker-secret` |

`SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` los inyecta Supabase solo.

### 2. Bucket de Storage

Crear un bucket **público** llamado `trial-reels`.

### 3. Migraciones y despliegue

```bash
supabase db push
supabase functions deploy publicar-trial-reel
supabase functions deploy encolar-trial-reel
```

### 4. Los vídeos de Drive

La carpeta con los vídeos debe estar en **"cualquiera con el enlace"**. Los
archivos siguen sin ser indexables, pero el servidor puede descargarlos.

## Uso

### Encolar una tanda

```bash
curl -X POST \
  https://dpcmcrbfihccafwaiefs.supabase.co/functions/v1/encolar-trial-reel \
  -H "Content-Type: application/json" \
  -H "x-encolar-secret: $ENCOLAR_SECRET" \
  -d '{
    "items": [
      {
        "titulo": "V1_memoria_de_pez",
        "drive_file_id": "1yO_WzM3QQX6xKB5mPa_0ttcJzSkldItf",
        "caption": "Tu memoria no falla. Falla tu método.",
        "scheduled_at": "2026-08-25T10:00:00+01:00",
        "tanda": "24-agosto"
      },
      {
        "titulo": "V2_diez_horas_sin_avanzar",
        "drive_file_id": "17gZAVpg5Wgagcr6B8fM0XD9o9usbId-3",
        "caption": "Tu memoria no falla. Falla tu método.",
        "scheduled_at": "2026-08-25T10:05:00+01:00",
        "tanda": "24-agosto"
      }
    ]
  }'
```

Notas:

- `scheduled_at` **con zona horaria explícita** (Canarias es `+01:00` en verano,
  `+00:00` en invierno). Sin ella se interpreta en UTC y la publicación se
  desvía una hora.
- Las variantes de una misma tanda van separadas **5 minutos**.
- `graduation_strategy` por defecto es `MANUAL`: el reel se queda en trial hasta
  que lo gradúes tú desde la app. Con `SS_PERFORMANCE` Meta lo gradúa solo si
  rinde bien entre no seguidores.
- La misma caption en las 4 variantes está permitida y no cuenta como duplicado.
  Lo único que debe cambiar son los primeros 2-3 segundos visuales.

### Ver el estado de la cola

```sql
SELECT titulo, estado, scheduled_at, published_at, permalink, ultimo_error
FROM trial_reels_queue
ORDER BY scheduled_at DESC;
```

### Cuándo empujar un ganador al grid

Dos reglas, la que llegue primero:

- **Regla de 48 h** — empujado dentro de las primeras 48 h, entra al feed de tus
  seguidores como post normal y recibe re-engagement.
- **Regla del 25 %** — no dejar que llegue al día en que sumó menos del 25 % de
  vistas respecto al anterior. Pasado ese punto, empujarlo ya no rescata nada.

Para comparar variantes no basta con las vistas: mirar tiempo medio de
reproducción, tasa de skip, forma de la curva de retención (debe aplanarse, no
seguir cayendo) y comentarios.
