import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, BookOpen, Users, Atom } from 'lucide-react';
import { useBloquesGuardiaCivil } from '@/hooks/usePreguntas';

interface BloqueGuardiaCivilSelectorProps {
  onBloqueSelect: (bloque: number) => void;
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

export const BloqueGuardiaCivilSelector = ({ onBloqueSelect, onBack }: BloqueGuardiaCivilSelectorProps) => {
  const { bloquesAgrupados, loading } = useBloquesGuardiaCivil();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-gray-600">Cargando bloques...</p>
        </div>
      </div>
    );
  }

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
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Bloques Guardia Civil</h1>
            <p className="text-gray-600">Selecciona un bloque para hacer el test</p>
          </div>
        </div>

        {/* Grid de bloques */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Object.entries(bloquesAgrupados).map(([bloqueNumero, bloque]) => {
            const numBloque = parseInt(bloqueNumero);
            const IconoBloque = iconosPorBloque[numBloque as keyof typeof iconosPorBloque];
            const colorBloque = coloresPorBloque[numBloque as keyof typeof coloresPorBloque];
            
            return (
              <Card 
                key={bloqueNumero}
                className="cursor-pointer hover:shadow-lg transition-shadow duration-200 border-2 hover:border-primary/50"
                onClick={() => onBloqueSelect(bloque.numero)}
              >
                <CardHeader className="text-center">
                  <div className={`w-16 h-16 ${colorBloque} rounded-full flex items-center justify-center mx-auto mb-4`}>
                    {IconoBloque && <IconoBloque className="h-8 w-8 text-white" />}
                  </div>
                  <CardTitle className="text-xl">
                    Bloque {bloque.numero}
                  </CardTitle>
                  <CardDescription className="font-medium text-base">
                    {bloque.nombre}
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                  <Badge variant="secondary" className="text-sm">
                    {bloque.temas.length} temas
                  </Badge>
                  
                  {/* Lista de temas */}
                  <div className="text-left space-y-2 max-h-48 overflow-y-auto">
                    <h4 className="font-medium text-sm text-gray-700 border-b pb-1">Temas incluidos:</h4>
                    {bloque.temas.slice(0, 5).map((tema) => (
                      <div key={tema.tema_codigo} className="text-xs text-gray-600 flex gap-2">
                        <span className="font-medium text-primary">{tema.tema_codigo}.</span>
                        <span className="line-clamp-2">{tema.tema_nombre}</span>
                      </div>
                    ))}
                    {bloque.temas.length > 5 && (
                      <div className="text-xs text-gray-500 italic">
                        ...y {bloque.temas.length - 5} temas más
                      </div>
                    )}
                  </div>

                  <Button 
                    className="w-full mt-4" 
                    onClick={(e) => {
                      e.stopPropagation();
                      onBloqueSelect(bloque.numero);
                    }}
                  >
                    Seleccionar Bloque
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};