
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
    
    const stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16' });
    
    // Create or get Stripe Express account for the user
    let account = await getOrCreateExpressAccount(stripe, email, userId);
    
    // Check if account is ready for payouts
    if (!account.payouts_enabled) {
      throw new Error('Account not yet ready for payouts. Please complete account setup.');
    }
    
    // Create the payout
    const payout = await stripe.transfers.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'usd',
      destination: account.id,
      description: `EarnFlow withdrawal for ${email}`,
    });
    
    console.log('Payout created:', payout.id);
    
    return new Response(JSON.stringify({
      success: true,
      data: {
        payoutId: payout.id,
        amount: amount,
        status: 'pending',
        estimatedArrival: '1-2 business days',
        accountId: account.id,
      },
      timestamp: new Date().toISOString(),
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('Stripe Payout Error:', error);
    
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
