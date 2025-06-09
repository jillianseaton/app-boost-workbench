
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createHash, createHmac } from "https://deno.land/std@0.168.0/node/crypto.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Kraken API base URL
const KRAKEN_API_URL = 'https://api.kraken.com';

// Generate Kraken API signature
function generateSignature(path: string, postData: string, secret: string, nonce: string): string {
  const message = nonce + postData;
  const secretBuffer = new TextEncoder().encode(atob(secret));
  const hash = createHash('sha256').update(message).digest();
  const hmac = createHmac('sha512', secretBuffer).update(path + hash).digest('hex');
  return btoa(hmac);
}

// Make authenticated request to Kraken
async function krakenRequest(endpoint: string, params: any, apiKey: string, apiSecret: string) {
  const nonce = Date.now().toString();
  const postData = new URLSearchParams({
    nonce,
    ...params
  }).toString();
  
  const path = `/0/private/${endpoint}`;
  const signature = generateSignature(path, postData, apiSecret, nonce);

  const response = await fetch(`${KRAKEN_API_URL}${path}`, {
    method: 'POST',
    headers: {
      'API-Key': apiKey,
      'API-Sign': signature,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: postData,
  });

  const data = await response.json();
  
  if (data.error && data.error.length > 0) {
    throw new Error(data.error.join(', '));
  }
  
  return data.result;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, apiKey, apiSecret, ...params } = await req.json();
    
    if (!apiKey || !apiSecret) {
      throw new Error('API key and secret are required');
    }

    let result;

    switch (action) {
      case 'connect':
        // Verify API credentials and get account info
        const accountBalance = await krakenRequest('Balance', {}, apiKey, apiSecret);
        const tradeBalance = await krakenRequest('TradeBalance', {}, apiKey, apiSecret);
        
        result = {
          connected: true,
          balances: accountBalance,
          tradeFee: parseFloat(tradeBalance.c || '0.26'), // Default fee if not available
          verification: 'intermediate' // This would need to be determined from account info
        };
        break;

      case 'balances':
        // Get current account balances
        const balances = await krakenRequest('Balance', {}, apiKey, apiSecret);
        result = { balances };
        break;

      case 'withdraw':
        // Perform withdrawal
        const { asset, amount, address, method } = params;
        
        if (method === 'bitcoin' || method === 'crypto') {
          // Cryptocurrency withdrawal
          const withdrawResult = await krakenRequest('Withdraw', {
            asset,
            key: address, // This should be a pre-configured withdrawal address
            amount
          }, apiKey, apiSecret);
          
          result = {
            success: true,
            refid: withdrawResult.refid,
            message: `Withdrawal of ${amount} ${asset} initiated`
          };
        } else {
          // Fiat withdrawal (wire, ACH)
          const withdrawResult = await krakenRequest('WithdrawCancel', {
            asset: 'USD',
            method,
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
        // Get trading history
        const trades = await krakenRequest('TradesHistory', {}, apiKey, apiSecret);
        result = { trades };
        break;

      case 'open_orders':
        // Get open orders
        const orders = await krakenRequest('OpenOrders', {}, apiKey, apiSecret);
        result = { orders };
        break;

      default:
        throw new Error('Invalid action specified');
    }

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
