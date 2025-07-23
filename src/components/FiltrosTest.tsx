import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAreasYTemas } from "@/hooks/usePreguntas";
import { Filter, Play } from "lucide-react";

interface FiltrosTestProps {
  areaSeleccionada?: string;
  temaSeleccionado?: string;
  onAreaChange: (area: string) => void;
  onTemaChange: (tema: string) => void;
  onIniciarTest: () => void;
  cantidadPreguntas: number;
}

export function FiltrosTest({
  areaSeleccionada,
  temaSeleccionado,
  onAreaChange,
  onTemaChange,
  onIniciarTest,
  cantidadPreguntas
}: FiltrosTestProps) {
  const { areas, temas, loading } = useAreasYTemas();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Selecciona el tema de estudio
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Área</label>
            <Select
              value={areaSeleccionada}
              onValueChange={(value) => {
                onAreaChange(value);
                onTemaChange(''); // Reset tema cuando cambia el área
              }}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un área" />
              </SelectTrigger>
              <SelectContent>
                {areas.map((area) => (
                  <SelectItem key={area} value={area}>
                    Área {area}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Tema</label>
            <Select
              value={temaSeleccionado}
              onValueChange={onTemaChange}
              disabled={!areaSeleccionada || loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un tema" />
              </SelectTrigger>
              <SelectContent>
                {areaSeleccionada && temas[areaSeleccionada]?.map((tema) => (
                  <SelectItem key={tema} value={tema}>
                    {tema}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {cantidadPreguntas > 0 && (
          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm text-muted-foreground">
              Preguntas disponibles: <span className="font-semibold text-foreground">{cantidadPreguntas}</span>
            </p>
          </div>
        )}

        <Button
          onClick={onIniciarTest}
          disabled={!areaSeleccionada || !temaSeleccionado || cantidadPreguntas === 0}
          className="w-full"
          size="lg"
        >
          <Play className="h-4 w-4 mr-2" />
          Iniciar Test
        </Button>
      </CardContent>
    </Card>
  );
}