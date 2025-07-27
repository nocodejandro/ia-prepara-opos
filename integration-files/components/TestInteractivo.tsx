import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Clock, CheckCircle, XCircle } from 'lucide-react';

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

interface TestInteractivoProps {
  preguntas: Pregunta[];
  onFinalizar: (respuestas: { [key: string]: string }) => void;
  onVolver: () => void;
}

export const TestInteractivo = ({ preguntas, onFinalizar, onVolver }: TestInteractivoProps) => {
  const [preguntaActual, setPreguntaActual] = useState(0);
  const [respuestas, setRespuestas] = useState<{ [key: string]: string }>({});
  const [respuestaSeleccionada, setRespuestaSeleccionada] = useState<string>('');
  const [tiempoInicio] = useState(Date.now());
  const [tiempo, setTiempo] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTiempo(Math.floor((Date.now() - tiempoInicio) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [tiempoInicio]);

  const formatTiempo = (segundos: number) => {
    const mins = Math.floor(segundos / 60);
    const secs = segundos % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleRespuesta = (opcion: string) => {
    setRespuestaSeleccionada(opcion);
  };

  const handleSiguiente = () => {
    if (respuestaSeleccionada) {
      const nuevasRespuestas = {
        ...respuestas,
        [preguntas[preguntaActual].id]: respuestaSeleccionada
      };
      setRespuestas(nuevasRespuestas);
      setRespuestaSeleccionada('');

      if (preguntaActual < preguntas.length - 1) {
        setPreguntaActual(preguntaActual + 1);
      } else {
        onFinalizar(nuevasRespuestas);
      }
    }
  };

  const handleAnterior = () => {
    if (preguntaActual > 0) {
      setPreguntaActual(preguntaActual - 1);
      setRespuestaSeleccionada(respuestas[preguntas[preguntaActual - 1].id] || '');
    }
  };

  const pregunta = preguntas[preguntaActual];
  const progreso = ((preguntaActual + 1) / preguntas.length) * 100;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header con información del test */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl">
              Pregunta {preguntaActual + 1} de {preguntas.length}
            </CardTitle>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                {formatTiempo(tiempo)}
              </div>
              <Button variant="outline" onClick={onVolver}>
                Salir del test
              </Button>
            </div>
          </div>
          <Progress value={progreso} className="w-full" />
        </CardHeader>
      </Card>

      {/* Pregunta actual */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium leading-relaxed">
            {pregunta.pregunta}
          </CardTitle>
          {pregunta.bloque && (
            <p className="text-sm text-muted-foreground">
              {pregunta.area} - {pregunta.tema} - {pregunta.bloque}
            </p>
          )}
          {!pregunta.bloque && (
            <p className="text-sm text-muted-foreground">
              {pregunta.area} - {pregunta.tema}
            </p>
          )}
        </CardHeader>
        <CardContent className="space-y-3">
          {pregunta.opciones.map((opcion, index) => (
            <button
              key={index}
              onClick={() => handleRespuesta(opcion)}
              className={`w-full p-4 text-left rounded-lg border transition-all hover:border-primary ${
                respuestaSeleccionada === opcion
                  ? 'border-primary bg-primary/5'
                  : 'border-border bg-card'
              }`}
            >
              <span className="font-medium mr-3">{String.fromCharCode(65 + index)})</span>
              {opcion}
            </button>
          ))}
        </CardContent>
      </Card>

      {/* Controles de navegación */}
      <div className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={handleAnterior}
          disabled={preguntaActual === 0}
        >
          Anterior
        </Button>
        
        <Button 
          onClick={handleSiguiente}
          disabled={!respuestaSeleccionada}
          className="px-8"
        >
          {preguntaActual === preguntas.length - 1 ? 'Finalizar Test' : 'Siguiente'}
        </Button>
      </div>
    </div>
  );
};