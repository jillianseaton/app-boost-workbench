import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const coingeckoApiKey = Deno.env.get('COINGECKO_API_KEY');
    
    // CoinGecko API endpoint for Bitcoin price
    const url = coingeckoApiKey 
      ? `https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&x_cg_demo_api_key=${coingeckoApiKey}`
      : 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd';
    
    console.log('Fetching Bitcoin price from CoinGecko...');
    
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    const bitcoinPrice = data.bitcoin?.usd;
    
    if (!bitcoinPrice) {
      throw new Error('Bitcoin price not found in response');
    }
    
    console.log('✅ Bitcoin price fetched:', bitcoinPrice);
    
    return new Response(JSON.stringify({
      price: bitcoinPrice,
      currency: 'USD',
      timestamp: new Date().toISOString(),
      source: 'CoinGecko'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('Error fetching Bitcoin price:', error);
    
    return new Response(JSON.stringify({ 
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});