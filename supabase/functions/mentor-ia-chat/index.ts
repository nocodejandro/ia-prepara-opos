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
    
    const { sessionId, action, chatInput } = requestData;
    
    // Llamar al webhook de n8n
    console.log('Llamando a n8n webhook...');
    const n8nResponse = await fetch('https://automatizaciones-n8n.dgkviv.easypanel.host/webhook/e47786e9-4d0f-410b-b702-7645a4214f91/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sessionId,
        action,
        chatInput
      }),
    });

    console.log('n8n response status:', n8nResponse.status);

    if (!n8nResponse.ok) {
      console.error('Error de n8n:', n8nResponse.status);
      // Si n8n falla, devolvemos una respuesta de fallback
      return new Response(JSON.stringify({
        output: `Lo siento, el servicio de IA no está disponible en este momento. Como alternativa, puedo decirte que sobre "${chatInput}" necesitarías consultar los materiales de estudio específicos. ¿Podrías ser más específico sobre qué tema necesitas ayuda?`,
        status: 'fallback'
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