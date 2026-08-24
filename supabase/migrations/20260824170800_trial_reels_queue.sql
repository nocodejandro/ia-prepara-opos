-- Cola de publicación de TRIAL REELS de Instagram.
-- Un trial reel solo se reparte entre NO seguidores: sirve para testear
-- el gancho sin arriesgar el feed. Se publica vía Graph API con trial_params.

-- Helper de updated_at: ya existe en la base (lo usan otras tablas) pero no
-- estaba en ninguna migración. Se redefine idempotente para que esta migración
-- se pueda aplicar sobre una base limpia.
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TYPE public.trial_reel_estado AS ENUM (
  'pendiente',    -- esperando a su hora
  'subiendo',     -- contenedor creado en Meta, procesando el vídeo
  'publicado',
  'error'
);

CREATE TABLE public.trial_reels_queue (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Origen del vídeo
  titulo TEXT NOT NULL,
  drive_file_id TEXT,
  video_url TEXT NOT NULL,          -- URL pública que Meta puede descargar

  -- Contenido del post
  caption TEXT NOT NULL DEFAULT '',
  graduation_strategy TEXT NOT NULL DEFAULT 'MANUAL'
    CHECK (graduation_strategy IN ('MANUAL', 'SS_PERFORMANCE')),

  -- Programación
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  tanda TEXT,                       -- agrupa las variantes A/B/C/D de un mismo material

  -- Estado
  estado public.trial_reel_estado NOT NULL DEFAULT 'pendiente',
  ig_container_id TEXT,
  ig_media_id TEXT,
  permalink TEXT,
  intentos INTEGER NOT NULL DEFAULT 0,
  ultimo_error TEXT,
  published_at TIMESTAMP WITH TIME ZONE,

  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- El worker corre con service_role, que salta RLS. Nadie más entra:
-- la anon key es pública (está en el repo), así que sin políticas la cola
-- queda cerrada a internet y solo el worker la toca.
ALTER TABLE public.trial_reels_queue ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_trial_reels_pendientes
  ON public.trial_reels_queue (estado, scheduled_at);

CREATE INDEX idx_trial_reels_tanda
  ON public.trial_reels_queue (tanda);

CREATE TRIGGER update_trial_reels_queue_updated_at
  BEFORE UPDATE ON public.trial_reels_queue
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
