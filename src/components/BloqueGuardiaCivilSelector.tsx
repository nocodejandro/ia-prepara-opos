import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, BookOpen, Users, Atom } from 'lucide-react';

interface BloqueGuardiaCivilSelectorProps {
  onBloqueSelect: (bloque: number) => void;
  onBack: () => void;
}

// Datos completos de la oposición Guardia Civil
const BLOQUES_GUARDIA_CIVIL = {
  1: {
    nombre: 'Ciencias Jurídicas',
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

const descripcionesPorBloque = {
  1: 'Contiene la mayoría de los temas, relacionados con Derecho, normativa y estructura del Estado',
  2: 'Materias relacionadas con aspectos sociales, culturales y tecnológicos',
  3: 'Materias de carácter técnico y científico específicas del cuerpo'
};

export const BloqueGuardiaCivilSelector = ({ onBloqueSelect, onBack }: BloqueGuardiaCivilSelectorProps) => {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
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
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Bloques Guardia Civil</h1>
            <p className="text-gray-600">Estructura completa de la oposición - Selecciona un bloque para hacer el test</p>
          </div>
        </div>

        {/* Grid de bloques */}
        <div className="grid gap-6">
          {Object.entries(BLOQUES_GUARDIA_CIVIL).map(([bloqueNumero, bloque]) => {
            const numBloque = parseInt(bloqueNumero) as keyof typeof iconosPorBloque;
            const IconoBloque = iconosPorBloque[numBloque];
            const colorBloque = coloresPorBloque[numBloque];
            const descripcion = descripcionesPorBloque[numBloque];
            
            return (
              <Card 
                key={bloqueNumero}
                className="cursor-pointer hover:shadow-lg transition-all duration-200 border-2 hover:border-primary/50 hover:scale-[1.02]"
                onClick={() => onBloqueSelect(parseInt(bloqueNumero))}
              >
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className={`w-16 h-16 ${colorBloque} rounded-full flex items-center justify-center flex-shrink-0`}>
                      {IconoBloque && <IconoBloque className="h-8 w-8 text-white" />}
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-2xl flex items-center gap-2">
                        🔷 Bloque {bloqueNumero}: {bloque.nombre}
                      </CardTitle>
                      <CardDescription className="text-base mt-2">
                        {descripcion}
                      </CardDescription>
                      <Badge variant="secondary" className="mt-3 text-sm font-medium">
                        👉 Total: {bloque.temas.length} temas
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Lista completa de temas */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-800 border-b pb-2">Todos los temas del bloque:</h4>
                    <div className="grid gap-2 max-h-80 overflow-y-auto">
                      {bloque.temas.map((tema, index) => (
                        <div key={tema.codigo} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                          <Badge variant="outline" className="font-mono text-xs flex-shrink-0">
                            {tema.codigo}
                          </Badge>
                          <div className="flex-1">
                            <p className="text-sm font-medium leading-relaxed">
                              {tema.nombre}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button 
                    className="w-full mt-6" 
                    size="lg"
                    onClick={(e) => {
                      e.stopPropagation();
                      onBloqueSelect(parseInt(bloqueNumero));
                    }}
                  >
                    Seleccionar Bloque {bloqueNumero} - {bloque.nombre}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Resumen total */}
        <Card className="mt-8 bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="text-center">📊 Resumen General</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-primary">3</p>
                <p className="text-gray-600">Bloques</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600">15</p>
                <p className="text-gray-600">Temas Bloque 1</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">6</p>
                <p className="text-gray-600">Temas Bloque 2</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-600">2</p>
                <p className="text-gray-600">Temas Bloque 3</p>
              </div>
            </div>
            <div className="mt-4 text-center">
              <Badge variant="default" className="text-lg px-4 py-2">
                Total: 23 temas en la oposición
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};