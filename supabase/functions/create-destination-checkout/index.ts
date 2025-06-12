
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DestinationCheckoutRequest {
  amount: number; // Amount in cents
  description: string;
  connectedAccountId: string;
  applicationFeeAmount: number; // Platform fee in cents
  successUrl: string;
  cancelUrl: string;
  customerEmail?: string;
  onBehalfOf?: boolean; // Whether to use on_behalf_of parameter
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: DestinationCheckoutRequest = await req.json();
    const { 
      amount, 
      description, 
      connectedAccountId, 
      applicationFeeAmount, 
      successUrl, 
      cancelUrl, 
      customerEmail,
      onBehalfOf = false
    } = body;
    
    console.log('Create Destination Checkout - Request:', { 
      amount, 
      description, 
      connectedAccountId, 
      applicationFeeAmount,
      onBehalfOf
    });
    
    if (!amount || amount < 50) {
      throw new Error('Minimum payment amount is $0.50');
    }

    if (!connectedAccountId) {
      throw new Error('Connected account ID is required');
    }

    if (applicationFeeAmount >= amount) {
      throw new Error('Application fee cannot be greater than or equal to the total amount');
    }
    
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeKey) {
      throw new Error('Stripe secret key not configured');
    }
    
    const stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16' });
    
    // Create payment intent data for destination charge
    const paymentIntentData: any = {
      application_fee_amount: applicationFeeAmount,
      transfer_data: {
        destination: connectedAccountId,
      },
    };

    // Add on_behalf_of if specified (for settlement merchant control)
    if (onBehalfOf) {
      paymentIntentData.on_behalf_of = connectedAccountId;
    }

    const sessionConfig: any = {
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: description,
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      payment_intent_data: paymentIntentData,
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
    };

    // Add customer email if provided
    if (customerEmail) {
      sessionConfig.customer_email = customerEmail;
    }
    
    const session = await stripe.checkout.sessions.create(sessionConfig);
    
    console.log('Destination Checkout Session created:', session.id);
    
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
    console.error('Destination Checkout Session Creation Error:', error);
    
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
