import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, RotateCcw, Home } from 'lucide-react';
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

interface ResultadosTestProps {
  preguntas: Pregunta[];
  respuestas: { [key: string]: string };
  onNuevoTest: () => void;
  onVolver: () => void;
}

export const ResultadosTest = ({ preguntas, respuestas, onNuevoTest, onVolver }: ResultadosTestProps) => {
  const aciertos = preguntas.filter(p => respuestas[p.id] === p.respuesta_correcta).length;
  const fallos = preguntas.length - aciertos;
  const porcentaje = Math.round((aciertos / preguntas.length) * 100);

  useEffect(() => {
    const guardarResultados = async () => {
      try {
        // Obtener user_id del usuario autenticado (será null si no hay autenticación)
        const { data: { user } } = await supabase.auth.getUser();
        const userId = user?.id || null;

        // Guardar resultado general del test
        const { error: errorTest } = await supabase
          .from('resultados_tests')
          .insert({
            user_id: userId,
            total_preguntas: preguntas.length,
            respuestas_correctas: aciertos,
            respuestas_incorrectas: fallos,
            porcentaje_acierto: porcentaje,
            tema: preguntas[0]?.tema || 'Varios',
            bloque: preguntas[0]?.bloque || null,
            area: preguntas[0]?.area || 'General',
            acierto: porcentaje >= 50
          });

        if (errorTest) {
          console.error('Error al guardar resultado del test:', errorTest);
        }

        // Guardar respuestas individuales
        for (const pregunta of preguntas) {
          const esCorrecta = respuestas[pregunta.id] === pregunta.respuesta_correcta;
          
          const { error: errorRespuesta } = await supabase
            .from('respuestas_usuario')
            .insert({
              user_id: userId,
              area: pregunta.area,
              tema: pregunta.tema,
              subtema: pregunta.bloque,
              pregunta_id: pregunta.id,
              acertada: esCorrecta,
              origen: 'test'
            });

          if (errorRespuesta) {
            console.error('Error al guardar respuesta:', errorRespuesta);
          }
        }
      } catch (error) {
        console.error('Error general al guardar resultados:', error);
      }
    };

    guardarResultados();
  }, [preguntas, respuestas, aciertos, fallos, porcentaje]);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Resumen de resultados */}
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Resultados del Test</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2">
                <CheckCircle className="h-6 w-6 text-green-500" />
                <span className="text-2xl font-bold text-green-500">{aciertos}</span>
              </div>
              <p className="text-sm text-muted-foreground">Respuestas correctas</p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2">
                <XCircle className="h-6 w-6 text-red-500" />
                <span className="text-2xl font-bold text-red-500">{fallos}</span>
              </div>
              <p className="text-sm text-muted-foreground">Respuestas incorrectas</p>
            </div>
            
            <div className="space-y-2">
              <div className={`text-3xl font-bold ${porcentaje >= 70 ? 'text-green-500' : porcentaje >= 50 ? 'text-yellow-500' : 'text-red-500'}`}>
                {porcentaje}%
              </div>
              <p className="text-sm text-muted-foreground">Puntuación final</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detalle de respuestas */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Detalle de respuestas</h3>
        {preguntas.map((pregunta, index) => {
          const respuestaUsuario = respuestas[pregunta.id];
          const esCorrecta = respuestaUsuario === pregunta.respuesta_correcta;
          
          return (
            <Card key={pregunta.id} className={`border-l-4 ${esCorrecta ? 'border-l-green-500' : 'border-l-red-500'}`}>
              <CardHeader>
                <div className="flex items-start gap-3">
                  {esCorrecta ? (
                    <CheckCircle className="h-6 w-6 text-green-500 mt-1 flex-shrink-0" />
                  ) : (
                    <XCircle className="h-6 w-6 text-red-500 mt-1 flex-shrink-0" />
                  )}
                  <div className="flex-1 space-y-2">
                    <CardTitle className="text-lg">
                      Pregunta {index + 1}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {pregunta.pregunta}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3">
                  <div>
                    <span className="font-medium text-green-600">Respuesta correcta: </span>
                    <span>{pregunta.respuesta_correcta}</span>
                  </div>
                  <div>
                    <span className={`font-medium ${esCorrecta ? 'text-green-600' : 'text-red-600'}`}>
                      Tu respuesta: 
                    </span>
                    <span className="ml-1">{respuestaUsuario}</span>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <span className="font-medium">Justificación: </span>
                    <span className="text-sm">{pregunta.justificacion}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Botones de acción */}
      <div className="flex gap-4 justify-center">
        <Button variant="outline" onClick={onVolver} className="gap-2">
          <Home className="h-4 w-4" />
          Volver al inicio
        </Button>
        <Button onClick={onNuevoTest} className="gap-2">
          <RotateCcw className="h-4 w-4" />
          Hacer otro test
        </Button>
      </div>
    </div>
  );
};