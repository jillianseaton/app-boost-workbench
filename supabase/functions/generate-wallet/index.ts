
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { generateBitcoinWallet } from './crypto/wallet.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Generating Bitcoin wallet with native implementations...');
    
    const wallet = await generateBitcoinWallet();
    
    console.log('✅ Generated Bitcoin wallet:');
    console.log('Address:      ', wallet.address);
    console.log('Private key (hex):', wallet.privateKeyHex);
    console.log('Private key (WIF):', wallet.privateKeyWIF);
    
    return new Response(JSON.stringify({
      address: wallet.address,
      privateKey: wallet.privateKeyWIF,
      privateKeyHex: wallet.privateKeyHex,
      network: 'mainnet',
      note: 'Generated with native implementations - not for production Bitcoin use'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error generating wallet:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: 'Failed to generate Bitcoin wallet'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
