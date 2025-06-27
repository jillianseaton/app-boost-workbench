
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
    // Generate random private key (32 bytes)
    const privateKeyBytes = crypto.getRandomValues(new Uint8Array(32));
    
    // Import bitcoinjs-lib for mainnet address generation
    const bitcoin = await import('https://cdn.skypack.dev/bitcoinjs-lib@6.1.5');
    
    // Create keypair from private key (mainnet)
    const keyPair = bitcoin.ECPair.fromPrivateKey(privateKeyBytes, { network: bitcoin.networks.bitcoin });
    
    // Generate mainnet address (P2PKH - starts with '1')
    const { address } = bitcoin.payments.p2pkh({ 
      pubkey: keyPair.publicKey, 
      network: bitcoin.networks.bitcoin 
    });
    
    // Convert private key to WIF format for mainnet
    const privateKeyWIF = keyPair.toWIF();
    
    console.log('Generated mainnet wallet:', { address, privateKeyWIF });
    
    return new Response(JSON.stringify({
      address,
      privateKey: privateKeyWIF,
      network: 'mainnet'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error generating wallet:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
