import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, BookOpen, Users, Atom, Play, CheckCircle } from 'lucide-react';

interface TemaBlocueSelectorProps {
  bloqueNumero: number;
  onTemaSelect: (tema: string, bloque?: string) => void;
  onBack: () => void;
}

// Datos completos de la oposición Guardia Civil
const BLOQUES_GUARDIA_CIVIL = {
  1: {
    nombre: 'Ciencias Jurídicas',
    descripcion: 'Contiene la mayoría de los temas, relacionados con Derecho, normativa y estructura del Estado',
    temas: [
      { codigo: 'T1', nombre: 'Derechos Humanos' },
      { codigo: 'T2', nombre: 'Igualdad Efectiva de Mujeres y Hombres' },
      { codigo: 'T3', nombre: 'Prevención de Riesgos Laborales' },
      { codigo: 'T4', nombre: 'Derecho Constitucional' },
      { codigo: 'T5', nombre: 'Derecho de la Unión Europea' },
      { codigo: 'T6', nombre: 'Instituciones Internacionales' },
      { codigo: 'T7', nombre: 'Derecho Civil' },
      { codigo: 'T8', nombre: 'Derecho Penal' },
      { codigo: 'T9', nombre: 'Derecho Procesal Penal' },
      { codigo: 'T10', nombre: 'Derecho Administrativo' },
      { codigo: 'T11', nombre: 'Protección de Datos' },
      { codigo: 'T12', nombre: 'Extranjería e Inmigración' },
      { codigo: 'T13', nombre: 'Seguridad Pública y Privada' },
      { codigo: 'T14', nombre: 'Ministerio del Interior y Ministerio de Defensa' },
      { codigo: 'T15', nombre: 'Fuerzas y Cuerpos de Seguridad. Guardia Civil' }
    ]
  },
  2: {
    nombre: 'Materias Socio-Culturales',
    descripcion: 'Materias relacionadas con aspectos sociales, culturales y tecnológicos',
    temas: [
      { codigo: 'T16', nombre: 'Protección Civil, Desarrollo Sostenible, Eficiencia Energética' },
      { codigo: 'T17', nombre: 'Tecnologías de la Información y la Comunicación' },
      { codigo: 'T18', nombre: 'Topografía' },
      { codigo: 'T19', nombre: 'Deontología Profesional' },
      { codigo: 'T20', nombre: 'Responsabilidad Penal de los Menores' },
      { codigo: 'T21', nombre: 'Protección Integral contra la Violencia de Género' }
    ]
  },
  3: {
    nombre: 'Materias Técnico-Científicas',
    descripcion: 'Materias de carácter técnico y científico específicas del cuerpo',
    temas: [
      { codigo: 'T22', nombre: 'Armas y Explosivos' },
      { codigo: 'T23', nombre: 'Derecho Fiscal' }
    ]
  }
};

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
  const [selectedTemas, setSelectedTemas] = useState<string[]>([]);
  const [mostrarTodos, setMostrarTodos] = useState(false);

  const bloqueData = BLOQUES_GUARDIA_CIVIL[bloqueNumero as keyof typeof BLOQUES_GUARDIA_CIVIL];
  const numBloque = bloqueNumero as keyof typeof iconosPorBloque;
  const IconoBloque = iconosPorBloque[numBloque];
  const colorBloque = coloresPorBloque[numBloque];

  if (!bloqueData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <p className="text-gray-600">Bloque no encontrado</p>
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

  const seleccionarTodos = () => {
    setSelectedTemas(bloqueData.temas.map(t => t.codigo));
  };

  const limpiarSeleccion = () => {
    setSelectedTemas([]);
  };

  const handleTestCompleto = () => {
    onTemaSelect(`Bloque ${bloqueNumero}`, bloqueData.nombre);
  };

  const handleTestTemas = () => {
    if (selectedTemas.length === 0) return;
    const temasString = selectedTemas.join(', ');
    onTemaSelect(temasString, bloqueData.nombre);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
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
              <h1 className="text-3xl font-bold text-gray-900">🔷 Bloque {bloqueNumero}: {bloqueData.nombre}</h1>
              <p className="text-gray-600">{bloqueData.descripcion}</p>
              <Badge variant="secondary" className="mt-2">
                👉 Total: {bloqueData.temas.length} temas
              </Badge>
            </div>
          </div>
        </div>

        {/* Opciones de test */}
        <div className="grid gap-6 mb-8">
          {/* Test completo del bloque */}
          <Card className="border-2 border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <Play className="h-5 w-5" />
                Test Completo del Bloque {bloqueNumero}
              </CardTitle>
              <CardDescription>
                Incluye preguntas de todos los {bloqueData.temas.length} temas del bloque: {bloqueData.nombre}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={handleTestCompleto}
                className="w-full"
                size="lg"
              >
                Hacer Test Completo del Bloque
              </Button>
            </CardContent>
          </Card>

          {/* Selección de temas específicos */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Test por Temas Específicos</CardTitle>
                  <CardDescription>
                    Selecciona uno o más temas para hacer un test personalizado
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={seleccionarTodos}
                    disabled={selectedTemas.length === bloqueData.temas.length}
                  >
                    Seleccionar todos
                  </Button>
                  {selectedTemas.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={limpiarSeleccion}
                    >
                      Limpiar selección
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Todos los temas del bloque */}
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-800 border-b pb-2">
                  Todos los temas del Bloque {bloqueNumero} ({bloqueData.temas.length} temas):
                </h4>
                <div className="grid gap-3 max-h-96 overflow-y-auto">
                  {bloqueData.temas.map((tema) => {
                    const isSelected = selectedTemas.includes(tema.codigo);
                    return (
                      <div
                        key={tema.codigo}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                          isSelected
                            ? 'border-primary bg-primary/10 shadow-md'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                        onClick={() => toggleTema(tema.codigo)}
                      >
                        <div className="flex items-start gap-3">
                          <Badge 
                            variant={isSelected ? "default" : "secondary"}
                            className="font-mono text-sm flex-shrink-0"
                          >
                            {tema.codigo}
                          </Badge>
                          <div className="flex-1">
                            <p className="font-medium text-sm leading-relaxed">
                              {tema.nombre}
                            </p>
                          </div>
                          {isSelected && (
                            <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Botón para test de temas seleccionados */}
              {selectedTemas.length > 0 && (
                <div className="pt-4 border-t bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-medium text-gray-700">
                      ✅ {selectedTemas.length} tema{selectedTemas.length !== 1 ? 's' : ''} seleccionado{selectedTemas.length !== 1 ? 's' : ''}
                    </span>
                    <div className="flex gap-2">
                      {selectedTemas.slice(0, 3).map(codigo => (
                        <Badge key={codigo} variant="outline" className="text-xs">
                          {codigo}
                        </Badge>
                      ))}
                      {selectedTemas.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{selectedTemas.length - 3} más
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Button 
                    onClick={handleTestTemas}
                    className="w-full"
                    size="lg"
                    disabled={selectedTemas.length === 0}
                  >
                    Hacer Test de {selectedTemas.length} Tema{selectedTemas.length !== 1 ? 's' : ''} Seleccionado{selectedTemas.length !== 1 ? 's' : ''}
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