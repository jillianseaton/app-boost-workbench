
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
  console.log('Generating signature for path:', path);
  console.log('Post data:', postData);
  console.log('Nonce:', nonce);
  
  try {
    // Decode the base64 secret
    const secretBuffer = Uint8Array.from(atob(secret), c => c.charCodeAt(0));
    
    // Create the message: nonce + postdata
    const message = nonce + postData;
    const messageBuffer = new TextEncoder().encode(message);
    
    // Hash the message with SHA256
    const messageHash = await crypto.subtle.digest('SHA-256', messageBuffer);
    
    // Combine path and message hash
    const pathBuffer = new TextEncoder().encode(path);
    const combinedBuffer = new Uint8Array(pathBuffer.length + messageHash.byteLength);
    combinedBuffer.set(pathBuffer);
    combinedBuffer.set(new Uint8Array(messageHash), pathBuffer.length);
    
    // Import the secret key for HMAC
    const key = await crypto.subtle.importKey(
      'raw',
      secretBuffer,
      { name: 'HMAC', hash: 'SHA-512' },
      false,
      ['sign']
    );
    
    // Generate HMAC signature
    const signature = await crypto.subtle.sign('HMAC', key, combinedBuffer);
    
    // Convert to base64
    const signatureBase64 = btoa(String.fromCharCode(...new Uint8Array(signature)));
    console.log('Generated signature successfully');
    
    return signatureBase64;
  } catch (error) {
    console.error('Error generating signature:', error);
    throw error;
  }
}

// Make authenticated request to Kraken
async function krakenRequest(endpoint: string, params: any, apiKey: string, apiSecret: string) {
  console.log(`Making Kraken API request to ${endpoint} with params:`, params);
  
  // Generate nonce (microseconds)
  const nonce = (Date.now() * 1000).toString();
  
  // Prepare form data
  const formParams = new URLSearchParams();
  formParams.append('nonce', nonce);
  
  // Add other parameters
  Object.keys(params).forEach(key => {
    if (params[key] !== undefined && params[key] !== null) {
      formParams.append(key, params[key].toString());
    }
  });
  
  const postData = formParams.toString();
  const path = `/0/private/${endpoint}`;
  
  console.log('Request path:', path);
  console.log('Post data:', postData);
  console.log('API Key (first 8 chars):', apiKey.substring(0, 8));
  
  try {
    const signature = await generateSignature(path, postData, apiSecret, nonce);

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

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    const responseText = await response.text();
    console.log('Raw response:', responseText);

    if (!response.ok) {
      console.error(`HTTP error: ${response.status} ${response.statusText}`);
      throw new Error(`HTTP ${response.status}: ${response.statusText} - ${responseText}`);
    }

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse JSON response:', parseError);
      throw new Error(`Invalid JSON response: ${responseText}`);
    }
    
    console.log('Parsed response:', data);
    
    if (data.error && data.error.length > 0) {
      console.error('Kraken API errors:', data.error);
      throw new Error(`Kraken API Error: ${data.error.join(', ')}`);
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
    const requestBody = await req.json();
    console.log('Received request:', requestBody);
    
    const { action, apiKey, apiSecret, ...params } = requestBody;
    
    console.log(`Kraken API request: action=${action}`);
    
    if (!apiKey || !apiSecret) {
      throw new Error('API key and secret are required');
    }

    // Validate API key format (should be base64-ish)
    if (!apiKey.trim() || !apiSecret.trim()) {
      throw new Error('API key and secret cannot be empty');
    }

    // Basic validation for Kraken API key format
    if (apiKey.length < 50 || apiSecret.length < 80) {
      throw new Error('API key or secret appears to be invalid format. Please check your Kraken API credentials.');
    }

    let result;

    switch (action) {
      case 'connect':
        console.log('Testing Kraken connection...');
        
        try {
          // Test with account balance - this is a simple authenticated endpoint
          const accountBalance = await krakenRequest('Balance', {}, apiKey, apiSecret);
          console.log('Account balance retrieved successfully:', accountBalance);
          
          // Get additional account info if possible
          let tradeFee = 0.26; // Default fee
          let verification = 'intermediate';
          
          try {
            const tradeBalance = await krakenRequest('TradeBalance', {}, apiKey, apiSecret);
            console.log('Trade balance:', tradeBalance);
            
            // Extract fee information if available
            if (tradeBalance && tradeBalance.m) {
              tradeFee = parseFloat(tradeBalance.m) || 0.26;
            }
          } catch (feeError) {
            console.warn('Could not fetch trade balance (non-critical):', feeError);
          }
          
          result = {
            connected: true,
            balances: accountBalance,
            tradeFee,
            verification
          };
        } catch (connectionError) {
          console.error('Connection test failed:', connectionError);
          
          // Provide more specific error messages based on common issues
          let errorMessage = connectionError.message;
          
          if (errorMessage.includes('EAPI:Invalid key')) {
            errorMessage = 'Invalid API key. Please check your Kraken API key is correct.';
          } else if (errorMessage.includes('EAPI:Invalid signature')) {
            errorMessage = 'Invalid API signature. Please check your Kraken API secret is correct.';
          } else if (errorMessage.includes('EAPI:Invalid nonce')) {
            errorMessage = 'Invalid nonce. Please try again.';
          } else if (errorMessage.includes('EGeneral:Permission denied')) {
            errorMessage = 'Permission denied. Please ensure your API key has "Query Funds" permission enabled.';
          }
          
          throw new Error(errorMessage);
        }
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
          console.log(`Withdrawing ${amount} ${asset} to ${address}`);
          
          const withdrawResult = await krakenRequest('Withdraw', {
            asset,
            key: address,
            amount
          }, apiKey, apiSecret);
          
          result = {
            success: true,
            refid: withdrawResult.refid,
            message: `Withdrawal of ${amount} ${asset} initiated`
          };
        } else {
          console.log(`Withdrawing $${amount} USD via ${method}`);
          
          const withdrawResult = await krakenRequest('Withdraw', {
            asset: 'USD',
            key: method,
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
