import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('=== MENTOR IA CHAT INICIADO ===');
    console.log('Method:', req.method);
    
    // Obtener los datos del request
    const requestData = await req.json();
    console.log('Request data:', requestData);
    
    const { sessionId, action, chatInput, tema, area, totalErrores } = requestData;
    
    // Determinar la URL del webhook según la acción
    let webhookUrl = 'https://automatizaciones-n8n.dgkviv.easypanel.host/webhook/e47786e9-4d0f-410b-b702-7645a4214f91/chat';
    
    if (action === 'generateReviewExercises') {
      webhookUrl = 'https://automatizaciones-n8n.dgkviv.easypanel.host/webhook-test/dc3ac130-f224-43af-bfb1-8f3c2810acad';
    }

    // Preparar el payload para n8n
    const n8nPayload = action === 'generateReviewExercises' ? {
      tema,
      area,
      totalErrores,
      action: 'generateReviewExercises'
    } : {
      sessionId,
      action,
      chatInput
    };
    
    console.log('Payload para n8n:', JSON.stringify(n8nPayload, null, 2));
    
    // Llamar al webhook de n8n
    console.log('Llamando a n8n webhook...');
    console.log('URL:', webhookUrl);
    
    try {
      const n8nResponse = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Supabase-Edge-Function',
        },
        body: JSON.stringify(n8nPayload),
      });

      console.log('n8n response status:', n8nResponse.status);
      console.log('n8n response headers:', Object.fromEntries(n8nResponse.headers.entries()));
      
      if (!n8nResponse.ok) {
        const errorText = await n8nResponse.text();
        console.error('n8n error response:', errorText);
        console.error('n8n error status:', n8nResponse.status);
        
        // Si n8n falla, devolvemos una respuesta de fallback
        const fallbackMessage = action === 'generateReviewExercises' 
          ? `No se pudieron generar ejercicios para ${tema}. Intenta repasar manualmente.`
          : `Lo siento, el servicio de IA no está disponible en este momento (Status: ${n8nResponse.status}). Como alternativa, puedo decirte que sobre "${chatInput}" necesitarías consultar los materiales de estudio específicos. ¿Podrías ser más específico sobre qué tema necesitas ayuda?`;
        
        return new Response(JSON.stringify({
          output: fallbackMessage,
          exercises: action === 'generateReviewExercises' ? [] : undefined,
          status: 'fallback',
          debug: {
            n8nStatus: n8nResponse.status,
            error: errorText
          }
        }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const responseData = await n8nResponse.json();
      console.log('n8n response data:', responseData);

      return new Response(JSON.stringify(responseData), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
      
    } catch (fetchError) {
      console.error('Error al hacer fetch a n8n:', fetchError);
      console.error('Fetch error message:', fetchError.message);
      console.error('Fetch error stack:', fetchError.stack);
      
      const connectionErrorMessage = action === 'generateReviewExercises'
        ? `Error de conectividad al generar ejercicios para ${tema}.`
        : `Error de conectividad con n8n: ${fetchError.message}. Sobre "${chatInput}" te recomiendo consultar los materiales de estudio específicos.`;
      
      return new Response(JSON.stringify({
        output: connectionErrorMessage,
        exercises: action === 'generateReviewExercises' ? [] : undefined,
        status: 'connection_error',
        debug: {
          error: fetchError.message,
          type: 'fetch_error'
        }
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

  } catch (error) {
    console.error('=== ERROR EN MENTOR IA ===');
    console.error('Error:', error);
    return new Response(JSON.stringify({ 
      output: 'Lo siento, ha ocurrido un error técnico. El Mentor IA estará disponible pronto. Mientras tanto, te recomiendo revisar los materiales de estudio.',
      error: error.message,
      status: 'error'
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});