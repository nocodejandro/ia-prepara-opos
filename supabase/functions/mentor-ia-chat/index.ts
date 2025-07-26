import "https://deno.land/x/xhr@0.1.0/mod.ts";
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
    console.log('Mentor IA Chat function called');
    
    const { sessionId, action, chatInput } = await req.json();
    
    console.log('Request data:', { sessionId, action, chatInput });

    // Llamar al webhook de n8n
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
      throw new Error(`Error from n8n webhook: ${n8nResponse.status}`);
    }

    const responseData = await n8nResponse.json();
    console.log('n8n response data:', responseData);

    return new Response(JSON.stringify(responseData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in mentor-ia-chat function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      output: 'Lo siento, ha ocurrido un error técnico. Por favor, inténtalo de nuevo.' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});