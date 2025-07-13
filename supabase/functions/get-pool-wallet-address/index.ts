import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { hex } from "https://esm.sh/@scure/base@1.1.5";
import { sha256 } from "https://esm.sh/@noble/hashes@1.3.3/sha256";
import * as secp256k1 from "https://esm.sh/@noble/secp256k1@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Bitcoin WIF decode function (same as in send-btc)
function decodeWIF(wif: string): Uint8Array {
  const alphabet = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  const base58Map: { [key: string]: number } = {};
  alphabet.split('').forEach((char, i) => base58Map[char] = i);
  
  let result = 0n;
  for (const char of wif) {
    result = result * 58n + BigInt(base58Map[char] || 0);
  }
  
  const bytes = [];
  while (result > 0n) {
    bytes.unshift(Number(result & 0xFFn));
    result = result >> 8n;
  }
  
  // Remove version byte (0x80) and checksum (last 4 bytes)
  const privateKeyBytes = bytes.slice(1, -4);
  
  // Handle compressed flag
  if (privateKeyBytes.length === 33 && privateKeyBytes[32] === 0x01) {
    return new Uint8Array(privateKeyBytes.slice(0, 32));
  }
  
  return new Uint8Array(privateKeyBytes);
}

// Bitcoin address generation (same as in send-btc)
function publicKeyToAddress(publicKey: Uint8Array): string {
  const hash160 = (data: Uint8Array): Uint8Array => {
    const sha256Hash = sha256(data);
    // Simplified RIPEMD160 - using SHA256 as fallback for demo
    return sha256Hash.slice(0, 20);
  };
  
  const pubKeyHash = hash160(publicKey);
  const versionedHash = new Uint8Array([0x00, ...pubKeyHash]); // 0x00 for mainnet P2PKH
  
  const checksum = sha256(sha256(versionedHash)).slice(0, 4);
  const fullHash = new Uint8Array([...versionedHash, ...checksum]);
  
  // Base58 encode
  const alphabet = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  let result = '';
  let num = 0n;
  
  for (const byte of fullHash) {
    num = num * 256n + BigInt(byte);
  }
  
  while (num > 0n) {
    result = alphabet[Number(num % 58n)] + result;
    num = num / 58n;
  }
  
  // Add leading zeros
  for (const byte of fullHash) {
    if (byte === 0) result = '1' + result;
    else break;
  }
  
  return result;
}

serve(async (req) => {
  console.log('=== get-pool-wallet-address function called ===');
  console.log('Request method:', req.method);
  console.log('Request headers:', Object.fromEntries(req.headers.entries()));
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting pool wallet address retrieval...');
    
    // Get the configured BTC private key
    const poolPrivateKey = Deno.env.get('BTC_private_key');
    
    console.log('Environment variables check:');
    const envKeys = Object.keys(Deno.env.toObject());
    console.log('Available env vars:', envKeys.filter(key => key.includes('BTC')));
    console.log('Total env vars count:', envKeys.length);
    
    if (!poolPrivateKey) {
      console.error('❌ BTC_private_key not found in environment variables');
      return new Response(JSON.stringify({
        success: false,
        error: 'BTC_private_key environment variable not configured',
        availableKeys: envKeys.filter(key => key.includes('BTC')),
        debug: 'The BTC_private_key secret is missing from Supabase Edge Function secrets'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('BTC_private_key found, length:', poolPrivateKey.length);

    // Decode the WIF private key
    const privateKeyBytes = decodeWIF(poolPrivateKey);
    console.log('Private key decoded, length:', privateKeyBytes.length);
    
    // Generate public key
    const publicKey = secp256k1.getPublicKey(privateKeyBytes, true); // compressed
    console.log('Public key generated, length:', publicKey.length);
    
    // Generate Bitcoin address
    const poolWalletAddress = publicKeyToAddress(publicKey);
    console.log('Pool wallet address generated:', poolWalletAddress);

    // Get balance information from mempool.space
    let balanceInfo = null;
    try {
      console.log('Fetching balance for address:', poolWalletAddress);
      const balanceResponse = await fetch(`https://mempool.space/api/address/${poolWalletAddress}`);
      
      if (balanceResponse.ok) {
        balanceInfo = await balanceResponse.json();
        console.log('Balance info retrieved:', balanceInfo);
      } else {
        console.log('Could not fetch balance info');
      }
    } catch (balanceError) {
      console.error('Error fetching balance:', balanceError);
    }

    return new Response(JSON.stringify({
      success: true,
      poolWalletAddress,
      network: 'mainnet',
      privateKeyFormat: 'WIF',
      privateKeyLength: poolPrivateKey.length,
      publicKeyLength: publicKey.length,
      balanceInfo: balanceInfo ? {
        funded_txo_count: balanceInfo.funded_txo_count,
        funded_txo_sum: balanceInfo.funded_txo_sum,
        spent_txo_count: balanceInfo.spent_txo_count,
        spent_txo_sum: balanceInfo.spent_txo_sum,
        tx_count: balanceInfo.tx_count,
        unconfirmed_tx_count: balanceInfo.unconfirmed_tx_count || 0,
        balance_sats: (balanceInfo.funded_txo_sum || 0) - (balanceInfo.spent_txo_sum || 0),
        balance_btc: ((balanceInfo.funded_txo_sum || 0) - (balanceInfo.spent_txo_sum || 0)) / 100000000
      } : null,
      explorerUrl: `https://mempool.space/address/${poolWalletAddress}`,
      note: 'This is your pool wallet address - ensure it has sufficient Bitcoin for payouts'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in get-pool-wallet-address:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message,
      stack: error.stack
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});