import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, FileText } from 'lucide-react';

interface TemaSelectorProps {
  area: string;
  temas: string[];
  onTemaSelect: (tema: string) => void;
  onVolver: () => void;
}

export const TemaSelector = ({ area, temas, onTemaSelect, onVolver }: TemaSelectorProps) => {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="sm" onClick={onVolver}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Selecciona un Tema</h1>
          <p className="text-muted-foreground">
            Área: <span className="font-medium">{area}</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {temas.map((tema) => (
          <Card 
            key={tema}
            className="cursor-pointer hover:shadow-lg transition-shadow duration-200 hover:border-primary"
            onClick={() => onTemaSelect(tema)}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-lg">
                <FileText className="h-5 w-5 text-primary" />
                {tema}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Hacer test del tema: {tema}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};