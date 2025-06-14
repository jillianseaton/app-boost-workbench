
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmbeddedCheckoutRequest {
  priceId: string;
  mode?: 'payment' | 'subscription';
  ui_mode?: 'embedded' | 'hosted';
  return_url: string;
  customerEmail?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: EmbeddedCheckoutRequest = await req.json();
    const { priceId, mode = 'subscription', ui_mode = 'embedded', return_url, customerEmail } = body;
    
    console.log('Create Embedded Checkout - Request:', { priceId, mode, ui_mode, return_url, customerEmail });
    
    if (!priceId) {
      throw new Error('Price ID is required');
    }
    
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeKey) {
      throw new Error('Stripe secret key not configured');
    }
    
    const stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16' });
    
    // Get user if authenticated
    let customerId;
    let userEmail = customerEmail;
    
    const authHeader = req.headers.get('Authorization');
    if (authHeader) {
      try {
        const supabaseClient = createClient(
          Deno.env.get('SUPABASE_URL') ?? '',
          Deno.env.get('SUPABASE_ANON_KEY') ?? ''
        );
        
        const token = authHeader.replace('Bearer ', '');
        const { data: userData } = await supabaseClient.auth.getUser(token);
        
        if (userData.user?.email) {
          userEmail = userData.user.email;
          
          // Check if customer exists
          const customers = await stripe.customers.list({
            email: userEmail,
            limit: 1,
          });
          
          if (customers.data.length > 0) {
            customerId = customers.data[0].id;
          } else {
            const customer = await stripe.customers.create({
              email: userEmail,
            });
            customerId = customer.id;
          }
        }
      } catch (error) {
        console.log('Authentication failed, proceeding without customer:', error);
      }
    }
    
    const sessionConfig: any = {
      ui_mode: ui_mode,
      mode: mode,
      return_url: return_url,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
    };
    
    if (customerId) {
      sessionConfig.customer = customerId;
    } else if (userEmail) {
      sessionConfig.customer_email = userEmail;
    }
    
    const session = await stripe.checkout.sessions.create(sessionConfig);
    
    console.log('Embedded Checkout Session created:', session.id);
    
    return new Response(JSON.stringify({
      success: true,
      data: {
        clientSecret: session.client_secret,
        sessionId: session.id,
      },
      timestamp: new Date().toISOString(),
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('Embedded Checkout Creation Error:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
