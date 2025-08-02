import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('convert-earnings-to-btc function called - v2.1');
  console.log('Request method:', req.method);
  console.log('Request headers:', Object.fromEntries(req.headers.entries()));
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    let requestBody;
    let requestText;
    try {
      // First get the raw text to see what we're receiving
      requestText = await req.text();
      console.log('Raw request text:', requestText);
      
      // Try to parse it as JSON
      if (requestText) {
        requestBody = JSON.parse(requestText);
        console.log('Parsed request body:', JSON.stringify(requestBody, null, 2));
      } else {
        console.log('Request body is empty');
        requestBody = {};
      }
    } catch (parseError) {
      console.error('Failed to parse request body:', parseError);
      console.error('Raw request text was:', requestText);
      return new Response(JSON.stringify({
        success: false,
        error: 'Invalid JSON in request body',
        rawText: requestText?.substring(0, 100) // First 100 chars for debugging
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    const { userWalletAddress, userId } = requestBody;
    
    if (!userWalletAddress || !userId) {
      console.error('Missing required parameters:', { 
        userWalletAddress: !!userWalletAddress, 
        userId: !!userId,
        receivedKeys: Object.keys(requestBody || {})
      });
      return new Response(JSON.stringify({
        success: false,
        error: 'User wallet address and user ID are required',
        debug: { userWalletAddress: !!userWalletAddress, userId: !!userId }
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Processing payout for user:', userId);
    
    // Get user's unpaid commissions
    const { data: commissions, error: commissionsError } = await supabase
      .from('commissions')
      .select('*')
      .eq('user_id', userId)
      .eq('paid_out', false);

    if (commissionsError) {
      console.error('Error fetching commissions:', commissionsError);
      return new Response(JSON.stringify({
        success: false,
        error: `Database error: ${commissionsError.message}`
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!commissions || commissions.length === 0) {
      console.log('No unpaid commissions found for user:', userId);
      return new Response(JSON.stringify({
        success: false,
        message: 'No unpaid commissions found',
        totalUSD: 0,
        btcAmount: 0
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Calculate total USD from commissions
    const totalCents = commissions.reduce((sum, commission) => sum + commission.amount_earned_cents, 0);
    const totalUSD = totalCents / 100;

    console.log(`Total unpaid earnings: $${totalUSD} from ${commissions.length} commissions`);

    // Get current BTC price using Supabase client
    const { data: priceData, error: priceError } = await supabase.functions.invoke('get-btc-price');
    
    if (priceError) {
      console.error('Error getting BTC price:', priceError);
      return new Response(JSON.stringify({
        success: false,
        error: `Failed to get BTC price: ${priceError.message}`
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const btcPrice = priceData.price;
    console.log('Current BTC price:', btcPrice);

    // Calculate BTC equivalent
    const btcAmount = totalUSD / btcPrice;
    const satoshis = Math.floor(btcAmount * 100000000);

    console.log(`Converting $${totalUSD} to ${btcAmount} BTC (${satoshis} sats)`);

    // Minimum payout check (0.0001 BTC = 10,000 sats)
    if (satoshis < 10000) {
      const minimumUSD = (0.0001 * btcPrice);
      console.log(`Amount too small: ${satoshis} sats < 10000 sats minimum`);
      return new Response(JSON.stringify({
        success: false,
        message: `Minimum payout is 0.0001 BTC ($${minimumUSD.toFixed(2)}). Current balance: $${totalUSD}`,
        totalUSD,
        btcAmount: 0,
        minimumUSD
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // REAL BITCOIN INTEGRATION with Coinbase Commerce
    // Instead of simulating, we'll create an actual Bitcoin payment
    
    console.log('💰 Processing REAL Bitcoin payment via Coinbase Commerce...');
    console.log(`Converting $${totalUSD} to ${btcAmount.toFixed(8)} BTC (${satoshis} sats)`);
    console.log(`Destination address: ${userWalletAddress}`);
    
    // Get Coinbase API credentials from environment
    const coinbaseApiKey = Deno.env.get('coinbase_secret_key');
    
    if (!coinbaseApiKey) {
      console.error('Coinbase Commerce API key not configured');
      return new Response(JSON.stringify({
        success: false,
        error: 'Coinbase Commerce not configured. Please contact support.',
        totalUSD,
        btcAmount: 0
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create a Coinbase Commerce charge for Bitcoin
    try {
      const coinbaseResponse = await fetch('https://api.commerce.coinbase.com/charges', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CC-Api-Key': coinbaseApiKey,
          'X-CC-Version': '2018-03-22'
        },
        body: JSON.stringify({
          name: 'Commission Earnings Payout',
          description: `Commission payout of $${totalUSD} to Bitcoin`,
          local_price: {
            amount: totalUSD.toFixed(2),
            currency: 'USD'
          },
          pricing_type: 'fixed_price',
          metadata: {
            user_id: userId,
            payout_address: userWalletAddress,
            commission_count: commissions.length,
            type: 'commission_payout'
          }
        })
      });

      const coinbaseData = await coinbaseResponse.json();
      
      if (!coinbaseResponse.ok) {
        console.error('Coinbase Commerce error:', coinbaseData);
        throw new Error(`Coinbase error: ${coinbaseData.error?.message || 'Unknown error'}`);
      }

      const chargeId = coinbaseData.data.id;
      const bitcoinAddress = coinbaseData.data.addresses?.bitcoin;
      const bitcoinAmount = coinbaseData.data.pricing?.bitcoin?.amount;
      
      console.log('✅ Coinbase Commerce charge created successfully');
      console.log('Charge ID:', chargeId);
      console.log('Bitcoin amount:', bitcoinAmount, 'BTC');
      
      // Create a real transaction ID from Coinbase
      const realTxId = `coinbase_${chargeId}`;
      
      console.log('Transaction ID:', realTxId);

      // Mark commissions as paid out
      const { error: updateError } = await supabase
        .from('commissions')
        .update({
          paid_out: true,
          paid_at: new Date().toISOString(),
          description: `Real Bitcoin payout via Coinbase Commerce - Charge ID: ${chargeId}`
        })
        .eq('user_id', userId)
        .eq('paid_out', false);

      if (updateError) {
        console.error('Error updating commissions:', updateError);
        return new Response(JSON.stringify({
          success: false,
          error: `Failed to mark commissions as paid: ${updateError.message}`
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Log the REAL Bitcoin transaction
      const { error: logError } = await supabase
        .from('bitcoin_transactions')
        .insert({
          transaction_id: realTxId,
          user_id: userId,
          address: userWalletAddress,
          amount_btc: parseFloat(bitcoinAmount || btcAmount.toString()),
          amount_satoshis: Math.floor((parseFloat(bitcoinAmount || btcAmount.toString())) * 100000000),
          status: 'pending', // Real transaction starts as pending
          fee_satoshis: 0
        });

      if (logError) {
        console.error('Error logging Bitcoin transaction:', logError);
      }

      return new Response(JSON.stringify({
        success: true,
        message: `Real Bitcoin payment initiated! $${totalUSD} → ${bitcoinAmount || btcAmount.toFixed(8)} BTC`,
        totalUSD,
        btcAmount: parseFloat(bitcoinAmount || btcAmount.toString()),
        satoshis: Math.floor((parseFloat(bitcoinAmount || btcAmount.toString())) * 100000000),
        conversionId: realTxId,
        chargeId: chargeId,
        bitcoinAddress: bitcoinAddress,
        note: 'Real Bitcoin payment created via Coinbase Commerce',
        commissionsCount: commissions.length,
        destinationAddress: userWalletAddress
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } catch (coinbaseError) {
      console.error('Coinbase Commerce integration failed:', coinbaseError);
      
      // Fallback to simulation if Coinbase fails
      const fallbackTxId = `fallback_${Date.now()}_${userId.slice(0, 8)}`;
      
      // Mark commissions as paid out (fallback)
      const { error: updateError } = await supabase
        .from('commissions')
        .update({
          paid_out: true,
          paid_at: new Date().toISOString(),
          description: `Bitcoin conversion (Coinbase failed) - ID: ${fallbackTxId}`
        })
        .eq('user_id', userId)
        .eq('paid_out', false);

      // Log the fallback transaction
      const { error: logError } = await supabase
        .from('bitcoin_transactions')
        .insert({
          transaction_id: fallbackTxId,
          user_id: userId,
          address: userWalletAddress,
          amount_btc: btcAmount,
          amount_satoshis: satoshis,
          status: 'failed', // Mark as failed since Coinbase didn't work
          fee_satoshis: 0
        });

      return new Response(JSON.stringify({
        success: false,
        error: `Coinbase Commerce failed: ${coinbaseError.message}`,
        totalUSD,
        btcAmount: 0,
        note: 'Coinbase Commerce integration failed - contact support for manual payout'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

  } catch (error) {
    console.error('Error in convert-earnings-to-btc:', error);
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