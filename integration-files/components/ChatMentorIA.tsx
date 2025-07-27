import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowLeft, Send, Bot, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Mensaje {
  id: string;
  contenido: string;
  esUsuario: boolean;
  timestamp: Date;
}

interface ChatMentorIAProps {
  onVolver: () => void;
}

export const ChatMentorIA = ({ onVolver }: ChatMentorIAProps) => {
  const [mensajes, setMensajes] = useState<Mensaje[]>([
    {
      id: '1',
      contenido: '¡Hola! Soy tu Mentor IA. Estoy aquí para ayudarte con tus estudios. Puedes preguntarme sobre cualquier tema, pedirme que te explique conceptos o solicitar consejos para mejorar tu rendimiento en los tests. ¿En qué puedo ayudarte?',
      esUsuario: false,
      timestamp: new Date()
    }
  ]);
  const [mensajeActual, setMensajeActual] = useState('');
  const [enviando, setEnviando] = useState(false);

  const enviarMensaje = async () => {
    if (!mensajeActual.trim() || enviando) return;

    const nuevoMensaje: Mensaje = {
      id: Date.now().toString(),
      contenido: mensajeActual,
      esUsuario: true,
      timestamp: new Date()
    };

    setMensajes(prev => [...prev, nuevoMensaje]);
    setMensajeActual('');
    setEnviando(true);

    try {
      const { data, error } = await supabase.functions.invoke('mentor-ia-chat', {
        body: {
          message: mensajeActual,
          action: 'chat'
        }
      });

      if (error) throw error;

      const respuestaIA: Mensaje = {
        id: (Date.now() + 1).toString(),
        contenido: data.response || 'Lo siento, hubo un error al procesar tu mensaje.',
        esUsuario: false,
        timestamp: new Date()
      };

      setMensajes(prev => [...prev, respuestaIA]);
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
      const mensajeError: Mensaje = {
        id: (Date.now() + 1).toString(),
        contenido: 'Lo siento, hubo un error al conectar con el mentor IA. Por favor, inténtalo de nuevo.',
        esUsuario: false,
        timestamp: new Date()
      };
      setMensajes(prev => [...prev, mensajeError]);
    } finally {
      setEnviando(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      enviarMensaje();
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="sm" onClick={onVolver}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Chat con Mentor IA</h1>
          <p className="text-muted-foreground">
            Pregunta lo que necesites sobre tus estudios
          </p>
        </div>
      </div>

      <Card className="h-[600px] flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Mentor IA
          </CardTitle>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col gap-4">
          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-4">
              {mensajes.map((mensaje) => (
                <div
                  key={mensaje.id}
                  className={`flex gap-3 ${mensaje.esUsuario ? 'justify-end' : 'justify-start'}`}
                >
                  {!mensaje.esUsuario && (
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                  )}
                  
                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${
                      mensaje.esUsuario
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {mensaje.contenido}
                    </p>
                    <p className="text-xs opacity-70 mt-1">
                      {mensaje.timestamp.toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>
                  
                  {mensaje.esUsuario && (
                    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                      <User className="h-4 w-4" />
                    </div>
                  )}
                </div>
              ))}
              
              {enviando && (
                <div className="flex gap-3 justify-start">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                  <div className="bg-muted p-3 rounded-lg">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
          
          <div className="flex gap-2">
            <Input
              value={mensajeActual}
              onChange={(e) => setMensajeActual(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Escribe tu pregunta aquí..."
              disabled={enviando}
              className="flex-1"
            />
            <Button 
              onClick={enviarMensaje}
              disabled={!mensajeActual.trim() || enviando}
              size="icon"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};