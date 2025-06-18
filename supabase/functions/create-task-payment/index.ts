
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TaskPaymentRequest {
  amount: number; // Amount in cents
  description: string;
  taskType: string;
  userId: string;
  customerEmail?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: TaskPaymentRequest = await req.json();
    const { amount, description, taskType, userId, customerEmail } = body;
    
    console.log('Create Task Payment - Request:', { amount, description, taskType, userId, customerEmail });
    
    if (!amount || amount < 50) { // Minimum $0.50
      throw new Error('Minimum task payment amount is $0.50');
    }
    
    if (!taskType || !userId) {
      throw new Error('Task type and user ID are required');
    }
    
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeKey) {
      throw new Error('Stripe secret key not configured');
    }
    
    const stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16' });
    
    // Create or find customer
    let customerId;
    if (customerEmail) {
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
            metadata: {
              userId: userId,
              taskType: taskType,
            },
          });
          customerId = customer.id;
        }
      } catch (customerError) {
        console.log('Customer creation/lookup failed, proceeding without customer:', customerError);
      }
    }
    
    // Create payment intent for the task
    const paymentIntentData: any = {
      amount: Math.round(amount),
      currency: 'usd',
      payment_method_types: ['card'],
      description: description,
      metadata: {
        taskType: taskType,
        userId: userId,
        paymentFor: 'optimization_task',
      },
    };
    
    if (customerId) {
      paymentIntentData.customer = customerId;
    }
    
    const paymentIntent = await stripe.paymentIntents.create(paymentIntentData);
    
    console.log('Task Payment Intent created:', paymentIntent.id);
    
    // Optionally store the payment intent in Supabase for tracking
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );
    
    // Store task payment record
    try {
      await supabaseClient.from('task_payments').insert({
        user_id: userId,
        stripe_payment_intent_id: paymentIntent.id,
        task_type: taskType,
        amount: amount,
        status: 'pending',
        created_at: new Date().toISOString(),
      });
    } catch (dbError) {
      console.log('Failed to store task payment record:', dbError);
      // Continue anyway - payment creation succeeded
    }
    
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
    console.error('Task Payment Creation Error:', error);
    
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
