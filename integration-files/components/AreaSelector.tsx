import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen } from 'lucide-react';

interface AreaSelectorProps {
  areas: string[];
  onAreaSelect: (area: string) => void;
  loading?: boolean;
}

export const AreaSelector = ({ areas, onAreaSelect, loading }: AreaSelectorProps) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando áreas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Selecciona un Área</h1>
        <p className="text-muted-foreground">
          Elige el área de estudio para comenzar tu test
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {areas.map((area) => (
          <Card 
            key={area}
            className="cursor-pointer hover:shadow-lg transition-shadow duration-200 hover:border-primary"
            onClick={() => onAreaSelect(area)}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <BookOpen className="h-6 w-6 text-primary" />
                {area}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Hacer test del área de {area}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};