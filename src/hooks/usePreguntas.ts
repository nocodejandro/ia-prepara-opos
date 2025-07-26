import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Pregunta {
  id: string;
  area: string;
  tema: string;
  titulo: string;
  pregunta: string;
  opciones: {
    a: string;
    b: string;
    c: string;
    d: string;
  };
  respuesta_correcta: string;
  justificacion: string;
}

export interface FiltrosPreguntas {
  area?: string;
  tema?: string;
  bloque?: string;
}

export interface BloqueGuardiaCivil {
  id: string;
  bloque_numero: number;
  bloque_nombre: string;
  tema_numero: number;
  tema_codigo: string;
  tema_nombre: string;
}

export function usePreguntas(filtros?: FiltrosPreguntas) {
  const [preguntas, setPreguntas] = useState<Pregunta[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPreguntas = async () => {
      try {
        setLoading(true);
        setError(null);

        let query = supabase.from('preguntas').select('*');

        if (filtros?.area) {
          query = query.eq('area', filtros.area);
        }
        
        if (filtros?.tema) {
          query = query.eq('tema', filtros.tema);
        }

        if (filtros?.bloque) {
          query = query.eq('bloque', filtros.bloque);
        }

        const { data, error } = await query.order('created_at', { ascending: false });

        if (error) {
          throw error;
        }

        // Transform the data to match our interface
        const transformedData = (data || []).map(item => ({
          ...item,
          opciones: item.opciones as { a: string; b: string; c: string; d: string; }
        }));
        setPreguntas(transformedData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar preguntas');
      } finally {
        setLoading(false);
      }
    };

    fetchPreguntas();
  }, [filtros?.area, filtros?.tema, filtros?.bloque]);

  return { preguntas, loading, error };
}

export function useAreasYTemas() {
  const [areas, setAreas] = useState<string[]>([]);
  const [temas, setTemas] = useState<{ [area: string]: string[] }>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAreasYTemas = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('preguntas')
          .select('area, tema')
          .order('area')
          .order('tema');

        if (error) throw error;

        const areasUnicas = [...new Set(data?.map(item => item.area) || [])];
        const temasGrouped: { [area: string]: string[] } = {};

        data?.forEach(item => {
          if (!temasGrouped[item.area]) {
            temasGrouped[item.area] = [];
          }
          if (!temasGrouped[item.area].includes(item.tema)) {
            temasGrouped[item.area].push(item.tema);
          }
        });

        // Ordenar temas dentro de cada área
        Object.keys(temasGrouped).forEach(area => {
          temasGrouped[area].sort();
        });

        setAreas(areasUnicas);
        setTemas(temasGrouped);
      } catch (err) {
        console.error('Error al cargar áreas y temas:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAreasYTemas();
  }, []);

  return { areas, temas, loading };
}

export function useBloquesGuardiaCivil() {
  const [bloques, setBloques] = useState<BloqueGuardiaCivil[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchBloques = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('bloques_guardia_civil')
          .select('*')
          .order('bloque_numero')
          .order('tema_numero');

        if (error) throw error;

        setBloques(data || []);
      } catch (err) {
        console.error('Error al cargar bloques:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBloques();
  }, []);

  // Agrupar por bloques
  const bloquesAgrupados = bloques.reduce((acc, item) => {
    const bloqueKey = `${item.bloque_numero}. ${item.bloque_nombre}`;
    if (!acc[bloqueKey]) {
      acc[bloqueKey] = [];
    }
    acc[bloqueKey].push(`${item.tema_codigo}. ${item.tema_nombre}`);
    return acc;
  }, {} as { [bloque: string]: string[] });

  const nombresBloques = Object.keys(bloquesAgrupados);

  return { bloques, bloquesAgrupados, nombresBloques, loading };
}