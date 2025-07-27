import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('=== MENTOR IA CHAT - FUNCIÓN INICIADA ===');
  console.log('Method:', req.method);
  console.log('URL:', req.url);
  console.log('Headers:', Object.fromEntries(req.headers.entries()));

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Returning CORS preflight response');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('=== PROCESANDO REQUEST ===');
    
    // Obtener los datos del request
    const requestData = await req.json();
    console.log('Request data:', requestData);
    
    const { sessionId, action, chatInput, tema, area, totalErrores } = requestData;
    
    // Determinar la URL del webhook según la acción
    let webhookUrl = 'https://automatizaciones-n8n.dgkviv.easypanel.host/webhook/e47786e9-4d0f-410b-b702-7645a4214f91/chat';
    
    if (action === 'sendMentoriaData') {
      webhookUrl = 'https://automatizaciones-n8n.dgkviv.easypanel.host/webhook/dc3ac130-f224-43af-bfb1-8f3c2810acad';
      console.log('=== ENVIANDO DATOS DE MENTORÍA A N8N ===');
      console.log('Pregunta ID:', requestData.pregunta_id);
      console.log('Pregunta Texto:', requestData.pregunta_texto);
      console.log('Justificación:', requestData.justificacion);
      console.log('Fallos:', requestData.fallos);
    }

    // Preparar el payload para n8n
    const n8nPayload = action === 'sendMentoriaData' ? {
      pregunta_id: requestData.pregunta_id,
      pregunta_texto: requestData.pregunta_texto,
      justificacion: requestData.justificacion,
      fallos: requestData.fallos,
      user_id: requestData.user_id,
      action: 'sendMentoriaData'
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
        const fallbackMessage = action === 'sendMentoriaData' 
          ? `No se pudieron procesar los datos de mentoría. Intenta más tarde.`
          : `Lo siento, el servicio de IA no está disponible en este momento (Status: ${n8nResponse.status}). Como alternativa, puedo decirte que sobre "${chatInput}" necesitarías consultar los materiales de estudio específicos. ¿Podrías ser más específico sobre qué tema necesitas ayuda?`;
        
        return new Response(JSON.stringify({
          output: fallbackMessage,
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
      
      const connectionErrorMessage = action === 'sendMentoriaData'
        ? `Error de conectividad al procesar datos de mentoría.`
        : `Error de conectividad con n8n: ${fetchError.message}. Sobre "${chatInput}" te recomiendo consultar los materiales de estudio específicos.`;
      
      return new Response(JSON.stringify({
        output: connectionErrorMessage,
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