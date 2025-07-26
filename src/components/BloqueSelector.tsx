import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Shield } from 'lucide-react';

interface BloqueSelectorProps {
  bloques: string[];
  onBloqueSelect: (bloque: string) => void;
  onBack: () => void;
}

export const BloqueSelector = ({ bloques, onBloqueSelect, onBack }: BloqueSelectorProps) => {
  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
        <h2 className="text-2xl font-bold text-gray-900">Selecciona un Bloque - Guardia Civil</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {bloques.map((bloque) => (
          <Card 
            key={bloque}
            className="cursor-pointer hover:shadow-lg transition-shadow duration-200 border-2 hover:border-primary"
            onClick={() => onBloqueSelect(bloque)}
          >
            <CardContent className="p-6 text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <Shield className="h-8 w-8 text-primary" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{bloque}</h3>
              <p className="text-sm text-gray-600">
                {bloque.includes('Ciencias Jurídicas') && '15 temas - Derecho y normativa'}
                {bloque.includes('Socio-Culturales') && '6 temas - Protección y tecnología'}
                {bloque.includes('Técnico-Científicas') && '2 temas - Armas y derecho fiscal'}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};