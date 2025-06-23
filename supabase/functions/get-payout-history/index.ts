
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
    const { userId } = await req.json();
    
    if (!userId) {
      throw new Error('User ID required');
    }
    
    console.log('Fetching payout history for user:', userId);
    
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeKey) {
      throw new Error('Stripe secret key not configured');
    }
    
    const stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16' });
    
    // Get payouts from Stripe filtered by user metadata
    const payouts = await stripe.payouts.list({
      limit: 100,
    });
    
    // Filter payouts for this user
    const userPayouts = payouts.data.filter(payout => 
      payout.metadata?.user_id === userId
    );
    
    // Format payout data
    const formattedPayouts = userPayouts.map(payout => ({
      id: payout.id,
      amount: payout.amount,
      currency: payout.currency,
      status: payout.status,
      method: payout.method,
      created_at: new Date(payout.created * 1000).toISOString(),
      arrival_date: payout.arrival_date ? new Date(payout.arrival_date * 1000).toISOString() : null,
      description: payout.description
    }));
    
    console.log(`Found ${formattedPayouts.length} payouts for user ${userId}`);
    
    return new Response(JSON.stringify({
      success: true,
      payouts: formattedPayouts,
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
