
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface VerifyPaymentRequest {
  paymentIntentId: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: VerifyPaymentRequest = await req.json();
    const { paymentIntentId } = body;
    
    console.log('Verify Payment - Request:', { paymentIntentId });
    
    if (!paymentIntentId) {
      throw new Error('Payment Intent ID is required');
    }
    
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeKey) {
      throw new Error('Stripe secret key not configured');
    }
    
    const stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16' });
    
    // Retrieve payment intent to verify status
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    console.log('Payment Intent status:', paymentIntent.status);
    
    return new Response(JSON.stringify({
      success: true,
      data: {
        paymentIntentId: paymentIntent.id,
        status: paymentIntent.status,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        customerEmail: paymentIntent.receipt_email,
        created: paymentIntent.created,
        confirmed: paymentIntent.status === 'succeeded',
      },
      timestamp: new Date().toISOString(),
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('Payment Verification Error:', error);
    
    let errorMessage = error.message;
    
    if (error.message.includes('No such payment_intent')) {
      errorMessage = 'Payment not found. Please check the payment ID.';
    } else if (error.message.includes('permissions')) {
      errorMessage = 'API key permissions error. Payment verification may be limited with restricted keys.';
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
