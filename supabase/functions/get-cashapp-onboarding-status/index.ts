
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface OnboardingStatusRequest {
  userId: string;
  connectAccountId?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: OnboardingStatusRequest = await req.json();
    console.log('Checking Cash App onboarding status for user:', body.userId);
    
    const { userId, connectAccountId } = body;
    
    if (!userId) {
      throw new Error('User ID is required');
    }
    
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeKey) {
      throw new Error('Stripe secret key not configured');
    }
    
    const stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16' });
    
    let accountStatus = {
      onboarded: false,
      payoutsEnabled: false,
      cashAppEnabled: false,
      requiresAction: false,
      connectAccountId: connectAccountId || null,
    };

    // If we have a connect account ID, check its status
    if (connectAccountId) {
      try {
        console.log('Checking connect account status:', connectAccountId);
        const account = await stripe.accounts.retrieve(connectAccountId);
        
        accountStatus.onboarded = account.details_submitted || false;
        accountStatus.payoutsEnabled = account.payouts_enabled || false;
        accountStatus.cashAppEnabled = account.capabilities?.cashapp_payments === 'active';
        accountStatus.requiresAction = !account.charges_enabled || !account.payouts_enabled;
        
        console.log('Connect account status retrieved:', {
          detailsSubmitted: account.details_submitted,
          payoutsEnabled: account.payouts_enabled,
          cashAppCapability: account.capabilities?.cashapp_payments,
          chargesEnabled: account.charges_enabled,
        });
      } catch (error) {
        console.error('Error retrieving connect account:', error);
        // Account might not exist or be accessible, treat as not onboarded
        accountStatus.onboarded = false;
      }
    }
    
    return new Response(JSON.stringify({
      success: true,
      data: accountStatus,
      timestamp: new Date().toISOString(),
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('Get Cash App Onboarding Status Error:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Failed to check onboarding status',
      timestamp: new Date().toISOString(),
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
