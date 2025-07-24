import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileText } from 'lucide-react';

interface TemaSelectorProps {
  area: string;
  temas: string[];
  onTemaSelect: (tema: string) => void;
  onBack: () => void;
}

export const TemaSelector = ({ area, temas, onTemaSelect, onBack }: TemaSelectorProps) => {
  // Si no hay temas específicos, creamos 10 temas genéricos
  const temasToShow = temas.length > 0 ? temas : Array.from({ length: 10 }, (_, i) => `Tema ${i + 1}`);

  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
        <h2 className="text-2xl font-bold text-gray-900">Temas del Área {area}</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {temasToShow.map((tema) => (
          <Card 
            key={tema}
            className="cursor-pointer hover:shadow-lg transition-shadow duration-200 border-2 hover:border-primary"
            onClick={() => onTemaSelect(tema)}
          >
            <CardContent className="p-6 text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center">
                  <FileText className="h-8 w-8 text-secondary" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">{tema}</h3>
              <p className="text-sm text-gray-600 mt-2">Preguntas de {tema}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};