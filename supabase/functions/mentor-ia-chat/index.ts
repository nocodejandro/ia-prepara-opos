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
    console.log('=== EDGE FUNCTION INICIADA ===');
    console.log('Método:', req.method);
    console.log('URL:', req.url);
    
    if (req.method !== 'POST') {
      console.error('Método no permitido:', req.method);
      return new Response(JSON.stringify({ error: 'Método no permitido' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let requestData;
    try {
      requestData = await req.json();
      console.log('Datos recibidos:', requestData);
    } catch (parseError) {
      console.error('Error al parsear JSON:', parseError);
      return new Response(JSON.stringify({ error: 'JSON inválido' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    const { sessionId, action, chatInput } = requestData;
    
    if (!sessionId || !action || !chatInput) {
      console.error('Datos faltantes:', { sessionId, action, chatInput });
      return new Response(JSON.stringify({ error: 'Faltan datos requeridos' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Llamando a n8n webhook...');
    
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
    console.log('n8n response ok:', n8nResponse.ok);

    if (!n8nResponse.ok) {
      console.error('Error de n8n. Status:', n8nResponse.status);
      const errorText = await n8nResponse.text();
      console.error('Error text:', errorText);
      
      return new Response(JSON.stringify({ 
        error: `Error from n8n webhook: ${n8nResponse.status}`,
        output: 'Lo siento, el servicio de IA no está disponible en este momento. Por favor, inténtalo más tarde.' 
      }), {
        status: 200, // Devolvemos 200 pero con mensaje de error
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const responseData = await n8nResponse.json();
    console.log('n8n response data:', responseData);

    return new Response(JSON.stringify(responseData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('=== ERROR EN EDGE FUNCTION ===');
    console.error('Error completo:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    return new Response(JSON.stringify({ 
      error: error.message,
      output: 'Lo siento, ha ocurrido un error técnico. Por favor, inténtalo de nuevo.' 
    }), {
      status: 200, // Cambiamos a 200 para evitar el error 500
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});