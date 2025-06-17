
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PaymentIntentRequest {
  amount: number; // Amount in cents
  currency?: string;
  description?: string;
  customerEmail?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: PaymentIntentRequest = await req.json();
    const { amount, currency = 'usd', description, customerEmail } = body;
    
    console.log('Create Payment Intent - Request:', { amount, currency, description, customerEmail });
    
    if (!amount || amount < 50) { // Minimum $0.50
      throw new Error('Minimum payment amount is $0.50');
    }
    
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeKey) {
      throw new Error('Stripe secret key not configured');
    }
    
    if (!stripeKey.startsWith('rk_') && !stripeKey.startsWith('sk_')) {
      throw new Error('Invalid Stripe key format. Please use either a Restricted key (rk_) or Secret key (sk_)');
    }
    
    const stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16' });
    
    // Create payment intent with card payments only
    const paymentIntentData: any = {
      amount: Math.round(amount),
      currency: currency.toLowerCase(),
      payment_method_types: ['card'],
    };
    
    if (description) {
      paymentIntentData.description = description;
    }
    
    if (customerEmail) {
      try {
        const customers = await stripe.customers.list({
          email: customerEmail,
          limit: 1,
        });
        
        if (customers.data.length > 0) {
          paymentIntentData.customer = customers.data[0].id;
        } else {
          const customer = await stripe.customers.create({
            email: customerEmail,
          });
          paymentIntentData.customer = customer.id;
        }
      } catch (customerError) {
        console.log('Customer creation/lookup failed, proceeding without customer:', customerError);
      }
    }
    
    const paymentIntent = await stripe.paymentIntents.create(paymentIntentData);
    
    console.log('Payment Intent created:', paymentIntent.id);
    
    return new Response(JSON.stringify({
      success: true,
      data: {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: paymentIntent.status,
      },
      timestamp: new Date().toISOString(),
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('Payment Intent Creation Error:', error);
    
    let errorMessage = error.message;
    
    if (error.message.includes('permissions')) {
      errorMessage = 'API key permissions error. Payment processing may be limited with restricted keys.';
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
