
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TransferRequest {
  amount: number; // Amount in cents
  currency: string;
  destination: string; // Connected account ID
  transferGroup?: string;
  description?: string;
  userId?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: TransferRequest = await req.json();
    const { amount, currency, destination, transferGroup, description, userId } = body;
    
    console.log('Creating Stripe transfer:', { amount, currency, destination, transferGroup });
    
    if (!amount || amount < 50) { // Minimum $0.50
      throw new Error('Minimum transfer amount is $0.50');
    }
    
    if (!destination) {
      throw new Error('Destination account ID required');
    }
    
    // Use your live secret key
    const stripeKey = "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";
    const stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16' });
    
    // Create transfer (equivalent to the Java code you provided)
    const transfer = await stripe.transfers.create({
      amount: amount,
      currency: currency.toLowerCase(),
      destination: destination,
      transfer_group: transferGroup,
      description: description || `Transfer for ${userId || 'user'}`,
      metadata: {
        user_id: userId || 'unknown',
        created_via: 'lovable_integration'
      }
    });
    
    console.log('Stripe transfer created:', transfer.id);
    
    return new Response(JSON.stringify({
      success: true,
      data: {
        transferId: transfer.id,
        amount: transfer.amount,
        currency: transfer.currency,
        destination: transfer.destination,
        status: transfer.status || 'pending',
        created: transfer.created,
        transferGroup: transfer.transfer_group
      },
      timestamp: new Date().toISOString(),
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('Stripe Transfer Error:', error);
    
    let errorMessage = error.message || 'Transfer creation failed';
    
    // Handle common Stripe errors
    if (error.type === 'StripeInvalidRequestError') {
      if (error.code === 'account_invalid') {
        errorMessage = 'Invalid destination account. Please check the account ID.';
      } else if (error.code === 'balance_insufficient') {
        errorMessage = 'Insufficient balance to complete this transfer.';
      }
    }
    
    return new Response(JSON.stringify({
      success: false,
      error: errorMessage,
      timestamp: new Date().toISOString(),
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
