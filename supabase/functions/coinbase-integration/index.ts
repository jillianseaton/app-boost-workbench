
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Coinbase API credentials
const COINBASE_API_KEY = Deno.env.get("COINBASE_API_KEY");
const COINBASE_API_SECRET = Deno.env.get("coinbase_secret_key");
const COINBASE_ACCOUNT_ID = Deno.env.get("COINBASE_ACCOUNT_ID");

// HMAC signature generation for Coinbase API
async function generateSignature(message: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(message));
  return Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// Get Coinbase account balance
async function getAccountBalance(accountId: string): Promise<any> {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const method = 'GET';
  const requestPath = `/v2/accounts/${accountId}`;
  const message = timestamp + method + requestPath;
  
  const signature = await generateSignature(message, COINBASE_API_SECRET!);
  
  const response = await fetch(`https://api.coinbase.com${requestPath}`, {
    method: 'GET',
    headers: {
      'CB-ACCESS-KEY': COINBASE_API_KEY!,
      'CB-ACCESS-SIGN': signature,
      'CB-ACCESS-TIMESTAMP': timestamp,
      'Content-Type': 'application/json'
    }
  });
  
  return await response.json();
}

// Send Bitcoin via Coinbase
async function sendBitcoin(recipientAddress: string, amount: string, currency: string = 'BTC'): Promise<any> {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const method = 'POST';
  const requestPath = `/v2/accounts/${COINBASE_ACCOUNT_ID}/transactions`;
  
  const body = {
    type: 'send',
    to: recipientAddress,
    amount: amount,
    currency: currency,
    description: 'Bitcoin payout via Edge Function'
  };
  
  const bodyString = JSON.stringify(body);
  const message = timestamp + method + requestPath + bodyString;
  const signature = await generateSignature(message, COINBASE_API_SECRET!);
  
  const response = await fetch(`https://api.coinbase.com${requestPath}`, {
    method: 'POST',
    headers: {
      'CB-ACCESS-KEY': COINBASE_API_KEY!,
      'CB-ACCESS-SIGN': signature,
      'CB-ACCESS-TIMESTAMP': timestamp,
      'Content-Type': 'application/json'
    },
    body: bodyString
  });
  
  return await response.json();
}

// Get Bitcoin price from Coinbase
async function getBitcoinPrice(): Promise<any> {
  const response = await fetch('https://api.coinbase.com/v2/exchange-rates?currency=BTC');
  return await response.json();
}

// Get transaction history
async function getTransactionHistory(accountId: string): Promise<any> {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const method = 'GET';
  const requestPath = `/v2/accounts/${accountId}/transactions`;
  const message = timestamp + method + requestPath;
  
  const signature = await generateSignature(message, COINBASE_API_SECRET!);
  
  const response = await fetch(`https://api.coinbase.com${requestPath}`, {
    method: 'GET',
    headers: {
      'CB-ACCESS-KEY': COINBASE_API_KEY!,
      'CB-ACCESS-SIGN': signature,
      'CB-ACCESS-TIMESTAMP': timestamp,
      'Content-Type': 'application/json'
    }
  });
  
  return await response.json();
}

serve(async (req) => {
  console.log('Coinbase integration function called');
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Check for required environment variables
    if (!COINBASE_API_KEY || !COINBASE_API_SECRET) {
      throw new Error('Missing Coinbase API credentials in environment variables');
    }

    const body = await req.json();
    const { action, ...params } = body;
    
    console.log('Action requested:', action);
    console.log('Parameters:', params);

    let result;

    switch (action) {
      case 'get_balance':
        if (!COINBASE_ACCOUNT_ID) {
          throw new Error('COINBASE_ACCOUNT_ID environment variable is required');
        }
        result = await getAccountBalance(COINBASE_ACCOUNT_ID);
        break;

      case 'send_bitcoin':
        const { recipientAddress, amount, currency = 'BTC' } = params;
        if (!recipientAddress || !amount) {
          throw new Error('recipientAddress and amount are required for send_bitcoin');
        }
        if (!COINBASE_ACCOUNT_ID) {
          throw new Error('COINBASE_ACCOUNT_ID environment variable is required');
        }
        result = await sendBitcoin(recipientAddress, amount, currency);
        break;

      case 'get_btc_price':
        result = await getBitcoinPrice();
        break;

      case 'get_transactions':
        if (!COINBASE_ACCOUNT_ID) {
          throw new Error('COINBASE_ACCOUNT_ID environment variable is required');
        }
        result = await getTransactionHistory(COINBASE_ACCOUNT_ID);
        break;

      case 'validate_credentials':
        // Simple validation by trying to get account info
        if (!COINBASE_ACCOUNT_ID) {
          throw new Error('COINBASE_ACCOUNT_ID environment variable is required');
        }
        result = await getAccountBalance(COINBASE_ACCOUNT_ID);
        result = { valid: !result.errors, message: result.errors ? 'Invalid credentials' : 'Credentials are valid' };
        break;

      default:
        throw new Error(`Unknown action: ${action}. Available actions: get_balance, send_bitcoin, get_btc_price, get_transactions, validate_credentials`);
    }

    console.log('Coinbase API response:', result);

    // Check for Coinbase API errors
    if (result.errors && result.errors.length > 0) {
      throw new Error(`Coinbase API Error: ${JSON.stringify(result.errors)}`);
    }

    return new Response(JSON.stringify({
      success: true,
      data: result.data || result,
      action: action,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in Coinbase integration:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      action: body?.action || 'unknown',
      timestamp: new Date().toISOString()
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
