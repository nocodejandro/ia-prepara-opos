import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, RotateCcw, Home } from "lucide-react";
import { Pregunta } from "@/hooks/usePreguntas";
import { supabase } from "@/integrations/supabase/client";

interface ResultadosTestProps {
  preguntas: Pregunta[];
  respuestas: { [preguntaId: string]: string };
  onNuevoTest: () => void;
  onVolver: () => void;
}

export function ResultadosTest({ preguntas, respuestas, onNuevoTest, onVolver }: ResultadosTestProps) {
  const aciertos = preguntas.filter(p => respuestas[p.id] === p.respuesta_correcta).length;
  const fallos = preguntas.length - aciertos;
  const porcentaje = Math.round((aciertos / preguntas.length) * 100);

  // Guardar resultados en la base de datos cuando se cargan los resultados
  useEffect(() => {
    const guardarResultados = async () => {
      if (preguntas.length === 0) return;
      
      console.log('🔍 Iniciando guardado de resultados...', { 
        totalPreguntas: preguntas.length,
        respuestas: Object.keys(respuestas).length 
      });

      // Guardar resultado individual por cada pregunta
      for (const pregunta of preguntas) {
        const esCorrecta = respuestas[pregunta.id] === pregunta.respuesta_correcta;
        
        console.log(`📝 Procesando pregunta ${pregunta.id}:`, {
          esCorrecta,
          respuestaUsuario: respuestas[pregunta.id],
          respuestaCorrecta: pregunta.respuesta_correcta
        });
        
        try {
          // Guardar en resultados_tests
          await supabase
            .from('resultados_tests')
            .insert({
              user_id: null, // Por ahora sin autenticación
              area: pregunta.area,
              tema: pregunta.tema,
              bloque: pregunta.bloque,
              total_preguntas: 1, // Cada fila representa una pregunta individual
              respuestas_correctas: esCorrecta ? 1 : 0,
              respuestas_incorrectas: esCorrecta ? 0 : 1,
              porcentaje_acierto: esCorrecta ? 100 : 0,
              acierto: esCorrecta
            });

          // Guardar en respuestas_usuario para el sistema de repaso
          await supabase
            .from('respuestas_usuario')
            .insert({
              user_id: null, // Por ahora sin autenticación
              pregunta_id: pregunta.id,
              area: pregunta.area,
              tema: pregunta.tema,
              subtema: pregunta.bloque, // bloque de la pregunta va a subtema en respuestas_usuario
              acertada: esCorrecta,
              origen: 'test'
            });

          // Si la respuesta es incorrecta, manejar la tabla mentoria
          if (!esCorrecta) {
            console.log('❌ Respuesta incorrecta, manejando mentoría para:', pregunta.id);
            await manejarMentoria(pregunta);
          } else {
            console.log('✅ Respuesta correcta, no se envía a mentoría');
          }
        } catch (error) {
          console.error('❌ Error guardando resultado:', error);
        }
      }
    };

    // Función para manejar la lógica de mentoría
    const manejarMentoria = async (pregunta: Pregunta) => {
      console.log('🧠 Iniciando manejarMentoria para pregunta:', pregunta.id);
      
      try {
        // Verificar si ya existe un registro para esta pregunta
        console.log('🔍 Consultando registro existente en mentoria...');
        const { data: existente, error: errorConsulta } = await supabase
          .from('mentoria')
          .select('*')
          .eq('pregunta_id', pregunta.id)
          .eq('user_id', null) // Por ahora sin autenticación
          .maybeSingle(); // Cambiado de .single() a .maybeSingle() para evitar errores

        console.log('📊 Resultado consulta mentoria:', { existente, errorConsulta });

        if (errorConsulta) {
          console.error('❌ Error consultando mentoría:', errorConsulta);
          return;
        }

        if (existente) {
          // Actualizar contador de fallos
          const nuevosFallos = existente.fallos + 1;
          console.log(`🔄 Actualizando fallos de ${existente.fallos} a ${nuevosFallos}`);
          
          const { error: errorUpdate } = await supabase
            .from('mentoria')
            .update({ 
              fallos: nuevosFallos,
              updated_at: new Date().toISOString()
            })
            .eq('id', existente.id);

          if (errorUpdate) {
            console.error('❌ Error actualizando mentoría:', errorUpdate);
            return;
          }
          
          console.log('✅ Fallos actualizados correctamente');

          // Si alcanza 3 fallos y no se ha enviado, enviar a n8n
          if (nuevosFallos >= 3 && !existente.ya_enviado) {
            console.log('🚀 Enviando a n8n (3+ fallos alcanzados)');
            await enviarAMentorIA(existente.id, pregunta, nuevosFallos);
          }
        } else {
          // Crear nuevo registro
          console.log('➕ Creando nuevo registro en mentoria');
          const nuevoRegistro = {
            user_id: null, // Por ahora sin autenticación
            pregunta_id: pregunta.id,
            pregunta_texto: pregunta.pregunta,
            justificacion: pregunta.justificacion,
            fallos: 1,
            ya_enviado: false
          };
          
          console.log('📝 Datos del nuevo registro:', nuevoRegistro);
          
          const { data: registroCreado, error: errorInsert } = await supabase
            .from('mentoria')
            .insert(nuevoRegistro)
            .select()
            .single();

          if (errorInsert) {
            console.error('❌ Error creando registro mentoría:', errorInsert);
            return;
          }
          
          console.log('✅ Registro creado exitosamente:', registroCreado);
        }
      } catch (error) {
        console.error('❌ Error en manejarMentoria:', error);
      }
    };

    // Función para enviar datos a n8n
    const enviarAMentorIA = async (mentoriaId: string, pregunta: Pregunta, fallos: number) => {
      try {
        const { data, error } = await supabase.functions.invoke('mentor-ia-chat', {
          body: {
            sessionId: `mentoria-${mentoriaId}`,
            action: 'sendMentoriaData',
            pregunta_id: pregunta.id,
            pregunta_texto: pregunta.pregunta,
            justificacion: pregunta.justificacion,
            fallos: fallos,
            user_id: null
          }
        });

        if (error) {
          console.error('Error enviando a Mentor IA:', error);
          return;
        }

        // Marcar como enviado
        await supabase
          .from('mentoria')
          .update({ ya_enviado: true })
          .eq('id', mentoriaId);

        console.log('Datos enviados exitosamente a n8n:', data);
      } catch (error) {
        console.error('Error en enviarAMentorIA:', error);
      }
    };

    guardarResultados();
  }, [preguntas, respuestas]);

  const getEstadoColor = (esCorrecta: boolean) => {
    return esCorrecta ? "success" : "destructive";
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Resumen de resultados */}
      <Card>
        <CardHeader>
          <CardTitle className="text-center text-2xl">
            Resultados del Test
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="space-y-2">
              <div className="text-3xl font-bold text-success">{aciertos}</div>
              <div className="text-sm text-muted-foreground">Aciertos</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-destructive">{fallos}</div>
              <div className="text-sm text-muted-foreground">Fallos</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-primary">{porcentaje}%</div>
              <div className="text-sm text-muted-foreground">Puntuación</div>
            </div>
          </div>
          
          <div className="mt-6 flex justify-center">
            <Badge 
              variant={porcentaje >= 70 ? "default" : "secondary"}
              className="text-lg px-4 py-2"
            >
              {porcentaje >= 90 ? "¡Excelente!" : 
               porcentaje >= 70 ? "¡Bien!" : 
               porcentaje >= 50 ? "Puede mejorar" : "Necesita más estudio"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Detalle de preguntas */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Detalle de respuestas</h3>
        
        {preguntas.map((pregunta, index) => {
          const respuestaUsuario = respuestas[pregunta.id];
          const esCorrecta = respuestaUsuario === pregunta.respuesta_correcta;
          
          return (
            <Card key={pregunta.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {esCorrecta ? (
                        <CheckCircle className="h-5 w-5 text-success" />
                      ) : (
                        <XCircle className="h-5 w-5 text-destructive" />
                      )}
                      <span className="text-sm text-muted-foreground">
                        Pregunta {index + 1} - Área {pregunta.area} - {pregunta.tema}
                      </span>
                    </div>
                    <CardTitle className="text-lg leading-relaxed">
                      {pregunta.pregunta}
                    </CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Opciones */}
                <div className="space-y-2">
                  {Object.entries(pregunta.opciones).map(([opcion, texto]) => {
                    const esRespuestaCorrecta = opcion === pregunta.respuesta_correcta;
                    const esRespuestaUsuario = opcion === respuestaUsuario;
                    
                    let bgClass = "";
                    if (esRespuestaCorrecta) {
                      bgClass = "bg-success/10 border-success";
                    } else if (esRespuestaUsuario && !esCorrecta) {
                      bgClass = "bg-destructive/10 border-destructive";
                    }
                    
                    return (
                      <div
                        key={opcion}
                        className={`p-3 rounded-lg border ${bgClass}`}
                      >
                        <div className="flex items-center gap-2">
                          {esRespuestaCorrecta && <CheckCircle className="h-4 w-4 text-success" />}
                          {esRespuestaUsuario && !esCorrecta && <XCircle className="h-4 w-4 text-destructive" />}
                          <span className="font-medium">{opcion.toUpperCase()})</span>
                          <span>{texto}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Justificación */}
                <div className="bg-muted p-4 rounded-lg">
                  <h4 className="font-medium text-sm mb-2">Justificación:</h4>
                  <p className="text-sm leading-relaxed">{pregunta.justificacion}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Acciones */}
      <div className="flex gap-4 justify-center">
        <Button onClick={onVolver} variant="outline">
          <Home className="h-4 w-4 mr-2" />
          Volver al inicio
        </Button>
        <Button onClick={onNuevoTest}>
          <RotateCcw className="h-4 w-4 mr-2" />
          Hacer otro test
        </Button>
      </div>
    </div>
  );
}