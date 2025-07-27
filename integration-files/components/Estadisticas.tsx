import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Target, Award, BookOpen } from 'lucide-react';

interface EstadisticasData {
  totalTests: number;
  promedioPorcentaje: number;
  mejorPorcentaje: number;
  totalPreguntas: number;
  estadisticasPorArea: {
    area: string;
    tests: number;
    promedio: number;
    aciertos: number;
    errores: number;
  }[];
}

export const Estadisticas = () => {
  const [estadisticas, setEstadisticas] = useState<EstadisticasData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarEstadisticas = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        // Obtener resultados de tests
        const { data: resultados, error: errorResultados } = await supabase
          .from('resultados_tests')
          .select('*')
          .eq('user_id', user?.id || null);

        if (errorResultados) {
          console.error('Error al cargar resultados:', errorResultados);
          return;
        }

        // Obtener respuestas individuales
        const { data: respuestas, error: errorRespuestas } = await supabase
          .from('respuestas_usuario')
          .select('*')
          .eq('user_id', user?.id || null);

        if (errorRespuestas) {
          console.error('Error al cargar respuestas:', errorRespuestas);
          return;
        }

        if (!resultados || resultados.length === 0) {
          setEstadisticas({
            totalTests: 0,
            promedioPorcentaje: 0,
            mejorPorcentaje: 0,
            totalPreguntas: 0,
            estadisticasPorArea: []
          });
          return;
        }

        // Calcular estadísticas generales
        const totalTests = resultados.length;
        const promedioPorcentaje = resultados.reduce((sum, r) => sum + Number(r.porcentaje_acierto), 0) / totalTests;
        const mejorPorcentaje = Math.max(...resultados.map(r => Number(r.porcentaje_acierto)));
        const totalPreguntas = resultados.reduce((sum, r) => sum + r.total_preguntas, 0);

        // Agrupar por área
        const areaStats: { [area: string]: any } = {};
        
        resultados.forEach(resultado => {
          if (!areaStats[resultado.area]) {
            areaStats[resultado.area] = {
              tests: 0,
              totalPorcentaje: 0,
              aciertos: 0,
              errores: 0
            };
          }
          
          areaStats[resultado.area].tests += 1;
          areaStats[resultado.area].totalPorcentaje += Number(resultado.porcentaje_acierto);
          areaStats[resultado.area].aciertos += resultado.respuestas_correctas;
          areaStats[resultado.area].errores += resultado.respuestas_incorrectas;
        });

        const estadisticasPorArea = Object.entries(areaStats).map(([area, stats]) => ({
          area,
          tests: stats.tests,
          promedio: Math.round(stats.totalPorcentaje / stats.tests),
          aciertos: stats.aciertos,
          errores: stats.errores
        }));

        setEstadisticas({
          totalTests,
          promedioPorcentaje: Math.round(promedioPorcentaje),
          mejorPorcentaje,
          totalPreguntas,
          estadisticasPorArea
        });

      } catch (error) {
        console.error('Error al cargar estadísticas:', error);
      } finally {
        setLoading(false);
      }
    };

    cargarEstadisticas();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando estadísticas...</p>
        </div>
      </div>
    );
  }

  if (!estadisticas || estadisticas.totalTests === 0) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Estadísticas</h1>
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No hay datos disponibles</h3>
            <p className="text-muted-foreground">
              Completa algunos tests para ver tus estadísticas aquí
            </p>
          </div>
        </div>
      </div>
    );
  }

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Estadísticas</h1>
        <p className="text-muted-foreground">Tu progreso y rendimiento en los tests</p>
      </div>

      {/* Resumen general */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tests Realizados</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estadisticas.totalTests}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Promedio General</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estadisticas.promedioPorcentaje}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mejor Puntuación</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estadisticas.mejorPorcentaje}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Preguntas</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estadisticas.totalPreguntas}</div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de barras por área */}
        <Card>
          <CardHeader>
            <CardTitle>Rendimiento por Área</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={estadisticas.estadisticasPorArea}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="area" 
                  angle={-45}
                  textAnchor="end"
                  height={100}
                />
                <YAxis />
                <Tooltip />
                <Bar dataKey="promedio" fill="#0088FE" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gráfico circular de aciertos vs errores */}
        <Card>
          <CardHeader>
            <CardTitle>Distribución Global</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={[
                    {
                      name: 'Aciertos',
                      value: estadisticas.estadisticasPorArea.reduce((sum, area) => sum + area.aciertos, 0)
                    },
                    {
                      name: 'Errores',
                      value: estadisticas.estadisticasPorArea.reduce((sum, area) => sum + area.errores, 0)
                    }
                  ]}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  <Cell fill="#00C49F" />
                  <Cell fill="#FF8042" />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tabla detallada por área */}
      <Card>
        <CardHeader>
          <CardTitle>Detalle por Área</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Área</th>
                  <th className="text-left p-2">Tests</th>
                  <th className="text-left p-2">Promedio</th>
                  <th className="text-left p-2">Aciertos</th>
                  <th className="text-left p-2">Errores</th>
                </tr>
              </thead>
              <tbody>
                {estadisticas.estadisticasPorArea.map((area, index) => (
                  <tr key={area.area} className="border-b">
                    <td className="p-2 font-medium">{area.area}</td>
                    <td className="p-2">{area.tests}</td>
                    <td className="p-2">{area.promedio}%</td>
                    <td className="p-2 text-green-600">{area.aciertos}</td>
                    <td className="p-2 text-red-600">{area.errores}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};