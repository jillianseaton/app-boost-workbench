
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
    // Import bitcoinjs-lib from CDN
    const bitcoin = await import('https://cdn.skypack.dev/bitcoinjs-lib@6.1.5');
    const { randomBytes } = await import('https://deno.land/std@0.190.0/crypto/mod.ts');
    
    // Generate random private key
    const privateKeyBytes = randomBytes(32);
    const privateKey = bitcoin.ECPair.fromPrivateKey(privateKeyBytes, { network: bitcoin.networks.testnet });
    
    // Generate public key and address
    const { address } = bitcoin.payments.p2pkh({ 
      pubkey: privateKey.publicKey, 
      network: bitcoin.networks.testnet 
    });
    
    // Convert private key to WIF format
    const privateKeyWIF = privateKey.toWIF();
    
    console.log('Generated wallet:', { address, privateKeyWIF });
    
    return new Response(JSON.stringify({
      address,
      privateKey: privateKeyWIF,
      network: 'testnet'
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
