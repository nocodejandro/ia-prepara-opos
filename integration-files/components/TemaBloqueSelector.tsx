import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, FileText, Play } from 'lucide-react';

interface Tema {
  tema_numero: number;
  tema_codigo: string;
  tema_nombre: string;
}

interface BloqueGuardiaCivil {
  bloque_numero: number;
  bloque_nombre: string;
  temas: Tema[];
}

interface TemaBloqueGuardiaCivilSelectorProps {
  bloque: BloqueGuardiaCivil;
  onTemaSelect: (tema: Tema) => void;
  onVolver: () => void;
}

export const TemaBloqueGuardiaCivilSelector = ({ 
  bloque, 
  onTemaSelect, 
  onVolver 
}: TemaBloqueGuardiaCivilSelectorProps) => {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="sm" onClick={onVolver}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">
            Bloque {bloque.bloque_numero}: {bloque.bloque_nombre}
          </h1>
          <p className="text-muted-foreground">
            Selecciona un tema para comenzar el test
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {bloque.temas.map((tema) => (
          <Card 
            key={tema.tema_codigo}
            className="cursor-pointer hover:shadow-lg transition-shadow duration-200 hover:border-primary"
            onClick={() => onTemaSelect(tema)}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-lg">
                <FileText className="h-5 w-5 text-primary" />
                <div className="flex-1">
                  <div className="font-semibold">
                    Tema {tema.tema_numero}
                  </div>
                  <div className="text-sm font-normal text-muted-foreground">
                    {tema.tema_codigo}
                  </div>
                </div>
                <Play className="h-4 w-4 text-muted-foreground" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed">
                {tema.tema_nombre}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};