
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { encode as base58encode } from "https://deno.land/x/btc_base58@v1.0.0/mod.ts";
import { ripemd160 } from "https://deno.land/x/ripemd160@v1.0.2/mod.ts";
import { getPublicKey } from "https://deno.land/x/secp256k1@1.0.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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
  return base58encode(binary);
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
  return base58encode(wifPayload);
}

// Main function to generate BTC wallet
async function generateBitcoinWallet() {
  // 1) Private key
  const privKey = generatePrivateKey();

  // 2) Compressed public key
  const pubKey = getPublicKey(privKey, true);

  // 3) pubKeyHash: SHA256 -> RIPEMD160
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
    console.log('Generating Bitcoin wallet with proper cryptography...');
    
    const wallet = await generateBitcoinWallet();
    
    console.log('✅ Generated Bitcoin wallet:');
    console.log('Address:      ', wallet.address);
    console.log('Private key (hex):', wallet.privateKeyHex);
    console.log('Private key (WIF):', wallet.privateKeyWIF);
    
    return new Response(JSON.stringify({
      address: wallet.address,
      privateKey: wallet.privateKeyWIF,
      privateKeyHex: wallet.privateKeyHex,
      network: 'mainnet'
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
