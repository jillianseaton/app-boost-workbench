import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { tier } = await req.json();
    
    if (!tier) {
      throw new Error("Subscription tier is required");
    }

    // Initialize Stripe
    const stripeKey = Deno.env.get("sk_test_stripe");
    if (!stripeKey) {
      throw new Error("Stripe secret key not configured");
    }

    const stripe = new Stripe(stripeKey, {
      apiVersion: "2023-10-16",
    });

    // Create Supabase client for authentication
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // Get authenticated user
    const authHeader = req.headers.get("Authorization");
    let user = null;
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data } = await supabaseClient.auth.getUser(token);
      user = data.user;
    }

    // Define tier pricing and details
    const tierConfig = {
      basic: {
        name: "Basic Plan",
        price: 999, // $9.99 in cents
        description: "Perfect for individuals starting to earn commissions"
      },
      standard: {
        name: "Standard Plan", 
        price: 1999, // $19.99 in cents
        description: "Great for serious commission earners"
      },
      professional: {
        name: "Professional Plan",
        price: 2999, // $29.99 in cents
        description: "Ideal for professional commission earners and teams"
      },
      enterprise: {
        name: "Enterprise Plan",
        price: 4999, // $49.99 in cents
        description: "For large organizations maximizing commission revenue"
      }
    };

    const selectedTier = tierConfig[tier as keyof typeof tierConfig];
    if (!selectedTier) {
      throw new Error("Invalid subscription tier");
    }

    // Check for existing customer
    let customerId;
    if (user?.email) {
      const customers = await stripe.customers.list({ 
        email: user.email, 
        limit: 1 
      });
      
      if (customers.data.length > 0) {
        customerId = customers.data[0].id;
      }
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user?.email || undefined,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: selectedTier.name,
              description: selectedTier.description,
            },
            unit_amount: selectedTier.price,
            recurring: {
              interval: "month",
            },
          },
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${req.headers.get("origin")}/subscription-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/?cancelled=true`,
      allow_promotion_codes: true,
      billing_address_collection: "required",
      metadata: {
        tier: tier,
        user_id: user?.id || "guest",
      },
    });

    return new Response(
      JSON.stringify({ url: session.url }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error creating subscription checkout:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Failed to create checkout session" 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});