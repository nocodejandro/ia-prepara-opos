-- Add nivel column to preguntas table
ALTER TABLE public.preguntas 
ADD COLUMN nivel text CHECK (nivel IN ('basico', 'intermedio', 'avanzado'));