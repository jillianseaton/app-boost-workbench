
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
  console.log('Edge Function: setup-cashapp-connect called', {
    method: req.method,
    url: req.url,
    headers: Object.fromEntries(req.headers.entries())
  });

  if (req.method === 'OPTIONS') {
    console.log('Edge Function: Handling CORS preflight request');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Edge Function: Processing POST request');
    
    const body: CashAppSetupRequest = await req.json();
    console.log('Edge Function: Request body received:', body);
    
    const { email, userId, cashAppTag } = body;
    
    if (!email || !userId || !cashAppTag) {
      console.error('Edge Function: Missing required fields:', { email: !!email, userId: !!userId, cashAppTag: !!cashAppTag });
      throw new Error('Email, userId, and Cash App tag are required');
    }
    
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeKey) {
      console.error('Edge Function: Stripe secret key not found in environment');
      throw new Error('Stripe secret key not configured');
    }
    
    console.log('Edge Function: Initializing Stripe with key length:', stripeKey.length);
    const stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16' });
    
    console.log('Edge Function: Creating Stripe Connect Express account');
    
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
    
    console.log('Edge Function: Stripe account created successfully:', account.id);
    
    // Get the origin from the request headers for proper redirect URLs
    const origin = req.headers.get('origin') || req.headers.get('referer')?.split('/').slice(0, 3).join('/') || 'https://dde3f2f4-d22c-4d88-81b1-a276fad88405.lovableproject.com';
    console.log('Edge Function: Using origin for redirects:', origin);
    
    // Create account link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      return_url: `${origin}/dashboard?cashapp_setup=success&account=${account.id}`,
      refresh_url: `${origin}/dashboard?cashapp_setup=refresh&account=${account.id}`,
      type: 'account_onboarding',
    });
    
    console.log('Edge Function: Account link created:', accountLink.url);
    
    const response = {
      success: true,
      data: {
        connectAccountId: account.id,
        onboardingUrl: accountLink.url,
        payoutsEnabled: account.payouts_enabled,
        cashAppEnabled: false, // Will be enabled after onboarding
      },
      timestamp: new Date().toISOString(),
    };
    
    console.log('Edge Function: Sending successful response:', response);
    
    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('Edge Function: Error occurred:', error);
    console.error('Edge Function: Error stack:', error.stack);
    
    const errorResponse = {
      success: false,
      error: error.message || 'Cash App Connect setup failed',
      timestamp: new Date().toISOString(),
    };
    
    console.log('Edge Function: Sending error response:', errorResponse);
    
    return new Response(JSON.stringify(errorResponse), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
