
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AccountSetupRequest {
  email: string;
  userId: string;
  returnUrl?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: AccountSetupRequest = await req.json();
    const { email, userId, returnUrl } = body;
    
    console.log('Stripe Account Setup - Request:', { email, userId });
    
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeKey) {
      throw new Error('Stripe secret key not configured');
    }
    
    // Accept both restricted keys (rk_) and secret keys (sk_)
    if (!stripeKey.startsWith('rk_') && !stripeKey.startsWith('sk_')) {
      throw new Error('Invalid Stripe key format. Please use either a Restricted key (rk_) or Secret key (sk_)');
    }
    
    const stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16' });
    
    // Create Express account (works with both restricted and full keys)
    const account = await stripe.accounts.create({
      type: 'express',
      email: email,
      metadata: {
        userId: userId,
        platform: 'EarnFlow',
      },
      capabilities: {
        transfers: { requested: true },
      },
    });
    
    // Create account link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: returnUrl || `${req.headers.get('origin')}/account-setup?refresh=true`,
      return_url: returnUrl || `${req.headers.get('origin')}/account-setup?success=true`,
      type: 'account_onboarding',
    });
    
    console.log('Account created and link generated for:', account.id);
    
    return new Response(JSON.stringify({
      success: true,
      data: {
        accountId: account.id,
        onboardingUrl: accountLink.url,
        payoutsEnabled: account.payouts_enabled,
      },
      timestamp: new Date().toISOString(),
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('Stripe Account Setup Error:', error);
    
    let errorMessage = error.message;
    
    // Provide more helpful error messages for common issues
    if (error.message.includes('permissions')) {
      errorMessage = 'API key permissions error. For full account setup, you may need additional permissions or Connect setup.';
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
