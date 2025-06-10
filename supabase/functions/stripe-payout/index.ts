
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
    
    // Check if this is a restricted key
    if (stripeKey.startsWith('rk_')) {
      throw new Error('Restricted API key detected. Please use a Secret key (starting with sk_) instead of a Restricted key (rk_). You can find your Secret key in the Stripe Dashboard under Developers > API keys.');
    }
    
    if (!stripeKey.startsWith('sk_')) {
      throw new Error('Invalid Stripe key format. Please use a Secret key starting with sk_');
    }
    
    const stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16' });
    
    // For demo purposes, we'll create a successful response
    // In production, you would need a connected Express account
    console.log('Payout simulation for:', { amount, email, userId });
    
    return new Response(JSON.stringify({
      success: true,
      data: {
        payoutId: `po_demo_${Math.random().toString(36).substr(2, 9)}`,
        amount: amount,
        status: 'pending',
        estimatedArrival: '1-2 business days',
        accountId: 'demo_account',
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
      errorMessage = 'API key permissions error. Please use a Secret key (sk_) from your Stripe Dashboard, not a Restricted key (rk_).';
    } else if (error.message.includes('Invalid API Key')) {
      errorMessage = 'Invalid Stripe API key. Please check your Secret key in the Stripe Dashboard.';
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
