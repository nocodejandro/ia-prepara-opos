import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Pregunta {
  id: string;
  pregunta: string;
  opciones: string[];
  respuesta_correcta: string;
  justificacion: string;
  area: string;
  tema: string;
  bloque?: string;
}

interface AreasYTemas {
  [area: string]: string[];
}

interface BloqueGuardiaCivil {
  bloque_numero: number;
  bloque_nombre: string;
  temas: {
    tema_numero: number;
    tema_codigo: string;
    tema_nombre: string;
  }[];
}

export const usePreguntas = () => {
  const [preguntas, setPreguntas] = useState<Pregunta[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const obtenerPreguntas = async (filtros: {
    area?: string;
    tema?: string;
    bloque?: string;
    limit?: number;
  }) => {
    setLoading(true);
    setError(null);
    
    try {
      let query = supabase
        .from('preguntas')
        .select('*');

      if (filtros.area) {
        query = query.eq('area', filtros.area);
      }
      
      if (filtros.tema) {
        query = query.eq('tema', filtros.tema);
      }
      
      if (filtros.bloque) {
        query = query.eq('bloque', filtros.bloque);
      }

      if (filtros.limit) {
        query = query.limit(filtros.limit);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Mezclar las preguntas aleatoriamente
      const preguntasMezcladas = data?.sort(() => Math.random() - 0.5) || [];
      
      setPreguntas(preguntasMezcladas);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  return {
    preguntas,
    loading,
    error,
    obtenerPreguntas
  };
};

export const useAreasYTemas = () => {
  const [areasYTemas, setAreasYTemas] = useState<AreasYTemas>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const obtenerAreasYTemas = async () => {
      try {
        const { data, error } = await supabase
          .from('preguntas')
          .select('area, tema');

        if (error) throw error;

        const agrupadas: AreasYTemas = {};
        data?.forEach(item => {
          if (!agrupadas[item.area]) {
            agrupadas[item.area] = [];
          }
          if (!agrupadas[item.area].includes(item.tema)) {
            agrupadas[item.area].push(item.tema);
          }
        });

        setAreasYTemas(agrupadas);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar areas y temas');
      } finally {
        setLoading(false);
      }
    };

    obtenerAreasYTemas();
  }, []);

  return { areasYTemas, loading, error };
};

export const useBloquesGuardiaCivil = () => {
  const [bloques, setBloques] = useState<BloqueGuardiaCivil[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const obtenerBloques = async () => {
      try {
        const { data, error } = await supabase
          .from('bloques_guardia_civil')
          .select('*')
          .order('bloque_numero', { ascending: true })
          .order('tema_numero', { ascending: true });

        if (error) throw error;

        // Agrupar por bloques
        const bloquesAgrupados: { [key: number]: BloqueGuardiaCivil } = {};
        
        data?.forEach(item => {
          if (!bloquesAgrupados[item.bloque_numero]) {
            bloquesAgrupados[item.bloque_numero] = {
              bloque_numero: item.bloque_numero,
              bloque_nombre: item.bloque_nombre,
              temas: []
            };
          }
          
          bloquesAgrupados[item.bloque_numero].temas.push({
            tema_numero: item.tema_numero,
            tema_codigo: item.tema_codigo,
            tema_nombre: item.tema_nombre
          });
        });

        setBloques(Object.values(bloquesAgrupados));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar bloques');
      } finally {
        setLoading(false);
      }
    };

    obtenerBloques();
  }, []);

  return { bloques, loading, error };
};