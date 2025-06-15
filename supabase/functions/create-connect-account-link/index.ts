
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CreateAccountLinkRequest {
  account: string;
  returnUrl?: string;
  refreshUrl?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: CreateAccountLinkRequest = await req.json();
    const { account, returnUrl, refreshUrl } = body;

    if (!account) {
      throw new Error('Account ID is required');
    }

    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeKey) {
      throw new Error('Stripe secret key not configured');
    }

    const stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16' });

    // Get the origin from the request headers for dynamic URL generation
    const origin = req.headers.get('origin') || 'http://localhost:5173';

    const accountLink = await stripe.accountLinks.create({
      account: account,
      return_url: returnUrl || `${origin}/stripe-connect?success=true&account=${account}`,
      refresh_url: refreshUrl || `${origin}/stripe-connect?refresh=true&account=${account}`,
      type: 'account_onboarding',
    });

    console.log('Account link created for account:', account);

    return new Response(JSON.stringify({
      url: accountLink.url
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('Create Account Link Error:', error);
    
    return new Response(JSON.stringify({
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
