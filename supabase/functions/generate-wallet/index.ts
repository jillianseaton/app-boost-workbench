
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
    // Import crypto functions directly from Deno std library
    const { randomBytes } = await import('https://deno.land/std@0.190.0/crypto/mod.ts');
    
    // Import base58 encoding
    const { encode: base58Encode } = await import('https://deno.land/x/base58@v0.2.0/mod.ts');
    
    // Import secp256k1 for key generation
    const secp256k1 = await import('https://deno.land/x/secp256k1@1.7.1/mod.ts');
    
    // Import crypto hash functions
    const { createHash } = await import('node:crypto');
    
    // Generate random private key (32 bytes)
    const privateKeyBytes = randomBytes(32);
    
    // Generate public key from private key using secp256k1
    const publicKeyBytes = secp256k1.getPublicKey(privateKeyBytes, true); // compressed
    
    // Create Bitcoin testnet address (P2PKH)
    // Hash160 = RIPEMD160(SHA256(publicKey))
    const sha256Hash = createHash('sha256').update(publicKeyBytes).digest();
    const ripemd160Hash = createHash('ripemd160').update(sha256Hash).digest();
    
    // Add testnet version byte (0x6f for testnet P2PKH)
    const versionedHash = new Uint8Array([0x6f, ...ripemd160Hash]);
    
    // Calculate checksum (first 4 bytes of double SHA256)
    const checksum1 = createHash('sha256').update(versionedHash).digest();
    const checksum2 = createHash('sha256').update(checksum1).digest();
    const checksum = checksum2.slice(0, 4);
    
    // Combine versioned hash and checksum
    const addressBytes = new Uint8Array([...versionedHash, ...checksum]);
    
    // Encode as base58
    const address = base58Encode(addressBytes);
    
    // Convert private key to WIF format for testnet
    const wifBytes = new Uint8Array([0xef, ...privateKeyBytes, 0x01]); // 0xef = testnet WIF prefix, 0x01 = compressed
    const wifChecksum1 = createHash('sha256').update(wifBytes).digest();
    const wifChecksum2 = createHash('sha256').update(wifChecksum1).digest();
    const wifFinal = new Uint8Array([...wifBytes, ...wifChecksum2.slice(0, 4)]);
    const privateKeyWIF = base58Encode(wifFinal);
    
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
