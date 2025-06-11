
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PayoutRequest {
  amount: number; // Amount in USD
  email: string;
  userId: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: PayoutRequest = await req.json();
    const { amount, email, userId } = body;
    
    console.log('Stripe Payout Handler - Request:', { amount, email, userId });
    
    if (!amount || amount < 10) {
      throw new Error('Minimum payout amount is $10.00');
    }
    
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeKey) {
      throw new Error('Stripe secret key not configured');
    }
    
    // Accept both restricted keys (rk_) and secret keys (sk_)
    if (!stripeKey.startsWith('rk_') && !stripeKey.startsWith('sk_')) {
      throw new Error('Invalid Stripe key format. Please use either a Restricted key (rk_) or Secret key (sk_)');
    }
    
    const stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16' });
    
    try {
      // Create a payout using Stripe Connect
      // Note: This requires the account to be properly set up with Express accounts
      const payout = await stripe.payouts.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: 'usd',
        method: 'instant',
      });
      
      console.log('Payout created:', payout.id);
      
      return new Response(JSON.stringify({
        success: true,
        data: {
          payoutId: payout.id,
          amount: amount,
          status: payout.status,
          estimatedArrival: payout.arrival_date ? new Date(payout.arrival_date * 1000).toLocaleDateString() : '1-2 business days',
          accountId: payout.destination || 'default_account',
        },
        timestamp: new Date().toISOString(),
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
      
    } catch (payoutError) {
      console.log('Direct payout failed, trying alternative approach:', payoutError.message);
      
      // If direct payout fails, create a payment intent that can be captured later
      try {
        const paymentIntent = await stripe.paymentIntents.create({
          amount: Math.round(amount * 100),
          currency: 'usd',
          payment_method_types: ['card'],
          metadata: {
            type: 'payout_request',
            userId: userId,
            email: email,
          },
        });
        
        console.log('Payment intent created for payout request:', paymentIntent.id);
        
        return new Response(JSON.stringify({
          success: true,
          data: {
            payoutId: paymentIntent.id,
            amount: amount,
            status: 'pending_setup',
            estimatedArrival: 'Requires manual processing',
            accountId: 'manual_processing',
            message: 'Payout request created. Manual processing required through Stripe dashboard.',
          },
          timestamp: new Date().toISOString(),
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
        
      } catch (intentError) {
        console.error('Payment intent creation also failed:', intentError);
        throw new Error('Unable to process payout. Please check your account setup.');
      }
    }
    
  } catch (error) {
    console.error('Stripe Payout Error:', error);
    
    let errorMessage = error.message;
    
    // Provide more helpful error messages for common issues
    if (error.message.includes('permissions')) {
      errorMessage = 'API key permissions error. For live payouts, you need to implement Stripe Connect with Express accounts.';
    } else if (error.message.includes('Invalid API Key')) {
      errorMessage = 'Invalid Stripe API key. Please check your key in the Stripe Dashboard.';
    } else if (error.message.includes('No such destination')) {
      errorMessage = 'Bank account not set up. Please complete account setup first.';
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
