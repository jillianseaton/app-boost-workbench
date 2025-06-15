
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    
    if (!stripeKey || !webhookSecret) {
      throw new Error('Missing Stripe configuration');
    }

    const stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16' });
    
    // Get the raw body and signature
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');
    
    if (!signature) {
      throw new Error('Missing stripe-signature header');
    }

    // Verify the webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return new Response('Webhook signature verification failed', { status: 400 });
    }

    console.log('Received Stripe event:', event.type);

    // Initialize Supabase client with service role key for database operations
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed':
        const checkoutSession = event.data.object as Stripe.Checkout.Session;
        
        // Create order in database
        await createOrder(supabase, checkoutSession);
        
        // Check if payment is already completed
        if (checkoutSession.payment_status === 'paid') {
          await fulfillOrder(supabase, checkoutSession);
        }
        break;

      case 'checkout.session.async_payment_succeeded':
        const succeededSession = event.data.object as Stripe.Checkout.Session;
        await fulfillOrder(supabase, succeededSession);
        break;

      case 'checkout.session.async_payment_failed':
        const failedSession = event.data.object as Stripe.Checkout.Session;
        await emailCustomerAboutFailedPayment(supabase, failedSession);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Webhook handler error:', error);
    return new Response(`Webhook handler failed: ${error.message}`, {
      status: 400,
      headers: corsHeaders,
    });
  }
});

async function createOrder(supabase: any, checkoutSession: Stripe.Checkout.Session) {
  try {
    console.log('Creating order for session:', checkoutSession.id);
    
    const orderData = {
      stripe_session_id: checkoutSession.id,
      customer_email: checkoutSession.customer_details?.email,
      amount_total: checkoutSession.amount_total,
      currency: checkoutSession.currency,
      payment_status: checkoutSession.payment_status,
      status: 'awaiting_payment',
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('orders')
      .insert(orderData)
      .select()
      .single();

    if (error) {
      console.error('Error creating order:', error);
      throw error;
    }

    console.log('Order created successfully:', data);
    return data;
  } catch (error) {
    console.error('Failed to create order:', error);
    throw error;
  }
}

async function fulfillOrder(supabase: any, checkoutSession: Stripe.Checkout.Session) {
  try {
    console.log('Fulfilling order for session:', checkoutSession.id);
    
    // Update order status to fulfilled
    const { data, error } = await supabase
      .from('orders')
      .update({ 
        status: 'fulfilled',
        payment_status: 'paid',
        fulfilled_at: new Date().toISOString()
      })
      .eq('stripe_session_id', checkoutSession.id)
      .select()
      .single();

    if (error) {
      console.error('Error fulfilling order:', error);
      throw error;
    }

    console.log('Order fulfilled successfully:', data);
    
    // TODO: Add your custom fulfillment logic here
    // Examples:
    // - Send product delivery email
    // - Generate download links
    // - Update inventory
    // - Send to fulfillment service
    
    return data;
  } catch (error) {
    console.error('Failed to fulfill order:', error);
    throw error;
  }
}

async function emailCustomerAboutFailedPayment(supabase: any, checkoutSession: Stripe.Checkout.Session) {
  try {
    console.log('Processing failed payment for session:', checkoutSession.id);
    
    // Update order status
    const { error } = await supabase
      .from('orders')
      .update({ 
        status: 'payment_failed',
        payment_status: 'unpaid'
      })
      .eq('stripe_session_id', checkoutSession.id);

    if (error) {
      console.error('Error updating failed payment order:', error);
    }

    // TODO: Implement email notification
    // You can use Resend or another email service here
    console.log('Should email customer about failed payment:', {
      session_id: checkoutSession.id,
      customer_email: checkoutSession.customer_details?.email
    });
    
  } catch (error) {
    console.error('Failed to process payment failure:', error);
    throw error;
  }
}
