
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CreateAccountLinkRequest {
  accountId: string;
  refreshUrl: string;
  returnUrl: string;
  collectionType: 'currently_due' | 'eventually_due';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: CreateAccountLinkRequest = await req.json();
    const { accountId, refreshUrl, returnUrl, collectionType } = body;
    
    console.log('Creating account link for:', accountId, 'with collection type:', collectionType);
    
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeKey) {
      throw new Error('Stripe secret key not configured');
    }
    
    const stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16' });
    
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: refreshUrl,
      return_url: returnUrl,
      type: 'account_onboarding',
      collection_options: {
        fields: collectionType,
      },
    });
    
    console.log('Account link created successfully:', accountLink.url);
    
    return new Response(JSON.stringify({
      success: true,
      data: {
        url: accountLink.url,
        expires_at: accountLink.expires_at,
      },
      timestamp: new Date().toISOString(),
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('Create Account Link Error:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Failed to create account link',
      timestamp: new Date().toISOString(),
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
