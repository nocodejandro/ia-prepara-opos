import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Send, Bot, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface MentorIAProps {
  onVolver: () => void;
}

interface Mensaje {
  id: string;
  tipo: 'usuario' | 'ia';
  contenido: string;
  timestamp: Date;
}

export const MentorIA = ({ onVolver }: MentorIAProps) => {
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
      const response = await fetch('/functions/v1/mentor-ia-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: sessionId,
          action: 'sendMessage',
          chatInput: mensaje
        }),
      });

      if (!response.ok) {
        throw new Error('Error en la respuesta del servidor');
      }

      const data = await response.json();
      
      // Asumiendo que la respuesta viene en data.output o similar
      const respuestaIA: Mensaje = {
        id: (Date.now() + 1).toString(),
        tipo: 'ia',
        contenido: data.output || data.response || data.message || 'Lo siento, no pude procesar tu consulta.',
        timestamp: new Date()
      };

      setMensajes(prev => [...prev, respuestaIA]);
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
      toast({
        title: "Error",
        description: "No se pudo conectar con el Mentor IA. Inténtalo de nuevo.",
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
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" onClick={onVolver}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Bot className="h-6 w-6" />
          Mentor IA - Guardia Civil
        </h1>
      </div>

      <Card className="h-[600px] flex flex-col">
        {/* Área de mensajes */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
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
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.contenido}</p>
                <span className="text-xs opacity-70 mt-1 block">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              {msg.tipo === 'usuario' && (
                <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
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
              <div className="bg-gray-100 p-3 rounded-lg">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
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
          <p className="text-xs text-gray-500 mt-2">
            Presiona Enter para enviar. El Mentor IA está especializado en los temas de la oposición de Guardia Civil.
          </p>
        </div>
      </Card>
    </div>
  );
};