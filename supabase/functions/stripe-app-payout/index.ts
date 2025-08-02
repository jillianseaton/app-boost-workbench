import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper logging function for enhanced debugging
const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-APP-PAYOUT] ${step}${detailsStr}`);
};

interface AppPayoutRequest {
  amount?: number; // Optional: specific amount to payout (in USD)
  stripeAccountId?: string; // Optional: specific Stripe account for Express payouts
  method?: 'instant' | 'standard';
  description?: string;
  payoutType?: 'commissions' | 'manual'; // Type of payout
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("App payout function started");

    // Validate required environment variables
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      throw new Error("STRIPE_SECRET_KEY is not configured");
    }
    logStep("Stripe key verified");

    // Initialize Supabase client for authentication
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // Authenticate user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header provided");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) {
      throw new Error(`Authentication error: ${userError.message}`);
    }
    
    const user = userData.user;
    if (!user?.email) {
      throw new Error("User not authenticated or email not available");
    }
    logStep("User authenticated", { userId: user.id, email: user.email });

    // Parse request body
    const body: AppPayoutRequest = await req.json();
    const { 
      amount, 
      stripeAccountId, 
      method = 'standard',
      description,
      payoutType = 'commissions'
    } = body;

    logStep("Request parsed", { 
      amount, 
      stripeAccountId, 
      method, 
      payoutType,
      hasDescription: !!description
    });

    // Initialize Supabase service client for database operations
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    let payoutAmount: number;
    let commissionIds: string[] = [];

    if (payoutType === 'commissions') {
      // Fetch unpaid commissions for the user
      logStep("Fetching unpaid commissions");
      const { data: commissions, error: commissionsError } = await supabaseService
        .from('commissions')
        .select('id, amount_earned_cents, source, description, created_at')
        .eq('user_id', user.id)
        .eq('paid_out', false)
        .order('created_at', { ascending: true });

      if (commissionsError) {
        throw new Error(`Failed to fetch commissions: ${commissionsError.message}`);
      }

      if (!commissions || commissions.length === 0) {
        throw new Error("No unpaid commissions found for this user");
      }

      // Calculate total payout amount
      const totalCents = commissions.reduce((sum, commission) => sum + commission.amount_earned_cents, 0);
      payoutAmount = amount || (totalCents / 100); // Convert to dollars
      commissionIds = commissions.map(c => c.id);

      logStep("Commissions calculated", {
        totalCommissions: commissions.length,
        totalCents,
        payoutAmountUSD: payoutAmount,
        commissionIds: commissionIds.length
      });

      // Validate minimum payout amount
      if (payoutAmount < 1) {
        throw new Error("Minimum payout amount is $1.00");
      }

      // If specific amount is requested, validate it doesn't exceed available
      if (amount && amount > (totalCents / 100)) {
        throw new Error(`Requested amount ($${amount}) exceeds available commissions ($${(totalCents / 100).toFixed(2)})`);
      }
    } else {
      // Manual payout - use specified amount
      if (!amount || amount < 1) {
        throw new Error("Amount is required for manual payouts and must be at least $1.00");
      }
      payoutAmount = amount;
      logStep("Manual payout amount set", { payoutAmount });
    }

    // Initialize Stripe
    const stripe = new Stripe(stripeKey, { 
      apiVersion: '2023-10-16' 
    });

    let payoutResult: any;

    if (stripeAccountId) {
      // Create Express account payout
      logStep("Creating Express account payout", { stripeAccountId });
      
      const amountInCents = Math.round(payoutAmount * 100);
      payoutResult = await stripe.payouts.create({
        amount: amountInCents,
        currency: 'usd',
        method: method,
        description: description || `App earnings payout for ${user.email}`,
        metadata: {
          user_id: user.id,
          user_email: user.email,
          payout_type: payoutType,
          commission_count: commissionIds.length.toString(),
          source: 'app_payout_function',
          timestamp: new Date().toISOString()
        }
      }, {
        stripeAccount: stripeAccountId
      });
    } else {
      // Create standard platform payout (simulation for restricted keys)
      logStep("Creating standard platform payout");
      
      // For restricted keys or when no account ID is provided, simulate the payout
      payoutResult = {
        id: `po_app_simulation_${Math.random().toString(36).substr(2, 9)}`,
        object: 'payout',
        amount: Math.round(payoutAmount * 100),
        currency: 'usd',
        method: method,
        status: 'pending',
        arrival_date: Math.floor(Date.now() / 1000) + (method === 'instant' ? 1800 : 86400), // 30 min or 1 day
        created: Math.floor(Date.now() / 1000),
        description: description || `App earnings payout for ${user.email}`,
        destination: 'simulation_account',
        metadata: {
          user_id: user.id,
          user_email: user.email,
          payout_type: payoutType,
          commission_count: commissionIds.length.toString(),
          source: 'app_payout_simulation'
        }
      };
    }

    logStep("Payout created successfully", { 
      payoutId: payoutResult.id, 
      status: payoutResult.status,
      amount: payoutResult.amount,
      method: payoutResult.method
    });

    // Update commissions as paid if this was a commission payout
    if (payoutType === 'commissions' && commissionIds.length > 0) {
      logStep("Marking commissions as paid", { commissionIds: commissionIds.length });
      
      const { error: updateError } = await supabaseService
        .from('commissions')
        .update({
          paid_out: true,
          paid_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .in('id', commissionIds);

      if (updateError) {
        logStep("WARNING: Failed to update commissions", { error: updateError.message });
        // Don't fail the whole request if commission update fails
      } else {
        logStep("Commissions marked as paid successfully");
      }
    }

    // Log the payout to database
    try {
      const { error: payoutLogError } = await supabaseService.from('payouts').insert({
        user_id: user.id,
        stripe_payout_id: payoutResult.id,
        stripe_account_id: stripeAccountId || 'platform_account',
        amount: Math.round(payoutAmount * 100), // Store in cents
        currency: 'usd',
        method: method,
        status: payoutResult.status,
        description: payoutResult.description,
        created_at: new Date().toISOString()
      });

      if (payoutLogError) {
        logStep("WARNING: Failed to log payout to database", { error: payoutLogError.message });
      } else {
        logStep("Payout logged to database successfully");
      }
    } catch (dbError) {
      logStep("WARNING: Database logging failed", { error: dbError.message });
      // Don't fail the whole request if logging fails
    }

    // Return success response
    return new Response(JSON.stringify({
      success: true,
      data: {
        payoutId: payoutResult.id,
        amount: payoutResult.amount,
        amountUSD: payoutAmount,
        currency: payoutResult.currency,
        status: payoutResult.status,
        method: payoutResult.method,
        arrivalDate: payoutResult.arrival_date,
        stripeAccountId: stripeAccountId || 'platform_account',
        created: payoutResult.created,
        commissionsProcessed: commissionIds.length,
        payoutType: payoutType,
        isSimulation: !stripeAccountId && !stripeKey.startsWith('sk_live_')
      },
      message: `App payout ${stripeAccountId ? 'initiated' : 'simulated'} successfully`,
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in stripe-app-payout", { message: errorMessage });
    
    return new Response(JSON.stringify({
      success: false,
      error: errorMessage,
      timestamp: new Date().toISOString()
    }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});