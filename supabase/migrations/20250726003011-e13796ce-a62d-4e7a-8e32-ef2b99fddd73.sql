-- Agregar columna bloque a la tabla preguntas para la estructura de Guardia Civil
ALTER TABLE public.preguntas ADD COLUMN bloque TEXT;

-- Crear tabla para almacenar la estructura de bloques y temas de Guardia Civil
CREATE TABLE public.bloques_guardia_civil (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  bloque_numero INTEGER NOT NULL,
  bloque_nombre TEXT NOT NULL,
  tema_numero INTEGER NOT NULL,
  tema_codigo TEXT NOT NULL,
  tema_nombre TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(bloque_numero, tema_numero)
);

-- Habilitar RLS en la nueva tabla
ALTER TABLE public.bloques_guardia_civil ENABLE ROW LEVEL SECURITY;

-- Crear política para que todos puedan ver los bloques y temas
CREATE POLICY "Anyone can view bloques and temas" 
ON public.bloques_guardia_civil 
FOR SELECT 
USING (true);

-- Insertar la estructura de bloques y temas de Guardia Civil
INSERT INTO public.bloques_guardia_civil (bloque_numero, bloque_nombre, tema_numero, tema_codigo, tema_nombre) VALUES
-- Bloque 1: Ciencias Jurídicas
(1, 'Ciencias Jurídicas', 1, 'T1', 'Derechos Humanos'),
(1, 'Ciencias Jurídicas', 2, 'T2', 'Igualdad Efectiva de Mujeres y Hombres'),
(1, 'Ciencias Jurídicas', 3, 'T3', 'Prevención de Riesgos Laborales'),
(1, 'Ciencias Jurídicas', 4, 'T4', 'Derecho Constitucional'),
(1, 'Ciencias Jurídicas', 5, 'T5', 'Derecho de la Unión Europea'),
(1, 'Ciencias Jurídicas', 6, 'T6', 'Instituciones Internacionales'),
(1, 'Ciencias Jurídicas', 7, 'T7', 'Derecho Civil'),
(1, 'Ciencias Jurídicas', 8, 'T8', 'Derecho Penal'),
(1, 'Ciencias Jurídicas', 9, 'T9', 'Derecho Procesal Penal'),
(1, 'Ciencias Jurídicas', 10, 'T10', 'Derecho Administrativo'),
(1, 'Ciencias Jurídicas', 11, 'T11', 'Protección de Datos'),
(1, 'Ciencias Jurídicas', 12, 'T12', 'Extranjería e Inmigración'),
(1, 'Ciencias Jurídicas', 13, 'T13', 'Seguridad Pública y Privada'),
(1, 'Ciencias Jurídicas', 14, 'T14', 'Ministerio del Interior y Ministerio de Defensa'),
(1, 'Ciencias Jurídicas', 15, 'T15', 'Fuerzas y Cuerpos de Seguridad. Guardia Civil'),

-- Bloque 2: Materias Socio-Culturales
(2, 'Materias Socio-Culturales', 16, 'T16', 'Protección Civil, Desarrollo Sostenible, Eficiencia Energética'),
(2, 'Materias Socio-Culturales', 17, 'T17', 'Tecnologías de la Información y la Comunicación'),
(2, 'Materias Socio-Culturales', 18, 'T18', 'Topografía'),
(2, 'Materias Socio-Culturales', 19, 'T19', 'Deontología Profesional'),
(2, 'Materias Socio-Culturales', 20, 'T20', 'Responsabilidad Penal de los Menores'),
(2, 'Materias Socio-Culturales', 21, 'T21', 'Protección Integral contra la Violencia de Género'),

-- Bloque 3: Materias Técnico-Científicas
(3, 'Materias Técnico-Científicas', 22, 'T22', 'Armas y Explosivos'),
(3, 'Materias Técnico-Científicas', 23, 'T23', 'Derecho Fiscal');

-- Actualizar la política de preguntas para incluir las operaciones necesarias para n8n
CREATE POLICY "Anyone can update questions" 
ON public.preguntas 
FOR UPDATE 
USING (true);

-- Crear índices para mejorar el rendimiento de las consultas
CREATE INDEX idx_preguntas_bloque ON public.preguntas(bloque);
CREATE INDEX idx_bloques_numero ON public.bloques_guardia_civil(bloque_numero);
CREATE INDEX idx_bloques_tema_codigo ON public.bloques_guardia_civil(tema_codigo);