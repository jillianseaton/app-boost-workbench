
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
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
    const { userEmail } = await req.json();
    
    console.log('Fetching recent payout history');
    
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeKey) {
      throw new Error('Stripe secret key not configured');
    }
    
    const stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16' });
    
    // Get recent payouts from Stripe (show all recent payouts)
    const allPayouts = await stripe.payouts.list({
      limit: 20, // Show more recent payouts
    });
    
    console.log(`Total recent payouts found in Stripe: ${allPayouts.data.length}`);
    
    // Log recent payouts for debugging
    allPayouts.data.forEach((payout, index) => {
      console.log(`Payout ${index + 1}:`, {
        id: payout.id,
        amount: payout.amount,
        status: payout.status,
        created: new Date(payout.created * 1000).toISOString(),
        metadata: payout.metadata,
        description: payout.description
      });
    });
    
    // Format all recent payout data (don't filter by user ID)
    const formattedPayouts = allPayouts.data.map(payout => ({
      id: payout.id,
      amount: payout.amount,
      currency: payout.currency,
      status: payout.status,
      method: payout.method,
      created_at: new Date(payout.created * 1000).toISOString(),
      arrival_date: payout.arrival_date ? new Date(payout.arrival_date * 1000).toISOString() : null,
      description: payout.description,
      metadata: payout.metadata,
    }));
    
    console.log(`Returning ${formattedPayouts.length} recent payouts`);
    
    return new Response(JSON.stringify({
      success: true,
      payouts: formattedPayouts,
      debug_info: {
        total_stripe_payouts: allPayouts.data.length,
        search_note: "Showing all recent payouts from your Stripe account",
        user_email: userEmail || 'not_provided'
      },
      timestamp: new Date().toISOString(),
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('Get Payout History Error:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Failed to fetch payout history',
      timestamp: new Date().toISOString(),
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
