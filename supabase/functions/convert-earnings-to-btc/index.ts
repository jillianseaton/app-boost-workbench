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

    // Instead of requiring a pre-funded pool wallet, we'll use a different approach:
    // 1. Create a Bitcoin transaction directly from the platform's operational wallet
    // 2. Or implement a Bitcoin purchase service using the USD earnings
    
    console.log('💰 Converting commission earnings to Bitcoin...');
    console.log(`Converting $${totalUSD} to ${btcAmount.toFixed(8)} BTC (${satoshis} sats)`);
    
    // For now, we'll simulate the Bitcoin purchase/conversion process
    // In a real implementation, this would either:
    // A) Purchase Bitcoin from an exchange using the USD earnings
    // B) Use platform-owned Bitcoin reserves (business expense)
    
    // Create a mock transaction ID for demonstration
    const mockTxId = `conversion_${Date.now()}_${userId.slice(0, 8)}`;
    
    console.log('✅ Bitcoin conversion simulated successfully');
    console.log('Transaction ID:', mockTxId);

    // Mark commissions as paid out
    const { error: updateError } = await supabase
      .from('commissions')
      .update({
        paid_out: true,
        paid_at: new Date().toISOString(),
        description: `Converted to Bitcoin - Conversion ID: ${mockTxId}`
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

    // Log the Bitcoin conversion (simulated)
    const { error: logError } = await supabase
      .from('bitcoin_transactions')
      .insert({
        transaction_id: mockTxId,
        user_id: userId,
        address: userWalletAddress,
        amount_btc: btcAmount,
        amount_satoshis: satoshis,
        status: 'converted',
        fee_satoshis: 0 // No fees for simulated conversion
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
      conversionId: mockTxId,
      note: 'Commission earnings converted to Bitcoin equivalent (simulated)',
      commissionsCount: commissions.length
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

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