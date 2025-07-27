import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Brain, BookOpen, TrendingDown, MessageCircle } from 'lucide-react';
import { ChatMentorIA } from './ChatMentorIA';
import { TarjetasRepaso } from './TarjetasRepaso';

export const MentorIA = () => {
  const [vistaActiva, setVistaActiva] = useState<'inicio' | 'chat' | 'repaso'>('inicio');

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {vistaActiva === 'inicio' && (
        <>
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2 flex items-center justify-center gap-3">
              <Brain className="h-8 w-8 text-primary" />
              Mentor IA
            </h1>
            <p className="text-muted-foreground">
              Tu asistente personal para mejorar tus resultados en los tests
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Chat con IA */}
            <Card className="cursor-pointer hover:shadow-lg transition-shadow duration-200 hover:border-primary">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <MessageCircle className="h-6 w-6 text-primary" />
                  Chat con Mentor IA
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Chatea con tu mentor IA para resolver dudas, obtener explicaciones detalladas y recibir consejos personalizados para mejorar tu rendimiento.
                </p>
                <Button 
                  className="w-full"
                  onClick={() => setVistaActiva('chat')}
                >
                  Iniciar Chat
                </Button>
              </CardContent>
            </Card>

            {/* Ejercicios de Repaso */}
            <Card className="cursor-pointer hover:shadow-lg transition-shadow duration-200 hover:border-primary">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <TrendingDown className="h-6 w-6 text-primary" />
                  Ejercicios de Repaso
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Practica con ejercicios personalizados basados en tus errores más frecuentes para reforzar las áreas que necesitas mejorar.
                </p>
                <Button 
                  className="w-full"
                  onClick={() => setVistaActiva('repaso')}
                >
                  Ver Ejercicios de Repaso
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Información adicional */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <BookOpen className="h-6 w-6 text-primary" />
                ¿Cómo puede ayudarte el Mentor IA?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="bg-primary/10 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                    <MessageCircle className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">Resolución de Dudas</h3>
                  <p className="text-sm text-muted-foreground">
                    Pregunta sobre cualquier tema y obtén explicaciones claras y detalladas
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="bg-primary/10 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                    <TrendingDown className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">Análisis de Errores</h3>
                  <p className="text-sm text-muted-foreground">
                    Identifica patrones en tus errores y recibe ejercicios específicos para mejorar
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="bg-primary/10 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                    <Brain className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">Consejos Personalizados</h3>
                  <p className="text-sm text-muted-foreground">
                    Recibe estrategias de estudio adaptadas a tu rendimiento y objetivos
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {vistaActiva === 'chat' && (
        <ChatMentorIA onVolver={() => setVistaActiva('inicio')} />
      )}

      {vistaActiva === 'repaso' && (
        <TarjetasRepaso onVolver={() => setVistaActiva('inicio')} />
      )}
    </div>
  );
};