-- Crear tabla respuestas_usuario para tracking detallado de cada respuesta
CREATE TABLE public.respuestas_usuario (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  area TEXT NOT NULL,
  tema TEXT NOT NULL,
  subtema TEXT,
  pregunta_id TEXT NOT NULL,
  acertada BOOLEAN NOT NULL,
  fecha_respuesta TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  origen TEXT NOT NULL DEFAULT 'test',
  tiempo_respuesta INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.respuestas_usuario ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Users can view their own responses" 
ON public.respuestas_usuario 
FOR SELECT 
USING ((auth.uid() = user_id) OR (user_id IS NULL));

CREATE POLICY "Users can create their own responses" 
ON public.respuestas_usuario 
FOR INSERT 
WITH CHECK ((auth.uid() = user_id) OR (user_id IS NULL));

-- Índices para mejorar performance
CREATE INDEX idx_respuestas_usuario_user_id ON public.respuestas_usuario(user_id);
CREATE INDEX idx_respuestas_usuario_pregunta_id ON public.respuestas_usuario(pregunta_id);
CREATE INDEX idx_respuestas_usuario_area_tema ON public.respuestas_usuario(area, tema);
CREATE INDEX idx_respuestas_usuario_fecha ON public.respuestas_usuario(fecha_respuesta DESC);