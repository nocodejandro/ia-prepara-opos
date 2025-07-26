import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, TrendingDown, TrendingUp } from 'lucide-react';

interface ResultadoTest {
  id: string;
  area: string;
  tema: string;
  bloque: string | null;
  total_preguntas: number;
  respuestas_correctas: number;
  respuestas_incorrectas: number;
  porcentaje_acierto: number;
  fecha_test: string;
}

interface EstadisticasProps {
  onVolver: () => void;
}

export const Estadisticas = ({ onVolver }: EstadisticasProps) => {
  const [resultados, setResultados] = useState<ResultadoTest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarResultados();
  }, []);

  const cargarResultados = async () => {
    try {
      const { data, error } = await supabase
        .from('resultados_tests')
        .select('*')
        .order('fecha_test', { ascending: false });

      if (error) throw error;
      setResultados(data || []);
    } catch (error) {
      console.error('Error cargando resultados:', error);
    } finally {
      setLoading(false);
    }
  };

  // Agrupar resultados por bloque/área
  const estadisticasPorBloque = resultados.reduce((acc, resultado) => {
    const clave = resultado.bloque || resultado.area;
    if (!acc[clave]) {
      acc[clave] = {
        totalTests: 0,
        totalPreguntas: 0,
        totalCorrectas: 0,
        temas: {}
      };
    }

    acc[clave].totalTests++;
    acc[clave].totalPreguntas += resultado.total_preguntas;
    acc[clave].totalCorrectas += resultado.respuestas_correctas;

    // Estadísticas por tema
    if (!acc[clave].temas[resultado.tema]) {
      acc[clave].temas[resultado.tema] = {
        totalTests: 0,
        totalPreguntas: 0,
        totalCorrectas: 0
      };
    }

    acc[clave].temas[resultado.tema].totalTests++;
    acc[clave].temas[resultado.tema].totalPreguntas += resultado.total_preguntas;
    acc[clave].temas[resultado.tema].totalCorrectas += resultado.respuestas_correctas;

    return acc;
  }, {} as Record<string, any>);

  const calcularPorcentaje = (correctas: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((correctas / total) * 100);
  };

  const getColorPorcentaje = (porcentaje: number) => {
    if (porcentaje >= 80) return 'text-green-600';
    if (porcentaje >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getIconPorcentaje = (porcentaje: number) => {
    if (porcentaje >= 70) return <TrendingUp className="h-4 w-4 text-green-600" />;
    return <TrendingDown className="h-4 w-4 text-red-600" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-gray-600">Cargando estadísticas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            size="icon"
            onClick={onVolver}
            className="h-10 w-10"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Estadísticas de Rendimiento</h1>
            <p className="text-gray-600">Analiza tu progreso por bloques y temas</p>
          </div>
        </div>

        {resultados.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-gray-500 text-lg">
                Aún no tienes resultados de tests.
              </p>
              <p className="text-gray-400 mt-2">
                Completa algunos tests para ver tus estadísticas aquí.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Resumen general */}
            <Card>
              <CardHeader>
                <CardTitle>Resumen General</CardTitle>
                <CardDescription>Vista global de tu rendimiento</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">{resultados.length}</p>
                    <p className="text-gray-600">Tests Completados</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">
                      {resultados.reduce((sum, r) => sum + r.total_preguntas, 0)}
                    </p>
                    <p className="text-gray-600">Preguntas Totales</p>
                  </div>
                  <div className="text-center">
                    <p className={`text-2xl font-bold ${getColorPorcentaje(
                      calcularPorcentaje(
                        resultados.reduce((sum, r) => sum + r.respuestas_correctas, 0),
                        resultados.reduce((sum, r) => sum + r.total_preguntas, 0)
                      )
                    )}`}>
                      {calcularPorcentaje(
                        resultados.reduce((sum, r) => sum + r.respuestas_correctas, 0),
                        resultados.reduce((sum, r) => sum + r.total_preguntas, 0)
                      )}%
                    </p>
                    <p className="text-gray-600">Acierto Global</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Estadísticas por bloque */}
            <div className="grid gap-6">
              {Object.entries(estadisticasPorBloque).map(([bloque, stats]) => {
                const porcentajeBloque = calcularPorcentaje(stats.totalCorrectas, stats.totalPreguntas);
                
                return (
                  <Card key={bloque}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          {bloque}
                          {getIconPorcentaje(porcentajeBloque)}
                        </CardTitle>
                        <div className={`text-lg font-bold ${getColorPorcentaje(porcentajeBloque)}`}>
                          {porcentajeBloque}%
                        </div>
                      </div>
                      <CardDescription>
                        {stats.totalTests} tests • {stats.totalPreguntas} preguntas
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="mb-4">
                        <Progress value={porcentajeBloque} className="h-2" />
                      </div>
                      
                      {/* Estadísticas por tema dentro del bloque */}
                      <div className="space-y-3">
                        <h4 className="font-medium text-gray-900">Rendimiento por tema:</h4>
                        <div className="grid gap-3">
                          {Object.entries(stats.temas).map(([tema, temStats]: [string, any]) => {
                            const porcentajeTema = calcularPorcentaje(temStats.totalCorrectas, temStats.totalPreguntas);
                            
                            return (
                              <div key={tema} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex-1">
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="font-medium text-sm">{tema}</span>
                                    <span className={`text-sm font-bold ${getColorPorcentaje(porcentajeTema)}`}>
                                      {porcentajeTema}%
                                    </span>
                                  </div>
                                  <Progress value={porcentajeTema} className="h-1" />
                                  <p className="text-xs text-gray-500 mt-1">
                                    {temStats.totalCorrectas}/{temStats.totalPreguntas} correctas
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};