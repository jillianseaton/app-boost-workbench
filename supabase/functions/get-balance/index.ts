
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
    
    const blockcypherToken = Deno.env.get('BLOCKCYPHER_API_KEY');
    console.log('Fetching balance for address:', address);
    
    // Try BlockCypher first, fall back to mempool.space
    let balanceSats, balanceBTC, transactions, source;
    
    try {
      // BlockCypher API endpoint for address balance
      const url = blockcypherToken 
        ? `https://api.blockcypher.com/v1/btc/main/addrs/${address}/balance?token=${blockcypherToken}`
        : `https://api.blockcypher.com/v1/btc/main/addrs/${address}/balance`;
      
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        balanceSats = data.balance || 0;
        balanceBTC = balanceSats / 100000000;
        transactions = data.n_tx || 0;
        source = 'BlockCypher';
        console.log('✅ Balance fetched from BlockCypher:', { balanceSats, balanceBTC, transactions });
      } else {
        throw new Error('BlockCypher failed, trying mempool.space');
      }
    } catch (error) {
      console.log('BlockCypher failed, falling back to mempool.space:', error.message);
      
      // Fallback to mempool.space
      const response = await fetch(`https://mempool.space/api/address/${address}`);
      
      if (!response.ok) {
        throw new Error(`Both APIs failed. Mempool.space error: ${response.statusText}`);
      }
      
      const data = await response.json();
      balanceSats = data.chain_stats.funded_txo_sum - data.chain_stats.spent_txo_sum;
      balanceBTC = balanceSats / 100000000;
      transactions = data.chain_stats.tx_count;
      source = 'Mempool.space';
      console.log('✅ Balance fetched from mempool.space:', { balanceSats, balanceBTC, transactions });
    }
    
    return new Response(JSON.stringify({
      address,
      balanceSats,
      balanceBTC,
      transactions,
      source,
      timestamp: new Date().toISOString(),
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
