
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
    
    const stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16' });
    
    // Get or create Express account
    let account = await getOrCreateExpressAccount(stripe, email, userId);
    
    // Create account link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: returnUrl || `${req.headers.get('origin')}/account-setup?refresh=true`,
      return_url: returnUrl || `${req.headers.get('origin')}/account-setup?success=true`,
      type: 'account_onboarding',
    });
    
    console.log('Account link created for:', account.id);
    
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
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function getOrCreateExpressAccount(stripe: Stripe, email: string, userId: string) {
  // Check if account already exists
  const accounts = await stripe.accounts.list({
    limit: 100,
  });
  
  let existingAccount = accounts.data.find(acc => 
    acc.email === email || acc.metadata?.userId === userId
  );
  
  if (existingAccount) {
    return existingAccount;
  }
  
  // Create new Express account
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
  
  return account;
}
