
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { validateApiCredentials } from './validation.ts';
import { 
  handleConnect, 
  handleBalances, 
  handleWithdraw, 
  handleTradeHistory, 
  handleOpenOrders 
} from './handlers.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestBody = await req.json();
    console.log('Received request:', requestBody);
    
    const { action, apiKey, apiSecret, ...params } = requestBody;
    
    console.log(`Kraken API request: action=${action}`);
    
    validateApiCredentials(apiKey, apiSecret);

    let result;

    switch (action) {
      case 'connect':
        result = await handleConnect(apiKey, apiSecret);
        break;

      case 'balances':
        result = await handleBalances(apiKey, apiSecret);
        break;

      case 'withdraw':
        result = await handleWithdraw(params, apiKey, apiSecret);
        break;

      case 'trade_history':
        result = await handleTradeHistory(apiKey, apiSecret);
        break;

      case 'open_orders':
        result = await handleOpenOrders(apiKey, apiSecret);
        break;

      default:
        throw new Error('Invalid action specified');
    }

    console.log('Kraken API request completed successfully');

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Kraken API error:', error);
    
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false,
      timestamp: new Date().toISOString()
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
