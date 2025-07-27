import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield } from 'lucide-react';

interface BloqueGuardiaCivil {
  bloque_numero: number;
  bloque_nombre: string;
  temas: {
    tema_numero: number;
    tema_codigo: string;
    tema_nombre: string;
  }[];
}

interface BloqueGuardiaCivilSelectorProps {
  bloques: BloqueGuardiaCivil[];
  onBloqueSelect: (bloque: BloqueGuardiaCivil) => void;
  loading?: boolean;
}

export const BloqueGuardiaCivilSelector = ({ 
  bloques, 
  onBloqueSelect, 
  loading 
}: BloqueGuardiaCivilSelectorProps) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando bloques...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Bloques Guardia Civil</h1>
        <p className="text-muted-foreground">
          Selecciona un bloque para ver sus temas
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {bloques.map((bloque) => (
          <Card 
            key={bloque.bloque_numero}
            className="cursor-pointer hover:shadow-lg transition-shadow duration-200 hover:border-primary"
            onClick={() => onBloqueSelect(bloque)}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Shield className="h-6 w-6 text-primary" />
                <div>
                  <div className="text-lg">Bloque {bloque.bloque_numero}</div>
                  <div className="text-sm font-normal text-muted-foreground">
                    {bloque.bloque_nombre}
                  </div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-2">
                {bloque.temas.length} temas disponibles
              </p>
              <div className="text-xs text-muted-foreground">
                Temas: {bloque.temas.slice(0, 3).map(t => t.tema_numero).join(', ')}
                {bloque.temas.length > 3 && '...'}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};