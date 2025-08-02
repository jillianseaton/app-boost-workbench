
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
    
    // Remove destination requirement for simulation
    // if (!destination) {
    //   throw new Error('Destination bank account or card required');
    // }
    
    if (!userId) {
      throw new Error('User authentication required');
    }
    
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeKey) {
      throw new Error('Stripe secret key not configured');
    }
    
    const stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16' });
    
    // For now, simulate the payout since we don't have a destination account set up
    // In a real implementation, you would need to:
    // 1. Set up Stripe Connect with Express accounts
    // 2. Have users onboard their bank accounts
    // 3. Use the actual destination account ID
    
    const simulatedPayout = {
      id: `po_simulation_${Math.random().toString(36).substr(2, 9)}`,
      amount: amount,
      currency: currency.toLowerCase(),
      method: method,
      status: 'pending',
      arrival_date: Math.floor(Date.now() / 1000) + (2 * 24 * 60 * 60), // 2 days from now
      destination: 'simulated_account'
    };
    
    console.log('Simulated payout created:', simulatedPayout.id);
    
    // Initialize Supabase client for logging
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (supabaseUrl && supabaseServiceKey) {
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      
      // Log payout request (create payouts table if needed)
      try {
        await supabase.from('payouts').insert({
          user_id: userId,
          stripe_payout_id: simulatedPayout.id,
          amount: amount,
          currency: currency,
          method: method,
          destination: simulatedPayout.destination,
          status: simulatedPayout.status,
          created_at: new Date().toISOString()
        });
      } catch (dbError) {
        console.log('Database logging skipped (table may not exist):', dbError);
      }
    }
    
    return new Response(JSON.stringify({
      success: true,
      data: {
        payoutId: simulatedPayout.id,
        amount: simulatedPayout.amount,
        currency: simulatedPayout.currency,
        status: simulatedPayout.status,
        arrivalDate: simulatedPayout.arrival_date,
        method: simulatedPayout.method,
        destination: simulatedPayout.destination,
        note: 'This is a simulated payout for testing purposes.'
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
