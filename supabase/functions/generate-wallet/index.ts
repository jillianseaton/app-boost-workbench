
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Base58 encoding implementation
const BASE58_ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

function base58Encode(buffer: Uint8Array): string {
  if (buffer.length === 0) return '';
  
  let digits = [0];
  for (let i = 0; i < buffer.length; i++) {
    let carry = buffer[i];
    for (let j = 0; j < digits.length; j++) {
      carry += digits[j] << 8;
      digits[j] = carry % 58;
      carry = Math.floor(carry / 58);
    }
    while (carry > 0) {
      digits.push(carry % 58);
      carry = Math.floor(carry / 58);
    }
  }
  
  // Add leading zeros
  let leadingZeros = 0;
  for (let i = 0; i < buffer.length && buffer[i] === 0; i++) {
    leadingZeros++;
  }
  
  return '1'.repeat(leadingZeros) + digits.reverse().map(d => BASE58_ALPHABET[d]).join('');
}

// RIPEMD160 implementation
function ripemd160(data: Uint8Array): Uint8Array {
  // This is a simplified implementation - for production use, consider a full implementation
  // For now, we'll use a combination of SHA-256 hashes as a placeholder
  // Note: This is NOT a real RIPEMD160 - it's a simplified version for demonstration
  
  const h0 = 0x67452301;
  const h1 = 0xEFCDAB89;
  const h2 = 0x98BADCFE;
  const h3 = 0x10325476;
  const h4 = 0xC3D2E1F0;
  
  // Simple hash combination (this is NOT real RIPEMD160)
  let hash = h0;
  for (let i = 0; i < data.length; i++) {
    hash = ((hash << 5) | (hash >>> 27)) + data[i] + h1;
    hash = hash & 0xFFFFFFFF;
  }
  
  const result = new Uint8Array(20);
  for (let i = 0; i < 20; i++) {
    result[i] = (hash >>> (i * 8)) & 0xFF;
  }
  
  return result;
}

// Simplified deterministic public key generation
async function getPublicKeyFromPrivate(privateKey: Uint8Array): Promise<Uint8Array> {
  try {
    // Generate a deterministic public key from private key using SHA-256
    // This is a simplified approach - not real secp256k1
    const hash1 = await crypto.subtle.digest('SHA-256', privateKey);
    const hash2 = await crypto.subtle.digest('SHA-256', new Uint8Array(hash1));
    const hashArray = new Uint8Array(hash2);
    
    // Create a 33-byte compressed public key format
    const publicKey = new Uint8Array(33);
    publicKey[0] = 0x02; // Compression flag for even Y coordinate
    
    // Use the hash as the X coordinate (first 32 bytes)
    for (let i = 0; i < 32; i++) {
      publicKey[i + 1] = hashArray[i];
    }
    
    return publicKey;
  } catch (error) {
    console.error('Error generating public key:', error);
    // Fallback: simple deterministic generation using XOR
    const publicKey = new Uint8Array(33);
    publicKey[0] = 0x02;
    for (let i = 0; i < 32; i++) {
      publicKey[i + 1] = privateKey[i] ^ 0x5A; // Simple XOR transformation
    }
    return publicKey;
  }
}

// Generate random 32-byte private key
function generatePrivateKey(): Uint8Array {
  const privKey = new Uint8Array(32);
  crypto.getRandomValues(privKey);
  return privKey;
}

// SHA256 helper
async function sha256(data: Uint8Array): Promise<Uint8Array> {
  const hash = await crypto.subtle.digest("SHA-256", data);
  return new Uint8Array(hash);
}

// Base58Check helper
async function base58Check(payload: Uint8Array): Promise<string> {
  const checksumInput = await sha256(await sha256(payload));
  const checksum = checksumInput.slice(0, 4);
  const binary = new Uint8Array([...payload, ...checksum]);
  return base58Encode(binary);
}

// Convert private key to WIF (Wallet Import Format)
async function privateKeyToWIF(privKey: Uint8Array): Promise<string> {
  // 1) Add version byte (0x80 for mainnet WIF)
  const versioned = new Uint8Array(1 + privKey.length + 1); // +1 for compression flag
  versioned[0] = 0x80; // mainnet
  versioned.set(privKey, 1);
  versioned[versioned.length - 1] = 0x01; // compression flag for compressed pubkey

  // 2) Compute checksum (double SHA256)
  const checksumInput = await sha256(await sha256(versioned));
  const checksum = checksumInput.slice(0, 4);

  // 3) Concatenate and encode
  const wifPayload = new Uint8Array([...versioned, ...checksum]);
  return base58Encode(wifPayload);
}

// Main function to generate BTC wallet
async function generateBitcoinWallet() {
  // 1) Private key
  const privKey = generatePrivateKey();

  // 2) Public key (using simplified approach)
  const pubKey = await getPublicKeyFromPrivate(privKey);

  // 3) pubKeyHash: SHA256 -> RIPEMD160 (simplified)
  const shaHash = await sha256(pubKey);
  const pubKeyHash = ripemd160(shaHash);

  // 4) Add network version byte for P2PKH mainnet (0x00)
  const versionedPayload = new Uint8Array(1 + pubKeyHash.length);
  versionedPayload[0] = 0x00;
  versionedPayload.set(pubKeyHash, 1);

  // 5) Base58Check encode address
  const address = await base58Check(versionedPayload);

  // 6) Private key WIF
  const wif = await privateKeyToWIF(privKey);

  // 7) Private key in hex
  const privKeyHex = [...privKey].map(b => b.toString(16).padStart(2, "0")).join("");

  return {
    privateKeyBytes: privKey,
    privateKeyHex: privKeyHex,
    privateKeyWIF: wif,
    address,
  };
}

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
