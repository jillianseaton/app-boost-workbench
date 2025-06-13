
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
    
    console.log('Getting comprehensive account status for:', accountId);
    
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeKey) {
      throw new Error('Stripe secret key not configured');
    }
    
    const stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16' });
    
    // Retrieve account with comprehensive information
    const account = await stripe.accounts.retrieve(accountId);
    const accountState = getAccountState(account);
    
    console.log(`Account ${accountId} has state: ${accountState}`);
    console.log('Requirements currently due:', account.requirements?.currently_due || []);
    console.log('Charges enabled:', account.charges_enabled);
    console.log('Payouts enabled:', account.payouts_enabled);
    console.log('Details submitted:', account.details_submitted);
    
    // Additional monitoring information
    const monitoringData = {
      accountId: account.id,
      state: accountState,
      chargesEnabled: account.charges_enabled,
      payoutsEnabled: account.payouts_enabled,
      detailsSubmitted: account.details_submitted,
      accountType: account.type,
      country: account.country,
      defaultCurrency: account.default_currency,
      businessType: account.business_type,
      created: account.created,
      email: account.email,
      
      // Capabilities status
      capabilities: {
        cardPayments: account.capabilities?.card_payments,
        transfers: account.capabilities?.transfers,
        legacyPayments: account.capabilities?.legacy_payments,
      },
      
      // Business profile
      businessProfile: account.business_profile ? {
        name: account.business_profile.name,
        productDescription: account.business_profile.product_description,
        supportEmail: account.business_profile.support_email,
        supportPhone: account.business_profile.support_phone,
        url: account.business_profile.url,
        mcc: account.business_profile.mcc,
      } : null,
      
      // Requirements details
      requirements: {
        currentlyDue: account.requirements?.currently_due || [],
        eventuallyDue: account.requirements?.eventually_due || [],
        pastDue: account.requirements?.past_due || [],
        pendingVerification: account.requirements?.pending_verification || [],
        disabledReason: account.requirements?.disabled_reason,
        currentDeadline: account.requirements?.current_deadline,
        alternativelyDue: account.requirements?.alternatively_due || [],
        errors: account.requirements?.errors || [],
      },
      
      // External accounts (bank accounts)
      externalAccounts: account.external_accounts?.data?.length || 0,
      hasExternalAccount: (account.external_accounts?.data?.length || 0) > 0,
      
      // Settings
      settings: account.settings ? {
        payouts: account.settings.payouts,
        payments: account.settings.payments,
        branding: account.settings.branding,
      } : null,
      
      // TOS acceptance
      tosAcceptance: account.tos_acceptance ? {
        date: account.tos_acceptance.date,
        ip: account.tos_acceptance.ip,
        userAgent: account.tos_acceptance.user_agent,
      } : null,
    };
    
    return new Response(JSON.stringify({
      success: true,
      data: monitoringData,
      message: `Account status retrieved: ${accountState}`,
      timestamp: new Date().toISOString(),
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('Get Account Status Error:', error);
    
    let errorMessage = error.message;
    if (error.message.includes('No such account')) {
      errorMessage = 'Account not found. Please check the account ID.';
    } else if (error.message.includes('permissions')) {
      errorMessage = 'Insufficient permissions to access account information.';
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
