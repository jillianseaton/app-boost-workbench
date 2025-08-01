
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CheckoutSessionRequest {
  amount: number; // Amount in cents
  description: string;
  successUrl: string;
  cancelUrl: string;
  customerEmail?: string;
  mode?: 'payment' | 'setup';
  paymentMethod?: 'card' | 'cashapp';
}

// Email validation helper
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: CheckoutSessionRequest = await req.json();
    const { amount, description, successUrl, cancelUrl, customerEmail, mode = 'payment', paymentMethod = 'card' } = body;
    
    console.log('Create Checkout Session - Request:', { amount, description, mode, customerEmail, paymentMethod });
    
    if (mode === 'payment' && (!amount || amount < 50)) {
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
    
    let customerId;
    // Only attempt customer creation/lookup if we have a valid email
    if (customerEmail && isValidEmail(customerEmail)) {
      try {
        const customers = await stripe.customers.list({
          email: customerEmail,
          limit: 1,
        });
        
        if (customers.data.length > 0) {
          customerId = customers.data[0].id;
        } else {
          const customer = await stripe.customers.create({
            email: customerEmail,
          });
          customerId = customer.id;
        }
      } catch (customerError) {
        console.log('Customer creation/lookup failed, proceeding without customer:', customerError);
      }
    } else if (customerEmail) {
      console.log('Invalid email format provided:', customerEmail, 'proceeding without customer');
    }
    
    const sessionConfig: any = {
      customer: customerId,
      customer_email: customerId ? undefined : (customerEmail && isValidEmail(customerEmail) ? customerEmail : undefined),
      success_url: successUrl,
      cancel_url: cancelUrl,
      mode: mode,
    };
    
    // Configure payment method types based on the requested method
    if (paymentMethod === 'cashapp') {
      sessionConfig.payment_method_types = ['cashapp'];
    } else {
      sessionConfig.payment_method_types = ['card'];
    }
    
    if (mode === 'payment') {
      sessionConfig.line_items = [
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
      ];
    }
    
    const session = await stripe.checkout.sessions.create(sessionConfig);
    
    console.log('Checkout Session created:', session.id);
    
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
    console.error('Checkout Session Creation Error:', error);
    
    let errorMessage = error.message;
    
    if (error.message.includes('permissions')) {
      errorMessage = 'API key permissions error. Checkout session creation may be limited with restricted keys.';
    } else if (error.message.includes('Invalid API Key')) {
      errorMessage = 'Invalid Stripe API key. Please check your key in the Stripe Dashboard.';
    } else if (error.message.includes('cashapp')) {
      errorMessage = 'Cash App Pay is not enabled for your Stripe account. Please enable it in your Stripe Dashboard under Payment Methods.';
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
