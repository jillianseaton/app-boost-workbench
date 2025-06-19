
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CashAppPayoutRequest {
  amount: number; // Amount in USD
  cashAppTag: string;
  email: string;
  userId: string;
  description?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: CashAppPayoutRequest = await req.json();
    const { amount, cashAppTag, email, userId, description } = body;
    
    console.log('Creating Cash App payout:', { amount, cashAppTag, email, userId });
    
    if (!amount || amount < 1.00) {
      throw new Error('Minimum Cash App payout amount is $1.00');
    }
    
    if (!cashAppTag || !cashAppTag.startsWith('$')) {
      throw new Error('Valid Cash App tag is required (format: $username)');
    }
    
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeKey) {
      throw new Error('Stripe secret key not configured');
    }
    
    const stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16' });
    
    // In a real implementation, you would:
    // 1. Find the user's connected Cash App account
    // 2. Create a transfer to their connected account
    // 3. The connected account would then payout to their Cash App
    
    // For now, we'll create a simulated payout record
    // In production, you'd need to implement the full Stripe Connect flow
    
    console.log('Creating Cash App payout transfer...');
    
    // This is a simulation - in real implementation you'd use:
    // const transfer = await stripe.transfers.create({
    //   amount: Math.round(amount * 100), // Convert to cents
    //   currency: 'usd',
    //   destination: connectedAccountId, // User's connected Cash App account
    //   description: description || `Cash App payout to ${cashAppTag}`,
    // });
    
    const simulatedPayoutId = `cashapp_payout_${Math.random().toString(36).substr(2, 9)}`;
    
    console.log('Cash App payout simulation created:', simulatedPayoutId);
    
    return new Response(JSON.stringify({
      success: true,
      data: {
        payoutId: simulatedPayoutId,
        amount: amount,
        status: 'pending',
        estimatedArrival: 'Instant to 1 hour',
        connectAccountId: `acct_simulation_${userId}`,
        cashAppTag: cashAppTag,
      },
      timestamp: new Date().toISOString(),
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('Cash App Payout Error:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Cash App payout failed',
      timestamp: new Date().toISOString(),
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
