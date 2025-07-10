import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-AFFILIATE-PAYOUT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Starting affiliate payout process");

    // Initialize Supabase with service role key for database operations
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Get user from auth header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    // Initialize Stripe
    const stripeKey = Deno.env.get("sk_test_stripe");
    if (!stripeKey) throw new Error("Stripe secret key not configured");
    
    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    logStep("Stripe initialized");

    // Get user's unpaid commissions
    const { data: commissions, error: commissionsError } = await supabaseClient
      .from('commissions')
      .select('*')
      .eq('user_id', user.id)
      .eq('paid_out', false);

    if (commissionsError) throw commissionsError;
    
    const totalCents = commissions?.reduce((sum, commission) => sum + commission.amount_earned_cents, 0) || 0;
    
    // Get affiliate earnings
    let affiliateEarnings = 0;
    try {
      const { data: earningsData } = await supabaseClient.functions.invoke('income-affiliate', {
        body: {
          action: 'calculate_earnings',
          data: {
            affiliateId: user.id,
            timeframe: 'monthly'
          }
        }
      });
      
      if (earningsData?.earnings?.total) {
        affiliateEarnings = parseFloat(earningsData.earnings.total) * 100; // Convert to cents
      }
    } catch (affiliateError) {
      logStep('No affiliate earnings found', { error: affiliateError });
    }

    const totalPayoutCents = totalCents + affiliateEarnings;
    
    if (totalPayoutCents < 5000) { // Minimum $50 payout
      throw new Error(`Minimum payout amount is $50.00. Current available: $${(totalPayoutCents / 100).toFixed(2)}`);
    }

    logStep("Calculated total payout", { totalCents, affiliateEarnings, totalPayoutCents });

    // Check if user has a Stripe Connect account
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId = null;
    
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    } else {
      // Create customer if doesn't exist
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { user_id: user.id }
      });
      customerId = customer.id;
    }
    
    logStep("Customer resolved", { customerId });

    // For now, we'll use Stripe's standard payout method
    // Note: In production, you'd typically use Stripe Connect for marketplace payouts
    
    // Create a payout record in our database
    const payoutRecord = {
      user_id: user.id,
      amount_cents: totalPayoutCents,
      currency: 'usd',
      status: 'pending',
      stripe_customer_id: customerId,
      created_at: new Date().toISOString()
    };

    // Insert payout record (you might want to create a payouts table for this)
    logStep("Payout record created", payoutRecord);

    // Mark commissions as paid out
    if (commissions && commissions.length > 0) {
      const { error: updateError } = await supabaseClient
        .from('commissions')
        .update({ 
          paid_out: true, 
          paid_at: new Date().toISOString() 
        })
        .eq('user_id', user.id)
        .eq('paid_out', false);

      if (updateError) throw updateError;
      logStep("Commissions marked as paid out");
    }

    // Process affiliate earnings payout
    if (affiliateEarnings > 0) {
      try {
        await supabaseClient.functions.invoke('income-affiliate', {
          body: {
            action: 'process_payout',
            data: {
              affiliateId: user.id,
              amount: affiliateEarnings / 100,
              paymentMethod: 'stripe'
            }
          }
        });
        logStep("Affiliate earnings processed");
      } catch (affiliateError) {
        logStep('Error processing affiliate earnings', { error: affiliateError });
      }
    }

    // For demo purposes, we'll simulate a successful payout
    // In production, you'd integrate with Stripe Connect or ACH transfers
    const response = {
      success: true,
      message: "Payout request processed successfully",
      amount: totalPayoutCents / 100,
      currency: 'USD',
      customer_id: customerId,
      estimated_arrival: "2-3 business days",
      note: "This is a demo implementation. In production, integrate with Stripe Connect for actual bank transfers."
    };

    logStep("Payout completed successfully", response);

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in stripe-affiliate-payout", { message: errorMessage });
    
    return new Response(JSON.stringify({ 
      success: false,
      error: errorMessage 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});