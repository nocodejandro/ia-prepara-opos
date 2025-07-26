import { useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { AreaSelector } from '@/components/AreaSelector';
import { TemaSelector } from '@/components/TemaSelector';
import { BloqueGuardiaCivilSelector } from '@/components/BloqueGuardiaCivilSelector';
import { TemaBloqueSelector } from '@/components/TemaBloqueSelector';
import { TestInteractivo } from '@/components/TestInteractivo';
import { ResultadosTest } from '@/components/ResultadosTest';
import { Estadisticas } from '@/components/Estadisticas';
import { MentorIA } from '@/components/MentorIA';
import { usePreguntas, useAreasYTemas } from '@/hooks/usePreguntas';

type Vista = 'menu' | 'areas' | 'temas' | 'bloques-gc' | 'temas-bloque' | 'test' | 'resultados' | 'estadisticas' | 'mentor-ia';

const Index = () => {
  const [vista, setVista] = useState<Vista>('menu');
  const [menuActivo, setMenuActivo] = useState<string>('test-temas');
  const [areaSeleccionada, setAreaSeleccionada] = useState<string>('');
  const [temaSeleccionado, setTemaSeleccionado] = useState<string>('');
  const [bloqueSeleccionado, setBloqueSeleccionado] = useState<number>(0);
  const [respuestasTest, setRespuestasTest] = useState<{ [preguntaId: string]: string }>({});

  const { areas, temas, loading: areasLoading } = useAreasYTemas();
  const { preguntas, loading: preguntasLoading } = usePreguntas({
    area: areaSeleccionada || undefined,
    tema: temaSeleccionado || undefined,
    bloque: bloqueSeleccionado > 0 ? `Bloque ${bloqueSeleccionado}` : undefined
  });

  const handleMenuSelect = (menu: string) => {
    setMenuActivo(menu);
    if (menu === 'test-temas') {
      setVista('areas');
    } else if (menu === 'test-bloques-gc') {
      setVista('bloques-gc');
    } else if (menu === 'estadisticas') {
      setVista('estadisticas');
    } else if (menu === 'mentor-ia') {
      setVista('mentor-ia');
    } else {
      setVista('menu');
    }
  };

  const handleAreaSelect = (area: string) => {
    setAreaSeleccionada(area);
    setVista('temas');
  };

  const handleTemaSelect = (tema: string, bloque?: string) => {
    setTemaSeleccionado(tema);
    if (bloque) {
      setAreaSeleccionada(bloque);
    }
    setVista('test');
  };

  const handleBloqueSelect = (bloque: number) => {
    setBloqueSeleccionado(bloque);
    setVista('temas-bloque');
  };

  const handleFinalizarTest = (respuestas: { [preguntaId: string]: string }) => {
    setRespuestasTest(respuestas);
    setVista('resultados');
  };

  const handleNuevoTest = () => {
    setRespuestasTest({});
    setVista('menu');
    setAreaSeleccionada('');
    setTemaSeleccionado('');
    setBloqueSeleccionado(0);
  };

  const handleVolver = () => {
    if (vista === 'temas') {
      setVista('areas');
    } else if (vista === 'areas') {
      setVista('menu');
    } else if (vista === 'temas-bloque') {
      setVista('bloques-gc');
    } else if (vista === 'bloques-gc') {
      setVista('menu');
    } else if (vista === 'test') {
      if (bloqueSeleccionado > 0) {
        setVista('temas-bloque');
      } else {
        setVista('temas');
      }
    } else if (vista === 'resultados') {
      setVista('menu');
    } else if (vista === 'estadisticas') {
      setVista('menu');
    } else if (vista === 'mentor-ia') {
      setVista('menu');
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <Sidebar onMenuSelect={handleMenuSelect} activeMenu={menuActivo} />
      
      {/* Main Content */}
      <div className="flex-1 grid-background">
        {vista === 'menu' && (
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Bienvenido a Aprueba con IA
              </h2>
              <p className="text-lg text-gray-600">
                Selecciona una opción del menú lateral para comenzar
              </p>
            </div>
          </div>
        )}

        {vista === 'areas' && !areasLoading && (
          <AreaSelector
            areas={areas}
            onAreaSelect={handleAreaSelect}
            onBack={() => setVista('menu')}
          />
        )}

        {vista === 'temas' && areaSeleccionada && (
          <TemaSelector
            area={areaSeleccionada}
            temas={temas[areaSeleccionada] || []}
            onTemaSelect={(tema) => handleTemaSelect(tema)}
            onBack={handleVolver}
          />
        )}

        {vista === 'bloques-gc' && (
          <BloqueGuardiaCivilSelector
            onBloqueSelect={handleBloqueSelect}
            onBack={handleVolver}
          />
        )}

        {vista === 'temas-bloque' && bloqueSeleccionado > 0 && (
          <TemaBloqueSelector
            bloqueNumero={bloqueSeleccionado}
            onTemaSelect={handleTemaSelect}
            onBack={handleVolver}
          />
        )}

        {vista === 'test' && preguntas.length > 0 && (
          <div className="p-6">
            <TestInteractivo
              preguntas={preguntas}
              onFinalizarTest={handleFinalizarTest}
              onVolver={handleVolver}
            />
          </div>
        )}

        {vista === 'resultados' && (
          <div className="p-6">
            <ResultadosTest
              preguntas={preguntas}
              respuestas={respuestasTest}
              onNuevoTest={handleNuevoTest}
              onVolver={handleVolver}
            />
          </div>
        )}

        {vista === 'estadisticas' && (
          <Estadisticas onVolver={handleVolver} />
        )}

        {vista === 'mentor-ia' && (
          <MentorIA onVolver={handleVolver} />
        )}

        {(areasLoading || preguntasLoading) && (
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-gray-600">Cargando...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
