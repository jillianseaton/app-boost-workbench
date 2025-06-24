
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
    
    // Get ALL recent payouts from Stripe (not just filtered by user)
    const allPayouts = await stripe.payouts.list({
      limit: 50, // Increased limit to catch more payouts
    });
    
    console.log(`Total payouts found in Stripe: ${allPayouts.data.length}`);
    
    // Log all payouts for debugging
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
    
    // Filter payouts for this user - try multiple matching strategies
    const userPayouts = allPayouts.data.filter(payout => {
      // Strategy 1: Check metadata user_id
      if (payout.metadata?.user_id === userId) {
        console.log(`Found payout via metadata user_id: ${payout.id}`);
        return true;
      }
      
      // Strategy 2: Check metadata userId (alternative format)
      if (payout.metadata?.userId === userId) {
        console.log(`Found payout via metadata userId: ${payout.id}`);
        return true;
      }
      
      // Strategy 3: Check description for user ID
      if (payout.description && payout.description.includes(userId)) {
        console.log(`Found payout via description: ${payout.id}`);
        return true;
      }
      
      // Strategy 4: For recent payouts (within last 24 hours), include them with a note
      const payoutTime = new Date(payout.created * 1000);
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      
      if (payoutTime > twentyFourHoursAgo) {
        console.log(`Including recent payout (within 24h): ${payout.id}`);
        return true;
      }
      
      return false;
    });
    
    // Format payout data
    const formattedPayouts = userPayouts.map(payout => ({
      id: payout.id,
      amount: payout.amount,
      currency: payout.currency,
      status: payout.status,
      method: payout.method,
      created_at: new Date(payout.created * 1000).toISOString(),
      arrival_date: payout.arrival_date ? new Date(payout.arrival_date * 1000).toISOString() : null,
      description: payout.description,
      metadata: payout.metadata,
      // Add debugging info
      matching_strategy: payout.metadata?.user_id === userId ? 'metadata_user_id' :
                        payout.metadata?.userId === userId ? 'metadata_userId' :
                        payout.description?.includes(userId) ? 'description' : 'recent_payout'
    }));
    
    console.log(`Found ${formattedPayouts.length} payouts for user ${userId}`);
    
    // If no payouts found, provide helpful debugging info
    if (formattedPayouts.length === 0) {
      console.log('No payouts found. Recent payouts available:');
      const recentPayouts = allPayouts.data.slice(0, 5).map(p => ({
        id: p.id,
        amount: p.amount / 100,
        status: p.status,
        created: new Date(p.created * 1000).toISOString(),
        metadata: p.metadata,
        description: p.description
      }));
      console.log('Recent payouts:', JSON.stringify(recentPayouts, null, 2));
    }
    
    return new Response(JSON.stringify({
      success: true,
      payouts: formattedPayouts,
      debug_info: {
        total_stripe_payouts: allPayouts.data.length,
        user_id_searched: userId,
        search_strategies_used: ['metadata.user_id', 'metadata.userId', 'description_contains', 'recent_payouts']
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
