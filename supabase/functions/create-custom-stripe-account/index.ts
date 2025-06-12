
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CustomAccountRequest {
  businessProfile: {
    productDescription: string;
    supportPhone: string;
    url: string;
  };
  externalAccount: {
    accountHolderName: string;
    routingNumber: string;
    accountNumber: string;
  };
  tosAcceptance: {
    userAgent: string;
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: CustomAccountRequest = await req.json();
    const { businessProfile, externalAccount, tosAcceptance } = body;
    
    console.log('Creating custom Stripe account with data:', {
      businessProfile: businessProfile.productDescription.substring(0, 50) + '...',
      hasExternalAccount: !!externalAccount.accountNumber,
      hasTosAcceptance: !!tosAcceptance.userAgent
    });
    
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeKey) {
      throw new Error('Stripe secret key not configured');
    }
    
    const stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16' });
    
    // Step 1: Create the custom account
    const account = await stripe.accounts.create({
      country: 'US',
      type: 'custom',
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
    });
    
    console.log('Custom account created:', account.id);
    
    // Step 2: Update the account with business profile information
    await stripe.accounts.update(account.id, {
      business_profile: {
        product_description: businessProfile.productDescription,
        support_phone: businessProfile.supportPhone,
        url: businessProfile.url,
      },
      tos_acceptance: {
        date: Math.floor(Date.now() / 1000),
        ip: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '127.0.0.1',
        user_agent: tosAcceptance.userAgent,
      },
    });
    
    console.log('Account updated with business profile and ToS acceptance');
    
    // Step 3: Add external account (bank account)
    await stripe.accounts.createExternalAccount(account.id, {
      external_account: {
        object: 'bank_account',
        country: 'US',
        currency: 'usd',
        account_holder_name: externalAccount.accountHolderName,
        account_holder_type: 'individual', // or 'company' based on your needs
        routing_number: externalAccount.routingNumber,
        account_number: externalAccount.accountNumber,
      },
    });
    
    console.log('External account added successfully');
    
    // Step 4: Get updated account to check requirements
    const updatedAccount = await stripe.accounts.retrieve(account.id);
    
    return new Response(JSON.stringify({
      success: true,
      data: {
        accountId: updatedAccount.id,
        status: updatedAccount.details_submitted ? 'active' : 'pending',
        chargesEnabled: updatedAccount.charges_enabled,
        payoutsEnabled: updatedAccount.payouts_enabled,
        requirementsCurrentlyDue: updatedAccount.requirements?.currently_due || [],
        requirementsEventuallyDue: updatedAccount.requirements?.eventually_due || [],
      },
      timestamp: new Date().toISOString(),
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('Custom Account Creation Error:', error);
    
    let errorMessage = error.message;
    
    // Provide helpful error messages for common issues
    if (error.message.includes('routing_number')) {
      errorMessage = 'Invalid routing number. Please check the 9-digit routing number.';
    } else if (error.message.includes('account_number')) {
      errorMessage = 'Invalid account number. Please check the bank account number.';
    } else if (error.message.includes('tos_acceptance')) {
      errorMessage = 'Terms of service acceptance is required.';
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
