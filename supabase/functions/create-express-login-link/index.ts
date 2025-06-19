
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface LoginLinkRequest {
  account: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: LoginLinkRequest = await req.json();
    const connectedAccountId = body.account;

    if (!connectedAccountId) {
      throw new Error('Account ID is required');
    }

    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeKey) {
      throw new Error('Stripe secret key not configured');
    }

    const stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16' });

    // Create login link for Express dashboard access
    const loginLink = await stripe.accounts.createLoginLink(connectedAccountId);

    console.log('Express login link created for account:', connectedAccountId);

    return new Response(JSON.stringify({
      object: loginLink.object,
      created: loginLink.created,
      url: loginLink.url
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('Express login link creation error:', error);
    
    return new Response(JSON.stringify({
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
