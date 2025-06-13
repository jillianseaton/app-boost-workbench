
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CreateCurrencyCheckoutRequest {
  accountId: string;
  currency: string;
  amount: number;
  productName: string;
  successUrl: string;
  cancelUrl: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: CreateCurrencyCheckoutRequest = await req.json();
    const { accountId, currency, amount, productName, successUrl, cancelUrl } = body;
    
    console.log('Creating currency-based checkout session:', { currency, amount, accountId });
    
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeKey) {
      throw new Error('Stripe secret key not configured');
    }
    
    const stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16' });
    
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{
        price_data: {
          currency: currency.toLowerCase(),
          product_data: {
            name: productName,
          },
          unit_amount: amount,
        },
        quantity: 1,
      }],
      success_url: successUrl,
      cancel_url: cancelUrl,
      payment_intent_data: {
        application_fee_amount: Math.floor(amount * 0.05), // 5% fee
        transfer_data: {
          destination: accountId,
        },
      },
    });
    
    console.log('Currency checkout session created:', session.id);
    
    return new Response(JSON.stringify({
      success: true,
      data: {
        url: session.url,
        sessionId: session.id,
      },
      timestamp: new Date().toISOString(),
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('Create Currency Checkout Error:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Failed to create currency checkout session',
      timestamp: new Date().toISOString(),
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
