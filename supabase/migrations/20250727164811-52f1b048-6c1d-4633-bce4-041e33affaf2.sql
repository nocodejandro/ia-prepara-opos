-- Crear tabla mentoria para conectar con n8n
CREATE TABLE public.mentoria (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  pregunta_id TEXT NOT NULL,
  pregunta_texto TEXT NOT NULL,
  justificacion TEXT NOT NULL,
  fallos INTEGER NOT NULL DEFAULT 1,
  ya_enviado BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.mentoria ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para que los usuarios solo vean sus propios datos
CREATE POLICY "Users can view their own mentoria records" 
ON public.mentoria 
FOR SELECT 
USING ((auth.uid() = user_id) OR (user_id IS NULL));

CREATE POLICY "Users can create their own mentoria records" 
ON public.mentoria 
FOR INSERT 
WITH CHECK ((auth.uid() = user_id) OR (user_id IS NULL));

CREATE POLICY "Users can update their own mentoria records" 
ON public.mentoria 
FOR UPDATE 
USING ((auth.uid() = user_id) OR (user_id IS NULL));

-- Crear índices para optimizar consultas
CREATE INDEX idx_mentoria_user_id ON public.mentoria(user_id);
CREATE INDEX idx_mentoria_pregunta_id ON public.mentoria(pregunta_id);
CREATE INDEX idx_mentoria_fallos_enviado ON public.mentoria(fallos, ya_enviado);

-- Crear trigger para actualizar updated_at
CREATE TRIGGER update_mentoria_updated_at
  BEFORE UPDATE ON public.mentoria
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();