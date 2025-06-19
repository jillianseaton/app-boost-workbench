
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CashAppPayoutLinkRequest {
  amount: number;
  cashAppTag: string;
  description?: string;
  userId: string;
  email: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: CashAppPayoutLinkRequest = await req.json();
    console.log('Creating Cash App payout link:', body);
    
    const { amount, cashAppTag, description, userId, email } = body;
    
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
    
    // Get the origin for redirect URLs
    const origin = req.headers.get('origin') || 'https://dde3f2f4-d22c-4d88-81b1-a276fad88405.lovableproject.com';
    
    console.log('Creating Cash App payout link with Stripe Payment Links...');
    
    // Create a product for the payout
    const product = await stripe.products.create({
      name: `Cash App Payout to ${cashAppTag}`,
      type: 'service',
      metadata: {
        userId: userId,
        cashAppTag: cashAppTag,
        payoutType: 'cashapp',
      },
    });
    
    // Create a price for the payout amount
    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: Math.round(amount * 100), // Convert to cents
      currency: 'usd',
      metadata: {
        userId: userId,
        cashAppTag: cashAppTag,
      },
    });
    
    // Create a payment link for the payout
    const paymentLink = await stripe.paymentLinks.create({
      line_items: [
        {
          price: price.id,
          quantity: 1,
        },
      ],
      after_completion: {
        type: 'redirect',
        redirect: {
          url: `${origin}/payout-success?session_id={CHECKOUT_SESSION_ID}&cashapp_tag=${encodeURIComponent(cashAppTag)}`,
        },
      },
      metadata: {
        userId: userId,
        cashAppTag: cashAppTag,
        payoutType: 'cashapp',
        description: description || `Payout to ${cashAppTag}`,
      },
    });
    
    console.log('Cash App payout link created:', paymentLink.id);
    
    return new Response(JSON.stringify({
      success: true,
      data: {
        payoutLinkId: paymentLink.id,
        payoutUrl: paymentLink.url,
        amount: amount,
        cashAppTag: cashAppTag,
        description: description || `Payout to ${cashAppTag}`,
      },
      timestamp: new Date().toISOString(),
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('Cash App Payout Link Error:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Failed to create Cash App payout link',
      timestamp: new Date().toISOString(),
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
