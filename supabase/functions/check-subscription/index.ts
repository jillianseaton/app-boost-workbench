import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    // Use service role key for database operations
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const stripeKey = Deno.env.get("sk_test_stripe");
    if (!stripeKey) {
      throw new Error("Stripe secret key not configured");
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header provided");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    
    const user = userData.user;
    if (!user?.email) {
      throw new Error("User not authenticated or email not available");
    }

    logStep("User authenticated", { userId: user.id, email: user.email });

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    
    // Check for existing Stripe customer
    const customers = await stripe.customers.list({ 
      email: user.email, 
      limit: 1 
    });
    
    if (customers.data.length === 0) {
      logStep("No customer found, updating unsubscribed state");
      
      // Update database with unsubscribed state
      await supabaseClient.from("subscriptions").upsert({
        user_id: user.id,
        plan: "none",
        status: "inactive",
        amount: 0,
        expiry_date: new Date().toISOString(),
      }, { onConflict: 'user_id' });

      return new Response(JSON.stringify({ 
        subscribed: false,
        plan: "none",
        status: "inactive"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customerId = customers.data[0].id;
    logStep("Found Stripe customer", { customerId });

    // Check for active subscriptions
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 1,
    });

    const hasActiveSub = subscriptions.data.length > 0;
    let subscriptionTier = "none";
    let subscriptionEnd = null;
    let subscriptionStatus = "inactive";

    if (hasActiveSub) {
      const subscription = subscriptions.data[0];
      subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();
      subscriptionStatus = "active";
      
      // Determine tier from price
      const priceId = subscription.items.data[0].price.id;
      const price = await stripe.prices.retrieve(priceId);
      const amount = price.unit_amount || 0;
      
      if (amount === 999) {
        subscriptionTier = "basic";
      } else if (amount === 1999) {
        subscriptionTier = "standard";
      } else if (amount === 2999) {
        subscriptionTier = "professional";
      } else if (amount === 4999) {
        subscriptionTier = "enterprise";
      }
      
      logStep("Active subscription found", { 
        subscriptionId: subscription.id, 
        endDate: subscriptionEnd,
        tier: subscriptionTier 
      });

      // Update database with subscription info
      await supabaseClient.from("subscriptions").upsert({
        user_id: user.id,
        plan: subscriptionTier,
        status: subscriptionStatus,
        amount: amount / 100, // Convert cents to dollars
        currency: "USD",
        start_date: new Date(subscription.current_period_start * 1000).toISOString(),
        expiry_date: subscriptionEnd,
      }, { onConflict: 'user_id' });
    } else {
      logStep("No active subscription found");
      
      // Update database with inactive state
      await supabaseClient.from("subscriptions").upsert({
        user_id: user.id,
        plan: "none",
        status: "inactive",
        amount: 0,
        expiry_date: new Date().toISOString(),
      }, { onConflict: 'user_id' });
    }

    logStep("Updated database with subscription info", { 
      subscribed: hasActiveSub, 
      subscriptionTier,
      status: subscriptionStatus 
    });

    return new Response(JSON.stringify({
      subscribed: hasActiveSub,
      plan: subscriptionTier,
      status: subscriptionStatus,
      expiry_date: subscriptionEnd
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in check-subscription", { message: errorMessage });
    
    return new Response(JSON.stringify({ 
      error: errorMessage,
      subscribed: false,
      plan: "none",
      status: "error"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});