
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface UpdatePaymentMethodConfigRequest {
  accountId: string;
  configurationId: string;
  paymentMethod: string;
  preference: 'on' | 'off';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: UpdatePaymentMethodConfigRequest = await req.json();
    const { accountId, configurationId, paymentMethod, preference } = body;
    
    console.log('Updating payment method configuration:', configurationId, paymentMethod, preference);
    
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeKey) {
      throw new Error('Stripe secret key not configured');
    }
    
    const stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16' });
    
    const updateData: any = {};
    updateData[paymentMethod] = {
      display_preference: {
        preference: preference,
      },
    };
    
    const configuration = await stripe.paymentMethodConfigurations.update(
      configurationId,
      updateData,
      { stripeAccount: accountId }
    );
    
    console.log('Payment method configuration updated successfully');
    
    return new Response(JSON.stringify({
      success: true,
      data: configuration,
      timestamp: new Date().toISOString(),
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('Update Payment Method Configuration Error:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Failed to update payment method configuration',
      timestamp: new Date().toISOString(),
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
