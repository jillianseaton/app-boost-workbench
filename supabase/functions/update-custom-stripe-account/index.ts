
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface UpdateAccountRequest {
  accountId: string;
  businessProfile?: {
    productDescription?: string;
    supportPhone?: string;
    url?: string;
  };
  externalAccount?: {
    accountHolderName: string;
    routingNumber: string;
    accountNumber: string;
  };
  tosAcceptance?: {
    userAgent: string;
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: UpdateAccountRequest = await req.json();
    const { accountId, businessProfile, externalAccount, tosAcceptance } = body;
    
    console.log('Updating custom Stripe account:', accountId, {
      hasBusinessProfile: !!businessProfile,
      hasExternalAccount: !!externalAccount,
      hasTosAcceptance: !!tosAcceptance
    });
    
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeKey) {
      throw new Error('Stripe secret key not configured');
    }
    
    const stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16' });
    
    // Prepare update data
    const updateData: any = {};
    
    if (businessProfile) {
      updateData.business_profile = {};
      if (businessProfile.productDescription) {
        updateData.business_profile.product_description = businessProfile.productDescription;
      }
      if (businessProfile.supportPhone) {
        updateData.business_profile.support_phone = businessProfile.supportPhone;
      }
      if (businessProfile.url) {
        updateData.business_profile.url = businessProfile.url;
      }
    }
    
    if (tosAcceptance) {
      updateData.tos_acceptance = {
        date: Math.floor(Date.now() / 1000),
        ip: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '127.0.0.1',
        user_agent: tosAcceptance.userAgent,
      };
    }
    
    // Update the account
    const updatedAccount = await stripe.accounts.update(accountId, updateData);
    
    console.log('Account updated successfully');
    
    // Add external account if provided
    if (externalAccount) {
      await stripe.accounts.createExternalAccount(accountId, {
        external_account: {
          object: 'bank_account',
          country: 'US',
          currency: 'usd',
          account_holder_name: externalAccount.accountHolderName,
          account_holder_type: 'individual',
          routing_number: externalAccount.routingNumber,
          account_number: externalAccount.accountNumber,
        },
      });
      console.log('External account added successfully');
    }
    
    // Get final account state
    const finalAccount = await stripe.accounts.retrieve(accountId);
    
    return new Response(JSON.stringify({
      success: true,
      data: {
        accountId: finalAccount.id,
        status: finalAccount.details_submitted ? 'active' : 'pending',
        chargesEnabled: finalAccount.charges_enabled,
        payoutsEnabled: finalAccount.payouts_enabled,
        requirementsCurrentlyDue: finalAccount.requirements?.currently_due || [],
        requirementsEventuallyDue: finalAccount.requirements?.eventually_due || [],
      },
      timestamp: new Date().toISOString(),
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('Update Custom Account Error:', error);
    
    let errorMessage = error.message;
    
    if (error.message.includes('No such account')) {
      errorMessage = 'Account not found. Please check the account ID.';
    } else if (error.message.includes('routing_number')) {
      errorMessage = 'Invalid routing number. Please check the 9-digit routing number.';
    } else if (error.message.includes('account_number')) {
      errorMessage = 'Invalid account number. Please check the bank account number.';
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
