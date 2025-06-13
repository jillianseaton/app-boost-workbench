
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GetPaymentMethodConfigRequest {
  accountId: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: GetPaymentMethodConfigRequest = await req.json();
    const { accountId } = body;
    
    console.log('Getting payment method configurations for:', accountId);
    
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeKey) {
      throw new Error('Stripe secret key not configured');
    }
    
    const stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16' });
    
    const configurations = await stripe.paymentMethodConfigurations.list(
      {},
      { stripeAccount: accountId }
    );
    
    console.log('Payment method configurations retrieved:', configurations.data.length);
    
    return new Response(JSON.stringify({
      success: true,
      data: configurations.data,
      timestamp: new Date().toISOString(),
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('Get Payment Method Configurations Error:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Failed to get payment method configurations',
      timestamp: new Date().toISOString(),
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
