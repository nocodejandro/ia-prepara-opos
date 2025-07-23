-- Create table for test questions
CREATE TABLE public.preguntas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  area TEXT NOT NULL,
  tema TEXT NOT NULL,
  titulo TEXT NOT NULL,
  pregunta TEXT NOT NULL,
  opciones JSONB NOT NULL,
  respuesta_correcta TEXT NOT NULL CHECK (respuesta_correcta IN ('a', 'b', 'c', 'd')),
  justificacion TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.preguntas ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access (since it's a study platform)
CREATE POLICY "Anyone can view questions" 
ON public.preguntas 
FOR SELECT 
USING (true);

-- Create policy for inserting questions (for your n8n workflow)
CREATE POLICY "Anyone can create questions" 
ON public.preguntas 
FOR INSERT 
WITH CHECK (true);

-- Create indexes for better performance on filtering
CREATE INDEX idx_preguntas_area ON public.preguntas(area);
CREATE INDEX idx_preguntas_tema ON public.preguntas(tema);
CREATE INDEX idx_preguntas_area_tema ON public.preguntas(area, tema);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_preguntas_updated_at
BEFORE UPDATE ON public.preguntas
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();