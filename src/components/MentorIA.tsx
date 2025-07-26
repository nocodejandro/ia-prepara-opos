import { Button } from '@/components/ui/button';
import { ArrowLeft, Bot, BrainCircuit } from 'lucide-react';
import { ChatMentorIA } from './ChatMentorIA';
import { TarjetasRepaso } from './TarjetasRepaso';

interface MentorIAProps {
  onVolver: () => void;
}

export const MentorIA = ({ onVolver }: MentorIAProps) => {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" onClick={onVolver}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <BrainCircuit className="h-6 w-6" />
          Mentor IA - Guardia Civil
        </h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Tarjetas de repaso */}
        <div className="space-y-4">
          <TarjetasRepaso />
        </div>

        {/* Chat interactivo */}
        <div className="space-y-4">
          <ChatMentorIA className="h-[600px]" />
        </div>
      </div>
    </div>
  );
};