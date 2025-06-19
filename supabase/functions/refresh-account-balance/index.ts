
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RefreshBalanceRequest {
  accountId: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: RefreshBalanceRequest = await req.json();
    console.log('Refreshing balance for account:', body.accountId);
    
    const { accountId } = body;
    
    if (!accountId) {
      throw new Error('Account ID is required');
    }
    
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeKey) {
      throw new Error('Stripe secret key not configured');
    }
    
    const stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16' });
    
    // Refresh the account balance
    const balanceRefresh = await stripe.financialConnections.accounts.refresh({
      account: accountId,
      features: ['balance'],
    });
    
    console.log('Balance refresh initiated:', balanceRefresh);
    
    return new Response(JSON.stringify({
      success: true,
      data: {
        status: balanceRefresh.balance_refresh?.status || 'pending',
        last_attempted_at: balanceRefresh.balance_refresh?.last_attempted_at || Date.now() / 1000,
        next_refresh_available_at: balanceRefresh.balance_refresh?.next_refresh_available_at,
      },
      timestamp: new Date().toISOString(),
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('Refresh Account Balance Error:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Failed to refresh account balance',
      timestamp: new Date().toISOString(),
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
