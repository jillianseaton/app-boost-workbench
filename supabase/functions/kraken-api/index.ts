
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Kraken API base URL
const KRAKEN_API_URL = 'https://api.kraken.com';

// Generate Kraken API signature
async function generateSignature(path: string, postData: string, secret: string, nonce: string): Promise<string> {
  const message = nonce + postData;
  
  // Decode the base64 secret
  const secretBytes = new Uint8Array(atob(secret).split('').map(c => c.charCodeAt(0)));
  
  // Create SHA256 hash of the message
  const msgEncoder = new TextEncoder();
  const msgBytes = msgEncoder.encode(message);
  const msgHash = await crypto.subtle.digest('SHA-256', msgBytes);
  
  // Combine path and hash
  const pathBytes = msgEncoder.encode(path);
  const combined = new Uint8Array(pathBytes.length + msgHash.byteLength);
  combined.set(pathBytes);
  combined.set(new Uint8Array(msgHash), pathBytes.length);
  
  // Create HMAC-SHA512
  const key = await crypto.subtle.importKey(
    'raw',
    secretBytes,
    { name: 'HMAC', hash: 'SHA-512' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign('HMAC', key, combined);
  
  // Convert to base64
  const signatureArray = new Uint8Array(signature);
  return btoa(String.fromCharCode(...signatureArray));
}

// Make authenticated request to Kraken
async function krakenRequest(endpoint: string, params: any, apiKey: string, apiSecret: string) {
  console.log(`Making Kraken API request to ${endpoint}`);
  
  const nonce = Date.now().toString() + Math.random().toString().slice(2, 8);
  const postData = new URLSearchParams({
    nonce,
    ...params
  }).toString();
  
  const path = `/0/private/${endpoint}`;
  
  try {
    const signature = await generateSignature(path, postData, apiSecret, nonce);

    console.log(`Request details: path=${path}, nonce=${nonce}`);

    const response = await fetch(`${KRAKEN_API_URL}${path}`, {
      method: 'POST',
      headers: {
        'API-Key': apiKey,
        'API-Sign': signature,
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Kraken REST API Client'
      },
      body: postData,
    });

    if (!response.ok) {
      console.error(`HTTP error: ${response.status} ${response.statusText}`);
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`Kraken API response:`, data);
    
    if (data.error && data.error.length > 0) {
      console.error('Kraken API errors:', data.error);
      throw new Error(data.error.join(', '));
    }
    
    return data.result;
  } catch (error) {
    console.error(`Error in krakenRequest for ${endpoint}:`, error);
    throw error;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, apiKey, apiSecret, ...params } = await req.json();
    
    console.log(`Kraken API request: action=${action}`);
    
    if (!apiKey || !apiSecret) {
      throw new Error('API key and secret are required');
    }

    // Validate API key format
    if (!apiKey.trim() || !apiSecret.trim()) {
      throw new Error('API key and secret cannot be empty');
    }

    let result;

    switch (action) {
      case 'connect':
        console.log('Testing Kraken connection...');
        
        // Verify API credentials and get account info
        const accountBalance = await krakenRequest('Balance', {}, apiKey, apiSecret);
        
        // Get trade balance to determine fee tier
        let tradeFee = 0.26; // Default fee
        let verification = 'intermediate';
        
        try {
          const tradeBalance = await krakenRequest('TradeBalance', {}, apiKey, apiSecret);
          if (tradeBalance.c) {
            tradeFee = parseFloat(tradeBalance.c);
          }
        } catch (feeError) {
          console.warn('Could not fetch trade balance, using default fee:', feeError);
        }
        
        result = {
          connected: true,
          balances: accountBalance,
          tradeFee,
          verification
        };
        break;

      case 'balances':
        console.log('Fetching account balances...');
        const balances = await krakenRequest('Balance', {}, apiKey, apiSecret);
        result = { balances };
        break;

      case 'withdraw':
        console.log('Processing withdrawal...');
        const { asset, amount, address, method } = params;
        
        if (!asset || !amount || !address) {
          throw new Error('Asset, amount, and address are required for withdrawal');
        }
        
        if (method === 'bitcoin' || method === 'crypto') {
          // Cryptocurrency withdrawal
          console.log(`Withdrawing ${amount} ${asset} to ${address}`);
          
          const withdrawResult = await krakenRequest('Withdraw', {
            asset,
            key: address, // Note: This requires pre-configured withdrawal addresses in Kraken
            amount
          }, apiKey, apiSecret);
          
          result = {
            success: true,
            refid: withdrawResult.refid,
            message: `Withdrawal of ${amount} ${asset} initiated`
          };
        } else {
          // Fiat withdrawal (wire, ACH)
          console.log(`Withdrawing $${amount} USD via ${method}`);
          
          const withdrawResult = await krakenRequest('Withdraw', {
            asset: 'USD',
            key: method, // This should match a pre-configured withdrawal method
            amount
          }, apiKey, apiSecret);
          
          result = {
            success: true,
            refid: withdrawResult.refid,
            message: `Fiat withdrawal of $${amount} USD initiated via ${method}`
          };
        }
        break;

      case 'trade_history':
        console.log('Fetching trade history...');
        const trades = await krakenRequest('TradesHistory', {}, apiKey, apiSecret);
        result = { trades };
        break;

      case 'open_orders':
        console.log('Fetching open orders...');
        const orders = await krakenRequest('OpenOrders', {}, apiKey, apiSecret);
        result = { orders };
        break;

      default:
        throw new Error('Invalid action specified');
    }

    console.log('Kraken API request completed successfully');

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Kraken API error:', error);
    
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false,
      timestamp: new Date().toISOString()
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
