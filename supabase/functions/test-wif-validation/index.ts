import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('test-wif-validation function called with method:', req.method);
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestBody = await req.json();
    console.log('Received request body:', requestBody);
    
    const { privateKeyWIF, address } = requestBody;
    
    if (!privateKeyWIF || !address) {
      throw new Error('Private key WIF and address are required');
    }
    
    // Import bitcoinjs-lib
    const bitcoin = await import('https://esm.sh/bitcoinjs-lib@6.1.5');
    
    console.log('Testing WIF:', privateKeyWIF);
    console.log('Expected address:', address);
    
    // Test if WIF can be parsed and generates the expected address
    try {
      const keyPair = bitcoin.ECPair.fromWIF(privateKeyWIF, bitcoin.networks.bitcoin);
      const { address: derivedAddress } = bitcoin.payments.p2pkh({ 
        pubkey: keyPair.publicKey, 
        network: bitcoin.networks.bitcoin 
      });
      
      console.log('Derived address:', derivedAddress);
      console.log('Addresses match:', derivedAddress === address);
      
      const valid = derivedAddress === address;
      
      return new Response(JSON.stringify({
        valid,
        derivedAddress,
        expectedAddress: address,
        match: derivedAddress === address,
        wifValid: true,
        publicKey: keyPair.publicKey.toString('hex'),
        compressed: keyPair.compressed
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
      
    } catch (wifError) {
      console.error('WIF parsing error:', wifError);
      
      return new Response(JSON.stringify({
        valid: false,
        error: wifError.message,
        wifValid: false,
        derivedAddress: null,
        expectedAddress: address
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
  } catch (error) {
    console.error('Error in WIF validation:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      valid: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});