import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, BookOpen, Users, Atom, Play } from 'lucide-react';
import { useBloquesGuardiaCivil } from '@/hooks/usePreguntas';

interface TemaBlocueSelectorProps {
  bloqueNumero: number;
  onTemaSelect: (tema: string, bloque?: string) => void;
  onBack: () => void;
}

const iconosPorBloque = {
  1: BookOpen,
  2: Users,
  3: Atom
};

const coloresPorBloque = {
  1: 'bg-blue-500',
  2: 'bg-green-500', 
  3: 'bg-purple-500'
};

export const TemaBloqueSelector = ({ bloqueNumero, onTemaSelect, onBack }: TemaBlocueSelectorProps) => {
  const { bloquesAgrupados, loading } = useBloquesGuardiaCivil();
  const [selectedTemas, setSelectedTemas] = useState<string[]>([]);

  const bloqueData = bloquesAgrupados[bloqueNumero.toString()];
  const numBloque = bloqueNumero as keyof typeof iconosPorBloque;
  const IconoBloque = iconosPorBloque[numBloque];
  const colorBloque = coloresPorBloque[numBloque];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-gray-600">Cargando temas...</p>
        </div>
      </div>
    );
  }

  if (!bloqueData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <p className="text-gray-600">No se encontraron datos para este bloque</p>
          <Button onClick={onBack}>Volver</Button>
        </div>
      </div>
    );
  }

  const toggleTema = (temaCodigo: string) => {
    setSelectedTemas(prev => 
      prev.includes(temaCodigo) 
        ? prev.filter(t => t !== temaCodigo)
        : [...prev, temaCodigo]
    );
  };

  const handleTestCompleto = () => {
    // Enviar el bloque completo como tema
    onTemaSelect(`Bloque ${bloqueNumero}`, bloqueData.nombre);
  };

  const handleTestTemas = () => {
    if (selectedTemas.length === 0) return;
    // Unir los temas seleccionados
    const temasString = selectedTemas.join(', ');
    onTemaSelect(temasString, bloqueData.nombre);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            size="icon"
            onClick={onBack}
            className="h-10 w-10"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 ${colorBloque} rounded-full flex items-center justify-center`}>
              {IconoBloque && <IconoBloque className="h-6 w-6 text-white" />}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Bloque {bloqueNumero}</h1>
              <h2 className="text-xl text-gray-600">{bloqueData.nombre}</h2>
              <p className="text-gray-500">Selecciona los temas para tu test</p>
            </div>
          </div>
        </div>

        {/* Opciones de test */}
        <div className="grid gap-6 mb-8">
          {/* Test completo del bloque */}
          <Card className="border-2 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Play className="h-5 w-5 text-primary" />
                Test Completo del Bloque
              </CardTitle>
              <CardDescription>
                Incluye preguntas de todos los {bloqueData.temas.length} temas del bloque
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={handleTestCompleto}
                className="w-full"
                size="lg"
              >
                Hacer Test Completo
              </Button>
            </CardContent>
          </Card>

          {/* Selección de temas específicos */}
          <Card>
            <CardHeader>
              <CardTitle>Test por Temas Específicos</CardTitle>
              <CardDescription>
                Selecciona uno o más temas para hacer un test personalizado
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Lista de temas */}
              <div className="grid gap-3 max-h-96 overflow-y-auto">
                {bloqueData.temas.map((tema) => (
                  <div
                    key={tema.tema_codigo}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedTemas.includes(tema.tema_codigo)
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => toggleTema(tema.tema_codigo)}
                  >
                    <div className="flex items-start gap-3">
                      <Badge 
                        variant={selectedTemas.includes(tema.tema_codigo) ? "default" : "secondary"}
                        className="font-mono"
                      >
                        {tema.tema_codigo}
                      </Badge>
                      <div className="flex-1">
                        <p className="font-medium text-sm leading-relaxed">
                          {tema.tema_nombre}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Botón para test de temas seleccionados */}
              {selectedTemas.length > 0 && (
                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-gray-600">
                      {selectedTemas.length} tema{selectedTemas.length !== 1 ? 's' : ''} seleccionado{selectedTemas.length !== 1 ? 's' : ''}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedTemas([])}
                    >
                      Limpiar selección
                    </Button>
                  </div>
                  <Button 
                    onClick={handleTestTemas}
                    className="w-full"
                    disabled={selectedTemas.length === 0}
                  >
                    Hacer Test de Temas Seleccionados
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};