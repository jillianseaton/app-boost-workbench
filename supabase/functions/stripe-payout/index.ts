
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
    
    if (!amount || amount < 1) {
      throw new Error('Minimum payout amount is $1.00');
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
    
    // For restricted keys, we can only simulate payouts since they don't have full API access
    // In a real implementation with restricted keys, you would:
    // 1. Create a payment intent for the payout amount
    // 2. Use Connect Express accounts for actual payouts
    // 3. Handle this through webhooks and Connect flows
    
    console.log('Payout simulation for:', { amount, email, userId });
    
    return new Response(JSON.stringify({
      success: true,
      data: {
        payoutId: `po_simulation_${Math.random().toString(36).substr(2, 9)}`,
        amount: amount,
        status: 'pending',
        estimatedArrival: '1-2 business days',
        accountId: 'simulation_account',
        note: 'This is a simulation. For live payouts, implement Stripe Connect with Express accounts.',
      },
      timestamp: new Date().toISOString(),
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
    
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
