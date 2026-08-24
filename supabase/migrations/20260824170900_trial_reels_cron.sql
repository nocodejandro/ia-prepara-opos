-- Cron que despierta al worker de trial reels cada 2 minutos.
--
-- Cada tick avanza UN paso de UNA fila. Dos minutos es el compromiso: lo bastante
-- frecuente para que un vídeo ya procesado se publique casi a su hora, y lo
-- bastante espaciado para no malgastar invocaciones. La separación real entre
-- publicaciones la imponen scheduled_at y el guardarraíl de 5 minutos del worker,
-- no esta frecuencia.

CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_net  WITH SCHEMA extensions;

-- Idempotente: permite reaplicar la migración sin duplicar el job.
SELECT cron.unschedule('publicar-trial-reels')
WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'publicar-trial-reels');

SELECT cron.schedule(
  'publicar-trial-reels',
  '*/2 * * * *',
  $$
  SELECT net.http_post(
    url     := 'https://dpcmcrbfihccafwaiefs.supabase.co/functions/v1/publicar-trial-reel',
    headers := '{"Content-Type": "application/json"}'::jsonb,
    body    := '{}'::jsonb,
    timeout_milliseconds := 55000
  );
  $$
);
