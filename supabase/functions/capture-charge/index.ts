
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CaptureChargeRequest {
  chargeId: string;
  amount?: number; // Optional: partial capture amount in cents
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: CaptureChargeRequest = await req.json();
    const { chargeId, amount } = body;
    
    console.log('Capturing charge:', chargeId, amount ? `for amount: ${amount}` : 'full amount');
    
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeKey) {
      throw new Error('Stripe secret key not configured');
    }
    
    const stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16' });
    
    // Capture the charge
    const captureParams: any = {};
    if (amount) {
      captureParams.amount = amount;
    }
    
    const charge = await stripe.charges.capture(chargeId, captureParams);
    
    console.log('Charge captured successfully:', charge.id);
    
    return new Response(JSON.stringify({
      success: true,
      data: {
        chargeId: charge.id,
        status: charge.status,
        amount: charge.amount,
        amountCaptured: charge.amount_captured,
        currency: charge.currency,
        captured: charge.captured,
        created: charge.created,
      },
      timestamp: new Date().toISOString(),
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('Charge Capture Error:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Failed to capture charge',
      timestamp: new Date().toISOString(),
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
