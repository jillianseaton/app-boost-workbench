import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('convert-earnings-to-btc function called');
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { userWalletAddress, userId } = await req.json();
    
    if (!userWalletAddress || !userId) {
      throw new Error('User wallet address and user ID are required');
    }

    console.log('Processing payout for user:', userId);
    
    // Get user's unpaid commissions
    const { data: commissions, error: commissionsError } = await supabase
      .from('commissions')
      .select('*')
      .eq('user_id', userId)
      .eq('paid_out', false);

    if (commissionsError) throw commissionsError;

    if (!commissions || commissions.length === 0) {
      return new Response(JSON.stringify({
        success: false,
        message: 'No unpaid commissions found',
        totalUSD: 0,
        btcAmount: 0
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Calculate total USD from commissions
    const totalCents = commissions.reduce((sum, commission) => sum + commission.amount_earned_cents, 0);
    const totalUSD = totalCents / 100;

    console.log(`Total unpaid earnings: $${totalUSD}`);

    // Get current BTC price
    const btcPriceResponse = await fetch(`${supabaseUrl}/functions/v1/get-btc-price`, {
      headers: {
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`,
        'Content-Type': 'application/json',
      },
    });

    if (!btcPriceResponse.ok) {
      throw new Error('Failed to get BTC price');
    }

    const priceData = await btcPriceResponse.json();
    const btcPrice = priceData.price;
    console.log('Current BTC price:', btcPrice);

    // Calculate BTC equivalent
    const btcAmount = totalUSD / btcPrice;
    const satoshis = Math.floor(btcAmount * 100000000);

    console.log(`Converting $${totalUSD} to ${btcAmount} BTC (${satoshis} sats)`);

    // Minimum payout check (0.0001 BTC = 10,000 sats)
    if (satoshis < 10000) {
      return new Response(JSON.stringify({
        success: false,
        message: `Minimum payout is 0.0001 BTC ($${(0.0001 * btcPrice).toFixed(2)}). Current balance: $${totalUSD}`,
        totalUSD,
        btcAmount: 0,
        minimumUSD: 0.0001 * btcPrice
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get pool wallet private key from secrets
    const poolPrivateKey = Deno.env.get('BTC_private_key');
    if (!poolPrivateKey) {
      throw new Error('Pool wallet private key not configured');
    }

    console.log('Sending BTC from pool wallet to user wallet...');

    // Send Bitcoin from pool wallet to user wallet
    const sendBtcResponse = await fetch(`${supabaseUrl}/functions/v1/send-btc`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        privateKeyWIF: poolPrivateKey,
        recipientAddress: userWalletAddress,
        amountSats: satoshis
      }),
    });

    if (!sendBtcResponse.ok) {
      const errorData = await sendBtcResponse.json();
      throw new Error(`Bitcoin transfer failed: ${errorData.error}`);
    }

    const txData = await sendBtcResponse.json();
    console.log('Bitcoin transaction successful:', txData.txid);

    // Mark commissions as paid out
    const { error: updateError } = await supabase
      .from('commissions')
      .update({
        paid_out: true,
        paid_at: new Date().toISOString(),
        description: `Converted to Bitcoin - TXID: ${txData.txid}`
      })
      .eq('user_id', userId)
      .eq('paid_out', false);

    if (updateError) {
      console.error('Error updating commissions:', updateError);
      // Don't throw here since the Bitcoin was already sent
    }

    // Log the Bitcoin transaction
    const { error: logError } = await supabase
      .from('bitcoin_transactions')
      .insert({
        transaction_id: txData.txid,
        user_id: userId,
        address: userWalletAddress,
        amount_btc: btcAmount,
        amount_satoshis: satoshis,
        status: 'sent',
        fee_satoshis: txData.fee || 0
      });

    if (logError) {
      console.error('Error logging Bitcoin transaction:', logError);
    }

    return new Response(JSON.stringify({
      success: true,
      message: `Successfully converted $${totalUSD} to ${btcAmount.toFixed(8)} BTC`,
      totalUSD,
      btcAmount,
      satoshis,
      txid: txData.txid,
      explorerUrl: txData.explorerUrl,
      commissionsCount: commissions.length
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in convert-earnings-to-btc:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});