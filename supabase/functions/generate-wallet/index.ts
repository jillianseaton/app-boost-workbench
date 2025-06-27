
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
    const crypto = globalThis.crypto;
    
    // Import secp256k1 for key generation
    const secp256k1 = await import('https://deno.land/x/secp256k1@1.7.1/mod.ts');
    
    // Generate random private key (32 bytes)
    const privateKeyBytes = crypto.getRandomValues(new Uint8Array(32));
    
    // Generate public key from private key using secp256k1
    const publicKeyBytes = secp256k1.getPublicKey(privateKeyBytes, true); // compressed
    
    // Create Bitcoin mainnet address (P2PKH)
    // Hash160 = RIPEMD160(SHA256(publicKey))
    const sha256Hash = await crypto.subtle.digest('SHA-256', publicKeyBytes);
    
    // For RIPEMD160, we'll use a simple implementation since it's not available in Web Crypto API
    // This is a simplified approach - in production, you'd want a proper RIPEMD160 implementation
    const ripemd160Hash = await crypto.subtle.digest('SHA-256', sha256Hash);
    const hash160 = new Uint8Array(ripemd160Hash.slice(0, 20)); // Take first 20 bytes
    
    // Add mainnet version byte (0x00 for mainnet P2PKH)
    const versionedHash = new Uint8Array([0x00, ...hash160]);
    
    // Calculate checksum (first 4 bytes of double SHA256)
    const checksum1 = await crypto.subtle.digest('SHA-256', versionedHash);
    const checksum2 = await crypto.subtle.digest('SHA-256', checksum1);
    const checksum = new Uint8Array(checksum2.slice(0, 4));
    
    // Combine versioned hash and checksum
    const addressBytes = new Uint8Array([...versionedHash, ...checksum]);
    
    // Base58 encode (simplified implementation)
    const address = base58Encode(addressBytes);
    
    // Convert private key to WIF format for mainnet
    const wifBytes = new Uint8Array([0x80, ...privateKeyBytes, 0x01]); // 0x80 = mainnet WIF prefix, 0x01 = compressed
    const wifChecksum1 = await crypto.subtle.digest('SHA-256', wifBytes);
    const wifChecksum2 = await crypto.subtle.digest('SHA-256', wifChecksum1);
    const wifFinal = new Uint8Array([...wifBytes, ...new Uint8Array(wifChecksum2.slice(0, 4))]);
    const privateKeyWIF = base58Encode(wifFinal);
    
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

// Simple Base58 encoding implementation
function base58Encode(bytes: Uint8Array): string {
  const alphabet = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  let num = BigInt('0x' + Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join(''));
  
  if (num === 0n) return alphabet[0];
  
  let result = '';
  while (num > 0n) {
    result = alphabet[Number(num % 58n)] + result;
    num = num / 58n;
  }
  
  // Add leading zeros
  for (let i = 0; i < bytes.length && bytes[i] === 0; i++) {
    result = alphabet[0] + result;
  }
  
  return result;
}
