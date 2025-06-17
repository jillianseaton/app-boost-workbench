
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AdPaymentRequest {
  partnerId: string;
  amount: number; // Amount in cents
  campaign: string;
  description: string;
  connectAccountId: string;
  metadata?: Record<string, any>;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: AdPaymentRequest = await req.json();
    const { partnerId, amount, campaign, description, connectAccountId, metadata } = body;
    
    console.log('Processing ad revenue payment:', { partnerId, amount, campaign, connectAccountId });
    
    if (!amount || amount < 50) { // Minimum $0.50
      throw new Error('Minimum payment amount is $0.50');
    }
    
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeKey) {
      throw new Error('Stripe secret key not configured');
    }
    
    const stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16' });
    
    // Create a transfer to the Connect account
    // In a real implementation, this would come from the advertising partner's payment
    // For demo purposes, we'll simulate receiving a payment and transferring it
    
    // First, create a payment intent on behalf of the advertising partner
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount),
      currency: 'usd',
      description: `Ad revenue: ${description}`,
      metadata: {
        partner_id: partnerId,
        campaign,
        type: 'ad_revenue',
        ...metadata,
      },
      // In production, this would be funded by the advertising partner
      confirm: true,
      payment_method: 'pm_card_visa', // Test payment method
      return_url: `${req.headers.get('origin') || 'https://app-boost-workbench.lovable.app'}/ad-revenue`,
    });
    
    // Transfer the funds to the Connect account
    const transfer = await stripe.transfers.create({
      amount: Math.round(amount * 0.97), // 3% platform fee
      currency: 'usd',
      destination: connectAccountId,
      description: `Ad revenue from ${partnerId}: ${campaign}`,
      metadata: {
        partner_id: partnerId,
        campaign,
        original_amount: amount.toString(),
        platform_fee: Math.round(amount * 0.03).toString(),
      },
    });
    
    console.log('Ad revenue payment processed:', {
      paymentIntentId: paymentIntent.id,
      transferId: transfer.id,
      amount: transfer.amount,
    });
    
    return new Response(JSON.stringify({
      success: true,
      data: {
        paymentId: paymentIntent.id,
        transferId: transfer.id,
        amount: transfer.amount,
        platformFee: Math.round(amount * 0.03),
        netAmount: transfer.amount,
      },
      message: 'Ad revenue payment processed successfully',
      timestamp: new Date().toISOString(),
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('Ad Revenue Payment Error:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Failed to process ad revenue payment',
      timestamp: new Date().toISOString(),
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
