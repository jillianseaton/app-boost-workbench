
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PayoutRequest {
  accountId: string;
  amount: number; // Amount in cents
  method?: 'standard' | 'instant';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Payout request received');
    
    const body: PayoutRequest = await req.json();
    const { accountId, amount, method = 'standard' } = body;
    
    console.log('Request data:', { accountId, amount, method });

    if (!accountId || !amount) {
      throw new Error('Missing required fields: accountId and amount');
    }

    if (amount < 50) { // $0.50 minimum in cents
      throw new Error('Minimum payout amount is $0.50');
    }

    // Get Stripe secret key - try multiple possible secret names
    const stripeKey = Deno.env.get('stripe_secret_key') || 
                      Deno.env.get('STRIPE_SECRET_KEY') || 
                      Deno.env.get('stripe_express_key');
    
    if (!stripeKey) {
      console.error('Available env vars:', Object.keys(Deno.env.toObject()));
      throw new Error('Stripe secret key not configured. Please check your Supabase secrets.');
    }

    console.log('Using Stripe key starting with:', stripeKey.substring(0, 7) + '...');

    // Initialize Stripe with secret key
    const stripe = new Stripe(stripeKey, {
      apiVersion: '2023-10-16',
    });

    console.log('Creating payout for account:', accountId);

    // Create payout to the connected account
    const payout = await stripe.payouts.create(
      {
        amount: amount, // Amount should already be in cents
        currency: 'usd',
        method: method,
      },
      {
        stripeAccount: accountId, // This specifies the connected account
      }
    );

    console.log('Payout created successfully:', payout.id);

    return new Response(
      JSON.stringify({
        success: true,
        payoutId: payout.id,
        amount: payout.amount,
        currency: payout.currency,
        status: payout.status,
        method: payout.method,
        arrivalDate: payout.arrival_date,
        created: payout.created,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
    
  } catch (error) {
    console.error('Stripe Payout Error:', error);
    
    let errorMessage = error.message;
    
    // Provide more helpful error messages for common issues
    if (error.message.includes('permissions')) {
      errorMessage = 'API key permissions error. For live payouts, you need to implement Stripe Connect with Express accounts.';
    } else if (error.message.includes('Invalid API Key')) {
      errorMessage = 'Invalid Stripe API key. Please check your key in the Stripe Dashboard.';
    }
    
    return new Response(JSON.stringify({
      success: false,
      error: errorMessage,
      timestamp: new Date().toISOString(),
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
