import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, RefreshCw, BookOpen, TrendingDown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface TarjetaRepaso {
  id: string;
  area: string;
  tema: string;
  totalErrores: number;
  porcentajeError: number;
  ultimoError: string;
}

interface TarjetasRepasoProps {
  onVolver: () => void;
}

export const TarjetasRepaso = ({ onVolver }: TarjetasRepasoProps) => {
  const [tarjetas, setTarjetas] = useState<TarjetaRepaso[]>([]);
  const [loading, setLoading] = useState(true);
  const [generandoEjercicios, setGenerandoEjercicios] = useState<string | null>(null);

  useEffect(() => {
    cargarTarjetasRepaso();
  }, []);

  const cargarTarjetasRepaso = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data: respuestas, error } = await supabase
        .from('respuestas_usuario')
        .select('area, tema, acertada, fecha_respuesta')
        .eq('user_id', user?.id || null)
        .eq('acertada', false)
        .order('fecha_respuesta', { ascending: false });

      if (error) {
        console.error('Error al cargar respuestas:', error);
        return;
      }

      if (!respuestas || respuestas.length === 0) {
        setTarjetas([]);
        return;
      }

      // Agrupar por área y tema
      const agrupadas: { [key: string]: any } = {};
      
      respuestas.forEach(respuesta => {
        const clave = `${respuesta.area}-${respuesta.tema}`;
        if (!agrupadas[clave]) {
          agrupadas[clave] = {
            area: respuesta.area,
            tema: respuesta.tema,
            errores: 0,
            ultimoError: respuesta.fecha_respuesta
          };
        }
        agrupadas[clave].errores += 1;
        if (respuesta.fecha_respuesta > agrupadas[clave].ultimoError) {
          agrupadas[clave].ultimoError = respuesta.fecha_respuesta;
        }
      });

      // Obtener total de respuestas por área y tema para calcular porcentaje
      const { data: todasRespuestas, error: errorTotal } = await supabase
        .from('respuestas_usuario')
        .select('area, tema')
        .eq('user_id', user?.id || null);

      if (errorTotal) {
        console.error('Error al cargar total respuestas:', errorTotal);
        return;
      }

      const totalPorTema: { [key: string]: number } = {};
      todasRespuestas?.forEach(respuesta => {
        const clave = `${respuesta.area}-${respuesta.tema}`;
        totalPorTema[clave] = (totalPorTema[clave] || 0) + 1;
      });

      // Crear tarjetas de repaso
      const tarjetasRepaso: TarjetaRepaso[] = Object.entries(agrupadas)
        .map(([clave, datos]) => ({
          id: clave,
          area: datos.area,
          tema: datos.tema,
          totalErrores: datos.errores,
          porcentajeError: Math.round((datos.errores / (totalPorTema[clave] || 1)) * 100),
          ultimoError: datos.ultimoError
        }))
        .filter(tarjeta => tarjeta.totalErrores >= 2) // Solo mostrar temas con 2+ errores
        .sort((a, b) => b.porcentajeError - a.porcentajeError) // Ordenar por porcentaje de error
        .slice(0, 10); // Máximo 10 tarjetas

      setTarjetas(tarjetasRepaso);
    } catch (error) {
      console.error('Error al cargar tarjetas de repaso:', error);
    } finally {
      setLoading(false);
    }
  };

  const generarEjerciciosRepaso = async (tarjeta: TarjetaRepaso) => {
    setGenerandoEjercicios(tarjeta.id);
    
    try {
      const { data, error } = await supabase.functions.invoke('mentor-ia-chat', {
        body: {
          action: 'generateReviewExercises',
          area: tarjeta.area,
          tema: tarjeta.tema,
          totalErrores: tarjeta.totalErrores
        }
      });

      if (error) throw error;

      // Aquí podrías manejar la respuesta de n8n si es necesario
      console.log('Ejercicios generados:', data);
      
    } catch (error) {
      console.error('Error al generar ejercicios:', error);
    } finally {
      setGenerandoEjercicios(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Analizando tus errores...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="sm" onClick={onVolver}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Ejercicios de Repaso</h1>
          <p className="text-muted-foreground">
            Practica en las áreas donde más necesitas mejorar
          </p>
        </div>
      </div>

      {tarjetas.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">¡Excelente trabajo!</h3>
            <p className="text-muted-foreground">
              No tienes áreas que requieran repaso especial. Sigue practicando para mantener tu buen rendimiento.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tarjetas.map((tarjeta) => (
            <Card key={tarjeta.id} className="hover:shadow-lg transition-shadow duration-200">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingDown className="h-5 w-5 text-red-500" />
                    <span className="text-lg">{tarjeta.tema}</span>
                  </div>
                  <Badge variant={tarjeta.porcentajeError > 50 ? 'destructive' : 'secondary'}>
                    {tarjeta.porcentajeError}%
                  </Badge>
                </CardTitle>
                <p className="text-sm text-muted-foreground">{tarjeta.area}</p>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="font-medium">Errores totales:</span>
                    <p className="text-red-600 font-semibold">{tarjeta.totalErrores}</p>
                  </div>
                  <div>
                    <span className="font-medium">Último error:</span>
                    <p className="text-muted-foreground">
                      {new Date(tarjeta.ultimoError).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <Button 
                  className="w-full"
                  onClick={() => generarEjerciciosRepaso(tarjeta)}
                  disabled={generandoEjercicios === tarjeta.id}
                >
                  {generandoEjercicios === tarjeta.id ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Generando...
                    </>
                  ) : (
                    <>
                      <BookOpen className="h-4 w-4 mr-2" />
                      Repasar ahora
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};