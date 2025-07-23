import { useState } from 'react';
import { FiltrosTest } from '@/components/FiltrosTest';
import { TestInteractivo } from '@/components/TestInteractivo';
import { ResultadosTest } from '@/components/ResultadosTest';
import { usePreguntas } from '@/hooks/usePreguntas';
import { Brain, BookOpen, Target } from 'lucide-react';

type Estado = 'filtros' | 'test' | 'resultados';

const Index = () => {
  const [estado, setEstado] = useState<Estado>('filtros');
  const [areaSeleccionada, setAreaSeleccionada] = useState<string>('');
  const [temaSeleccionado, setTemaSeleccionado] = useState<string>('');
  const [respuestasTest, setRespuestasTest] = useState<{ [preguntaId: string]: string }>({});

  const { preguntas, loading } = usePreguntas({
    area: areaSeleccionada || undefined,
    tema: temaSeleccionado || undefined
  });

  const handleIniciarTest = () => {
    if (preguntas.length > 0) {
      setEstado('test');
    }
  };

  const handleFinalizarTest = (respuestas: { [preguntaId: string]: string }) => {
    setRespuestasTest(respuestas);
    setEstado('resultados');
  };

  const handleNuevoTest = () => {
    setRespuestasTest({});
    setEstado('filtros');
  };

  const handleVolver = () => {
    setEstado('filtros');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-12 h-12 bg-primary text-primary-foreground rounded-xl">
                <Brain className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Aprueba con IA</h1>
                <p className="text-sm text-muted-foreground">Plataforma de estudio para opositores</p>
              </div>
            </div>
            
            {estado !== 'filtros' && (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <BookOpen className="h-4 w-4" />
                  Área {areaSeleccionada} - {temaSeleccionado}
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="container mx-auto px-4 py-8">
        {estado === 'filtros' && !loading && (
          <div className="max-w-2xl mx-auto space-y-8">
            {/* Hero section */}
            <div className="text-center space-y-4">
              <div className="flex justify-center mb-4">
                <div className="flex items-center justify-center w-20 h-20 bg-primary/10 text-primary rounded-2xl">
                  <Target className="h-10 w-10" />
                </div>
              </div>
              <h2 className="text-3xl font-bold text-foreground">
                Practica con preguntas tipo test
              </h2>
              <p className="text-lg text-muted-foreground max-w-md mx-auto">
                Selecciona el área y tema que quieres estudiar. Las preguntas se generan automáticamente con IA.
              </p>
            </div>

            <FiltrosTest
              areaSeleccionada={areaSeleccionada}
              temaSeleccionado={temaSeleccionado}
              onAreaChange={setAreaSeleccionada}
              onTemaChange={setTemaSeleccionado}
              onIniciarTest={handleIniciarTest}
              cantidadPreguntas={preguntas.length}
            />
          </div>
        )}

        {estado === 'test' && (
          <TestInteractivo
            preguntas={preguntas}
            onFinalizarTest={handleFinalizarTest}
            onVolver={handleVolver}
          />
        )}

        {estado === 'resultados' && (
          <ResultadosTest
            preguntas={preguntas}
            respuestas={respuestasTest}
            onNuevoTest={handleNuevoTest}
            onVolver={handleVolver}
          />
        )}

        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground">Cargando preguntas...</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
