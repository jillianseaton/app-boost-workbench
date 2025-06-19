
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CashAppSetupRequest {
  email: string;
  userId: string;
  cashAppTag: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: CashAppSetupRequest = await req.json();
    const { email, userId, cashAppTag } = body;
    
    console.log('Setting up Cash App Connect account:', { email, userId, cashAppTag });
    
    if (!email || !userId || !cashAppTag) {
      throw new Error('Email, userId, and Cash App tag are required');
    }
    
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeKey) {
      throw new Error('Stripe secret key not configured');
    }
    
    const stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16' });
    
    // Create a Stripe Connect Express account for Cash App payouts
    const account = await stripe.accounts.create({
      type: 'express',
      country: 'US',
      email: email,
      capabilities: {
        card_payments: { requested: false },
        transfers: { requested: true },
      },
      business_type: 'individual',
      individual: {
        email: email,
      },
      metadata: {
        userId: userId,
        cashAppTag: cashAppTag,
        purpose: 'cashapp_payouts'
      }
    });
    
    console.log('Cash App Connect account created:', account.id);
    
    // Create account link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      return_url: `${req.headers.get('origin') || 'http://localhost:5173'}/dashboard?cashapp_setup=success&account=${account.id}`,
      refresh_url: `${req.headers.get('origin') || 'http://localhost:5173'}/dashboard?cashapp_setup=refresh&account=${account.id}`,
      type: 'account_onboarding',
    });
    
    return new Response(JSON.stringify({
      success: true,
      data: {
        connectAccountId: account.id,
        onboardingUrl: accountLink.url,
        payoutsEnabled: account.payouts_enabled,
        cashAppEnabled: false, // Will be enabled after onboarding
      },
      timestamp: new Date().toISOString(),
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('Cash App Connect Setup Error:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Cash App Connect setup failed',
      timestamp: new Date().toISOString(),
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
