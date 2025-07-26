-- Create table to store test results
CREATE TABLE public.resultados_tests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  area TEXT NOT NULL,
  tema TEXT NOT NULL,
  bloque TEXT,
  total_preguntas INTEGER NOT NULL,
  respuestas_correctas INTEGER NOT NULL,
  respuestas_incorrectas INTEGER NOT NULL,
  porcentaje_acierto DECIMAL(5,2) NOT NULL,
  fecha_test TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.resultados_tests ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own test results" 
ON public.resultados_tests 
FOR SELECT 
USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can create their own test results" 
ON public.resultados_tests 
FOR INSERT 
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Create index for better performance
CREATE INDEX idx_resultados_tests_user_area ON public.resultados_tests(user_id, area);
CREATE INDEX idx_resultados_tests_user_bloque ON public.resultados_tests(user_id, bloque);