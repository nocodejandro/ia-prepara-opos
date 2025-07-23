import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, CheckCircle } from "lucide-react";
import { Pregunta } from "@/hooks/usePreguntas";

interface TestInteractivoProps {
  preguntas: Pregunta[];
  onFinalizarTest: (respuestas: { [preguntaId: string]: string }) => void;
  onVolver: () => void;
}

export function TestInteractivo({ preguntas, onFinalizarTest, onVolver }: TestInteractivoProps) {
  const [preguntaActual, setPreguntaActual] = useState(0);
  const [respuestas, setRespuestas] = useState<{ [preguntaId: string]: string }>({});

  const pregunta = preguntas[preguntaActual];
  const progreso = ((preguntaActual + 1) / preguntas.length) * 100;
  const esUltimaPregunta = preguntaActual === preguntas.length - 1;
  const respuestaActual = respuestas[pregunta.id];

  const handleSiguiente = () => {
    if (esUltimaPregunta) {
      onFinalizarTest(respuestas);
    } else {
      setPreguntaActual(preguntaActual + 1);
    }
  };

  const handleAnterior = () => {
    if (preguntaActual > 0) {
      setPreguntaActual(preguntaActual - 1);
    }
  };

  const handleRespuesta = (opcion: string) => {
    setRespuestas(prev => ({
      ...prev,
      [pregunta.id]: opcion
    }));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header con progreso */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">
                Pregunta {preguntaActual + 1} de {preguntas.length}
              </h2>
              <Button variant="outline" onClick={onVolver}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Button>
            </div>
            <Progress value={progreso} className="w-full" />
            <p className="text-sm text-muted-foreground">
              Área {pregunta.area} - {pregunta.tema}: {pregunta.titulo}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Pregunta actual */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl leading-relaxed">
            {pregunta.pregunta}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={respuestaActual}
            onValueChange={handleRespuesta}
            className="space-y-4"
          >
            {Object.entries(pregunta.opciones).map(([opcion, texto]) => (
              <div key={opcion} className="flex items-start space-x-3 p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                <RadioGroupItem value={opcion} id={opcion} className="mt-1" />
                <Label htmlFor={opcion} className="flex-1 cursor-pointer text-base leading-relaxed">
                  <span className="font-medium mr-2">{opcion.toUpperCase()})</span>
                  {texto}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Navegación */}
      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          onClick={handleAnterior}
          disabled={preguntaActual === 0}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Anterior
        </Button>

        <div className="text-sm text-muted-foreground">
          {Object.keys(respuestas).length} de {preguntas.length} respondidas
        </div>

        <Button
          onClick={handleSiguiente}
          disabled={!respuestaActual}
          variant={esUltimaPregunta ? "default" : "outline"}
        >
          {esUltimaPregunta ? (
            <>
              <CheckCircle className="h-4 w-4 mr-2" />
              Finalizar Test
            </>
          ) : (
            <>
              Siguiente
              <ArrowRight className="h-4 w-4 ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}