
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PayoutRequest {
  amount: number; // Amount in cents
  currency: string;
  method: 'instant' | 'standard';
  destination: string; // Bank account or card ID
  userId: string;
  userEmail: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: PayoutRequest = await req.json();
    const { amount, currency, method, destination, userId, userEmail } = body;
    
    console.log('Processing Lovable to Stripe payout:', { amount, currency, method, userId });
    
    // Validate input
    if (!amount || amount < 100) { // Minimum $1.00
      throw new Error('Minimum payout amount is $1.00');
    }
    
    if (!destination) {
      throw new Error('Destination bank account or card required');
    }
    
    if (!userId) {
      throw new Error('User authentication required');
    }
    
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeKey) {
      throw new Error('Stripe secret key not configured');
    }
    
    const stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16' });
    
    // Create Stripe payout
    const payout = await stripe.payouts.create({
      amount: amount,
      currency: currency.toLowerCase(),
      method: method,
      destination: destination,
      description: `Lovable payout for user ${userEmail}`,
      metadata: {
        user_id: userId,
        source: 'lovable_integration',
        platform: 'lovable.dev'
      }
    });
    
    console.log('Stripe payout created:', payout.id);
    
    // Initialize Supabase client for logging
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (supabaseUrl && supabaseServiceKey) {
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      
      // Log payout request (create payouts table if needed)
      try {
        await supabase.from('payouts').insert({
          user_id: userId,
          stripe_payout_id: payout.id,
          amount: amount,
          currency: currency,
          method: method,
          destination: destination,
          status: payout.status,
          created_at: new Date().toISOString()
        });
      } catch (dbError) {
        console.log('Database logging skipped (table may not exist):', dbError);
      }
    }
    
    return new Response(JSON.stringify({
      success: true,
      data: {
        payoutId: payout.id,
        amount: payout.amount,
        currency: payout.currency,
        status: payout.status,
        arrivalDate: payout.arrival_date,
        method: payout.method,
        destination: payout.destination
      },
      timestamp: new Date().toISOString(),
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('Lovable Stripe Payout Error:', error);
    
    let errorMessage = error.message || 'Payout processing failed';
    
    // Handle common Stripe errors
    if (error.type === 'StripeInvalidRequestError') {
      if (error.code === 'balance_insufficient') {
        errorMessage = 'Insufficient balance in your Stripe account to process this payout.';
      } else if (error.code === 'invalid_request_error') {
        errorMessage = 'Invalid payout request. Please check your bank account details.';
      }
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
