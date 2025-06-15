
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface FetchBalanceTransactionsRequest {
  limit?: number;
  starting_after?: string;
  ending_before?: string;
  filters?: {
    type?: string;
    status?: string;
    reporting_category?: string;
    created_gte?: number;
    created_lte?: number;
    available_on_gte?: number;
    available_on_lte?: number;
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: FetchBalanceTransactionsRequest = await req.json();
    console.log('Fetching balance transactions with params:', body);
    
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeKey) {
      throw new Error('Stripe secret key not configured');
    }
    
    const stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16' });
    
    // Build parameters for Stripe API
    const params: any = {
      limit: body.limit || 20,
    };
    
    if (body.starting_after) {
      params.starting_after = body.starting_after;
    }
    
    if (body.ending_before) {
      params.ending_before = body.ending_before;
    }
    
    // Apply filters if provided
    if (body.filters) {
      if (body.filters.type) {
        params.type = body.filters.type;
      }
      if (body.filters.created_gte) {
        params.created = { gte: body.filters.created_gte };
      }
      if (body.filters.created_lte) {
        if (params.created) {
          params.created.lte = body.filters.created_lte;
        } else {
          params.created = { lte: body.filters.created_lte };
        }
      }
      if (body.filters.available_on_gte) {
        params.available_on = { gte: body.filters.available_on_gte };
      }
      if (body.filters.available_on_lte) {
        if (params.available_on) {
          params.available_on.lte = body.filters.available_on_lte;
        } else {
          params.available_on = { lte: body.filters.available_on_lte };
        }
      }
    }
    
    const balanceTransactions = await stripe.balanceTransactions.list(params);
    
    console.log('Balance transactions retrieved:', balanceTransactions.data.length);
    
    return new Response(JSON.stringify({
      success: true,
      data: balanceTransactions,
      timestamp: new Date().toISOString(),
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('Fetch Balance Transactions Error:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Failed to fetch balance transactions',
      timestamp: new Date().toISOString(),
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
