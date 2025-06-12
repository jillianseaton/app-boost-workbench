
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GetRequirementsRequest {
  accountId: string;
}

function getAccountState(account: any): string {
  const reqs = account.requirements;
  
  if (reqs.disabled_reason && reqs.disabled_reason.includes('rejected')) {
    return 'rejected';
  } else if (account.payouts_enabled && account.charges_enabled) {
    if (reqs.pending_verification && reqs.pending_verification.length > 0) {
      return 'pending enablement';
    } else if (!reqs.disabled_reason && (!reqs.currently_due || reqs.currently_due.length === 0)) {
      if (!reqs.eventually_due || reqs.eventually_due.length === 0) {
        return 'complete';
      } else {
        return 'enabled';
      }
    } else {
      return 'restricted';
    }
  } else if (!account.payouts_enabled && account.charges_enabled) {
    return 'restricted (payouts disabled)';
  } else if (!account.charges_enabled && account.payouts_enabled) {
    return 'restricted (charges disabled)';
  } else if (reqs.past_due && reqs.past_due.length > 0) {
    return 'restricted (past due)';
  } else if (reqs.pending_verification && reqs.pending_verification.length > 0) {
    return 'pending (disabled)';
  } else {
    return 'restricted';
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: GetRequirementsRequest = await req.json();
    const { accountId } = body;
    
    console.log('Getting account requirements for:', accountId);
    
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeKey) {
      throw new Error('Stripe secret key not configured');
    }
    
    const stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16' });
    
    const account = await stripe.accounts.retrieve(accountId);
    const accountState = getAccountState(account);
    
    console.log(`Account ${accountId} has state: ${accountState}`);
    
    return new Response(JSON.stringify({
      success: true,
      data: {
        accountId: account.id,
        state: accountState,
        chargesEnabled: account.charges_enabled,
        payoutsEnabled: account.payouts_enabled,
        detailsSubmitted: account.details_submitted,
        requirements: {
          currentlyDue: account.requirements?.currently_due || [],
          eventuallyDue: account.requirements?.eventually_due || [],
          pastDue: account.requirements?.past_due || [],
          pendingVerification: account.requirements?.pending_verification || [],
          disabledReason: account.requirements?.disabled_reason,
          currentDeadline: account.requirements?.current_deadline,
        },
      },
      timestamp: new Date().toISOString(),
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('Get Account Requirements Error:', error);
    
    let errorMessage = error.message;
    if (error.message.includes('No such account')) {
      errorMessage = 'Account not found. Please check the account ID.';
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
