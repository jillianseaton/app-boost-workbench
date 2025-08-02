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
  console.log(`[STRIPE-EXPRESS-PAYOUT] ${step}${detailsStr}`);
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

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
    const body = await req.json();
    const { 
      amount, 
      currency = 'usd', 
      stripeAccountId, 
      method = 'instant',
      description 
    } = body;

    // Validate required parameters
    if (!amount || amount <= 0) {
      throw new Error("Valid amount is required");
    }
    
    if (!stripeAccountId) {
      throw new Error("Stripe Express account ID is required");
    }

    // Convert amount to cents if needed (assuming amount is in dollars)
    const amountInCents = Math.round(amount * 100);
    
    if (amountInCents < 100) { // Minimum $1.00
      throw new Error("Minimum payout amount is $1.00");
    }

    logStep("Request validated", { 
      amount: amountInCents, 
      currency, 
      stripeAccountId, 
      method 
    });

    // Initialize Stripe
    const stripe = new Stripe(stripeKey, { 
      apiVersion: '2023-10-16' 
    });

    // Create payout to Express account
    logStep("Creating payout to Express account");
    const payout = await stripe.payouts.create({
      amount: amountInCents,
      currency: currency.toLowerCase(),
      method: method, // 'instant' or 'standard'
      description: description || `Payout for user ${user.email}`,
      metadata: {
        user_id: user.id,
        user_email: user.email,
        source: 'lovable_express_payout',
        timestamp: new Date().toISOString()
      }
    }, {
      stripeAccount: stripeAccountId // This targets the specific Express account
    });

    logStep("Payout created successfully", { 
      payoutId: payout.id, 
      status: payout.status,
      arrivalDate: payout.arrival_date 
    });

    // Log the payout to Supabase for record keeping
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    try {
      await supabaseService.from('payouts').insert({
        user_id: user.id,
        stripe_payout_id: payout.id,
        stripe_account_id: stripeAccountId,
        amount: amountInCents,
        currency: currency,
        method: method,
        status: payout.status,
        description: payout.description,
        created_at: new Date().toISOString()
      });
      logStep("Payout logged to database");
    } catch (dbError) {
      logStep("Database logging failed", { error: dbError.message });
      // Don't fail the whole request if logging fails
    }

    // Return success response
    return new Response(JSON.stringify({
      success: true,
      data: {
        payoutId: payout.id,
        amount: payout.amount,
        currency: payout.currency,
        status: payout.status,
        method: payout.method,
        arrivalDate: payout.arrival_date,
        stripeAccountId: stripeAccountId,
        created: payout.created
      },
      message: "Payout created successfully",
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in stripe-express-payout", { message: errorMessage });
    
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
