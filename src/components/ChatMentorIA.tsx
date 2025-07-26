import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Send, Bot, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Mensaje {
  id: string;
  tipo: 'usuario' | 'ia';
  contenido: string;
  timestamp: Date;
}

interface ChatMentorIAProps {
  className?: string;
}

export const ChatMentorIA = ({ className }: ChatMentorIAProps) => {
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [mensaje, setMensaje] = useState('');
  const [cargando, setCargando] = useState(false);
  const [sessionId] = useState(() => Math.random().toString(36).substring(2) + Date.now().toString(36));
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [mensajes]);

  // Mensaje inicial de bienvenida
  useEffect(() => {
    setMensajes([{
      id: '1',
      tipo: 'ia',
      contenido: '¡Hola! Soy tu Mentor IA especializado en Guardia Civil. Puedo ayudarte con preguntas sobre Derechos Humanos, Igualdad de Género y Prevención de Riesgos Laborales. ¿En qué puedo asistirte?',
      timestamp: new Date()
    }]);
  }, []);

  const enviarMensaje = async () => {
    if (!mensaje.trim() || cargando) return;

    const mensajeUsuario: Mensaje = {
      id: Date.now().toString(),
      tipo: 'usuario',
      contenido: mensaje,
      timestamp: new Date()
    };

    setMensajes(prev => [...prev, mensajeUsuario]);
    setMensaje('');
    setCargando(true);

    try {
      const { data, error } = await supabase.functions.invoke('mentor-ia-chat', {
        body: {
          sessionId: sessionId,
          action: 'sendMessage',
          chatInput: mensaje
        }
      });

      if (error) {
        throw new Error(`Edge Function Error: ${error.message || JSON.stringify(error)}`);
      }

      const respuestaIA: Mensaje = {
        id: (Date.now() + 1).toString(),
        tipo: 'ia',
        contenido: data?.output || data?.response || data?.message || 'Lo siento, no pude procesar tu consulta.',
        timestamp: new Date()
      };

      setMensajes(prev => [...prev, respuestaIA]);
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
      
      toast({
        title: "Error",
        description: `Error: ${error?.message || 'Error desconocido'}`,
        variant: "destructive",
      });
    } finally {
      setCargando(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      enviarMensaje();
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5" />
          Chat Interactivo
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {/* Área de mensajes */}
        <div className="h-96 p-4 overflow-y-auto space-y-4">
          {mensajes.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.tipo === 'usuario' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.tipo === 'ia' && (
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="h-4 w-4 text-white" />
                </div>
              )}
              
              <div
                className={`max-w-[70%] p-3 rounded-lg ${
                  msg.tipo === 'usuario'
                    ? 'bg-primary text-white'
                    : 'bg-muted text-foreground'
                }`}
              >
                <p className="whitespace-pre-wrap text-sm">{msg.contenido}</p>
                <span className="text-xs opacity-70 mt-1 block">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              {msg.tipo === 'usuario' && (
                <div className="w-8 h-8 bg-muted-foreground rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="h-4 w-4 text-white" />
                </div>
              )}
            </div>
          ))}

          {cargando && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <div className="bg-muted p-3 rounded-lg">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Área de input */}
        <div className="border-t p-4">
          <div className="flex gap-2">
            <Input
              value={mensaje}
              onChange={(e) => setMensaje(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Escribe tu pregunta sobre Guardia Civil..."
              disabled={cargando}
              className="flex-1"
            />
            <Button 
              onClick={enviarMensaje}
              disabled={!mensaje.trim() || cargando}
              size="icon"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Presiona Enter para enviar. El Mentor IA está especializado en los temas de la oposición de Guardia Civil.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};