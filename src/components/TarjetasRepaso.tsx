import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, Clock, CheckCircle2, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

interface TemaConFallos {
  tema: string;
  area: string;
  bloque?: string;
  totalErrores: number;
  porcentajeError: number;
  ultimoFallo: Date;
  diasDesdeUltimoFallo: number;
  debeRepasar: boolean;
  conceptosEspecificos: string[];
}

interface TarjetasRepasoProps {
  onRefresh?: () => void;
}

interface EjercicioInteractivo {
  pregunta: string;
  opciones: string[];
  respuestaCorrecta: number;
  explicacion: string;
}

export const TarjetasRepaso = ({ onRefresh }: TarjetasRepasoProps) => {
  const [temasConFallos, setTemasConFallos] = useState<TemaConFallos[]>([]);
  const [loading, setLoading] = useState(true);
  const [tarjetaSeleccionada, setTarjetaSeleccionada] = useState<TemaConFallos | null>(null);
  const [ejercicios, setEjercicios] = useState<EjercicioInteractivo[]>([]);
  const [ejercicioActual, setEjercicioActual] = useState(0);
  const [respuestaSeleccionada, setRespuestaSeleccionada] = useState<number | null>(null);
  const [mostrarExplicacion, setMostrarExplicacion] = useState(false);
  const [puntuacion, setPuntuacion] = useState({ correctas: 0, total: 0 });
  const [generandoEjercicios, setGenerandoEjercicios] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    cargarTemasConFallos();
  }, []);

  const cargarTemasConFallos = async () => {
    try {
      // Obtener respuestas incorrectas recientes
      const { data: respuestasIncorrectas, error } = await supabase
        .from('respuestas_usuario')
        .select('*')
        .eq('acertada', false)
        .gte('fecha_respuesta', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .order('fecha_respuesta', { ascending: false });

      if (error) throw error;

      // Agrupar por tema y calcular estadísticas
      const temasFallos = respuestasIncorrectas?.reduce((acc, respuesta) => {
        const clave = `${respuesta.area}-${respuesta.tema}`;
        if (!acc[clave]) {
          acc[clave] = {
            tema: respuesta.tema,
            area: respuesta.area,
            bloque: respuesta.subtema,
            errores: [],
            conceptos: new Set()
          };
        }
        acc[clave].errores.push(respuesta);
        return acc;
      }, {} as Record<string, any>) || {};

      // Convertir a array y aplicar lógica de curva de olvido
      const temasArray: TemaConFallos[] = Object.values(temasFallos).map((tema: any) => {
        const ultimoFallo = new Date(Math.max(...tema.errores.map((e: any) => new Date(e.fecha_respuesta).getTime())));
        const diasDesdeUltimoFallo = Math.floor((Date.now() - ultimoFallo.getTime()) / (1000 * 60 * 60 * 24));
        
        // Lógica de curva de olvido: mostrar inmediatamente para testing
        const debeRepasar = diasDesdeUltimoFallo >= 0; // Mostrar errores inmediatamente para testing
        
        return {
          tema: tema.tema,
          area: tema.area,
          bloque: tema.bloque,
          totalErrores: tema.errores.length,
          porcentajeError: Math.round((tema.errores.length / (tema.errores.length + 1)) * 100),
          ultimoFallo,
          diasDesdeUltimoFallo,
          debeRepasar,
          conceptosEspecificos: []
        };
      }).filter(tema => tema.debeRepasar);

      setTemasConFallos(temasArray);
    } catch (error) {
      console.error('Error cargando temas con fallos:', error);
    } finally {
      setLoading(false);
    }
  };

  const abrirTarjeta = async (tema: TemaConFallos) => {
    setTarjetaSeleccionada(tema);
    setGenerandoEjercicios(true);
    
    try {
      // Llamar a n8n para generar ejercicios personalizados
      const { data, error } = await supabase.functions.invoke('mentor-ia-chat', {
        body: {
          sessionId: Math.random().toString(36).substring(2),
          action: 'generateReviewExercises',
          tema: tema.tema,
          area: tema.area,
          totalErrores: tema.totalErrores
        }
      });

      if (error) throw error;

      // Parsear ejercicios (asumir que n8n devuelve ejercicios estructurados)
      const ejerciciosGenerados = data?.exercises || [
        {
          pregunta: `Pregunta de repaso sobre ${tema.tema}`,
          opciones: ['Opción A', 'Opción B', 'Opción C', 'Opción D'],
          respuestaCorrecta: 0,
          explicacion: 'Explicación detallada del concepto.'
        }
      ];

      setEjercicios(ejerciciosGenerados);
      setEjercicioActual(0);
      setRespuestaSeleccionada(null);
      setMostrarExplicacion(false);
      setPuntuacion({ correctas: 0, total: 0 });
    } catch (error) {
      console.error('Error generando ejercicios:', error);
      toast({
        title: "Error",
        description: "No se pudieron generar los ejercicios de repaso",
        variant: "destructive"
      });
    } finally {
      setGenerandoEjercicios(false);
    }
  };

  const responderPregunta = (respuesta: number) => {
    setRespuestaSeleccionada(respuesta);
    setMostrarExplicacion(true);
    
    const esCorrecta = respuesta === ejercicios[ejercicioActual].respuestaCorrecta;
    setPuntuacion(prev => ({
      correctas: prev.correctas + (esCorrecta ? 1 : 0),
      total: prev.total + 1
    }));
  };

  const siguienteEjercicio = () => {
    if (ejercicioActual < ejercicios.length - 1) {
      setEjercicioActual(prev => prev + 1);
      setRespuestaSeleccionada(null);
      setMostrarExplicacion(false);
    } else {
      // Ejercicios completados
      const porcentajeExito = (puntuacion.correctas / puntuacion.total) * 100;
      if (porcentajeExito >= 80) {
        marcarTarjetaCompletada();
      }
      toast({
        title: "Repaso completado",
        description: `Has obtenido ${puntuacion.correctas}/${puntuacion.total} respuestas correctas`,
        variant: porcentajeExito >= 80 ? "default" : "destructive"
      });
      cerrarTarjeta();
    }
  };

  const marcarTarjetaCompletada = async () => {
    // Aquí podrías guardar en una tabla de repasos completados
    // Por ahora simplemente removemos la tarjeta del estado
    setTemasConFallos(prev => prev.filter(t => t.tema !== tarjetaSeleccionada?.tema));
    onRefresh?.();
  };

  const cerrarTarjeta = () => {
    setTarjetaSeleccionada(null);
    setEjercicios([]);
    setEjercicioActual(0);
    setRespuestaSeleccionada(null);
    setMostrarExplicacion(false);
    setPuntuacion({ correctas: 0, total: 0 });
  };

  const getColorPorUrgencia = (dias: number) => {
    if (dias >= 14) return 'destructive';
    if (dias >= 7) return 'secondary';
    return 'default';
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-muted animate-pulse rounded" />
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2].map(i => (
            <div key={i} className="h-40 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (temasConFallos.length === 0) {
    return (
      <div className="text-center py-8">
        <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">¡Excelente trabajo!</h3>
        <p className="text-muted-foreground">No tienes temas pendientes de repaso en este momento.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-5 w-5 text-orange-500" />
        <h3 className="text-lg font-semibold">Temas para repasar</h3>
        <Badge variant="secondary">{temasConFallos.length}</Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {temasConFallos.map((tema, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => abrirTarjeta(tema)}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-base">{tema.area} - {tema.tema}</CardTitle>
                  {tema.bloque && <p className="text-sm text-muted-foreground">{tema.bloque}</p>}
                </div>
                <Badge variant={getColorPorUrgencia(tema.diasDesdeUltimoFallo)}>
                  {tema.diasDesdeUltimoFallo}d
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Último fallo: hace {tema.diasDesdeUltimoFallo} días</span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Errores: {tema.totalErrores}</span>
                  <span>{tema.porcentajeError}% error</span>
                </div>
                <Progress value={tema.porcentajeError} className="h-2" />
              </div>
              <Button size="sm" className="w-full">
                Repasar ahora
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Dialog para ejercicios interactivos */}
      <Dialog open={!!tarjetaSeleccionada} onOpenChange={() => cerrarTarjeta()}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Repaso: {tarjetaSeleccionada?.tema}</span>
              <Button variant="ghost" size="icon" onClick={cerrarTarjeta}>
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>

          {generandoEjercicios ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
              <p>Generando ejercicios personalizados...</p>
            </div>
          ) : ejercicios.length > 0 && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <Badge variant="outline">
                  Pregunta {ejercicioActual + 1} de {ejercicios.length}
                </Badge>
                <Badge variant="secondary">
                  {puntuacion.correctas}/{puntuacion.total} correctas
                </Badge>
              </div>

              <div className="space-y-4">
                <h4 className="text-lg font-medium">{ejercicios[ejercicioActual]?.pregunta}</h4>
                
                <div className="grid gap-2">
                  {ejercicios[ejercicioActual]?.opciones.map((opcion, idx) => (
                    <Button
                      key={idx}
                      variant={
                        respuestaSeleccionada === null ? "outline" :
                        idx === ejercicios[ejercicioActual].respuestaCorrecta ? "default" :
                        respuestaSeleccionada === idx ? "destructive" : "outline"
                      }
                      className="justify-start h-auto p-3 text-left"
                      onClick={() => !mostrarExplicacion && responderPregunta(idx)}
                      disabled={mostrarExplicacion}
                    >
                      <span className="font-mono mr-2">{String.fromCharCode(65 + idx)})</span>
                      {opcion}
                    </Button>
                  ))}
                </div>

                {mostrarExplicacion && (
                  <div className="bg-muted p-4 rounded-lg">
                    <h5 className="font-medium mb-2">Explicación:</h5>
                    <p className="text-sm">{ejercicios[ejercicioActual]?.explicacion}</p>
                  </div>
                )}

                {mostrarExplicacion && (
                  <Button onClick={siguienteEjercicio} className="w-full">
                    {ejercicioActual < ejercicios.length - 1 ? 'Siguiente pregunta' : 'Finalizar repaso'}
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};