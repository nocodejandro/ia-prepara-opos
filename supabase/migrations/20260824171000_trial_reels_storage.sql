-- Bucket público donde se rehospedan los vídeos que vienen de Drive.
--
-- Tiene que ser público: el fetcher de Meta descarga el .mp4 sin credenciales.
-- Solo contiene los vídeos que ya van a publicarse en Instagram, así que no
-- expone nada que no vaya a ser público de todos modos minutos después.

INSERT INTO storage.buckets (id, name, public)
VALUES ('trial-reels', 'trial-reels', true)
ON CONFLICT (id) DO UPDATE SET public = true;
