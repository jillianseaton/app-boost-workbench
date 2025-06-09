
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
    const { address } = await req.json();
    
    if (!address) {
      throw new Error('Address is required');
    }
    
    console.log('Getting balance for address:', address);
    
    // Fetch balance from mempool.space mainnet API
    const response = await fetch(`https://mempool.space/api/address/${address}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch balance: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Calculate balance in satoshis
    const balanceSats = data.chain_stats.funded_txo_sum - data.chain_stats.spent_txo_sum;
    const balanceBTC = balanceSats / 100000000; // Convert to BTC
    
    console.log('Balance data:', { balanceSats, balanceBTC, data });
    
    return new Response(JSON.stringify({
      balanceSats,
      balanceBTC,
      address,
      transactions: data.chain_stats.tx_count,
      network: 'mainnet'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error getting balance:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
