import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BookOpen } from 'lucide-react';

interface AreaSelectorProps {
  areas: string[];
  onAreaSelect: (area: string) => void;
  onBack: () => void;
}

export const AreaSelector = ({ areas, onAreaSelect, onBack }: AreaSelectorProps) => {
  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
        <h2 className="text-2xl font-bold text-gray-900">Selecciona un Área</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {areas.map((area) => (
          <Card 
            key={area}
            className="cursor-pointer hover:shadow-lg transition-shadow duration-200 border-2 hover:border-primary"
            onClick={() => onAreaSelect(area)}
          >
            <CardContent className="p-6 text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <BookOpen className="h-8 w-8 text-primary" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Área {area}</h3>
              <p className="text-sm text-gray-600 mt-2">Preguntas de área {area}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};