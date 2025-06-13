
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PrefilledAccountRequest {
  email: string;
  country: string;
  businessName?: string;
  productDescription?: string;
  supportEmail?: string;
  supportPhone?: string;
  websiteUrl?: string;
  merchantCategoryCode?: string;
  firstName?: string;
  lastName?: string;
  companyName?: string;
  taxId?: string;
  businessType: 'individual' | 'company';
  userId?: string;
  platformSource?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: PrefilledAccountRequest = await req.json();
    const { 
      email, 
      country, 
      businessName,
      productDescription,
      supportEmail,
      supportPhone,
      websiteUrl,
      merchantCategoryCode,
      firstName,
      lastName,
      companyName,
      taxId,
      businessType,
      userId,
      platformSource
    } = body;
    
    console.log('Creating Express account with prefilled data:', {
      email,
      country,
      businessType,
      hasBusinessName: !!businessName,
      hasProductDescription: !!productDescription
    });
    
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeKey) {
      throw new Error('Stripe secret key not configured');
    }
    
    const stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16' });
    
    // Prepare account data
    const accountData: any = {
      type: 'express',
      country,
      email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
    };

    // Add business profile if provided
    if (businessName || productDescription || supportEmail || supportPhone || websiteUrl) {
      accountData.business_profile = {};
      if (businessName) accountData.business_profile.name = businessName;
      if (productDescription) accountData.business_profile.product_description = productDescription;
      if (supportEmail) accountData.business_profile.support_email = supportEmail;
      if (supportPhone) accountData.business_profile.support_phone = supportPhone;
      if (websiteUrl) accountData.business_profile.url = websiteUrl;
      if (merchantCategoryCode) accountData.business_profile.mcc = merchantCategoryCode;
    }

    // Add individual information for sole proprietors
    if (businessType === 'individual' && (firstName || lastName)) {
      accountData.individual = {};
      if (firstName) accountData.individual.first_name = firstName;
      if (lastName) accountData.individual.last_name = lastName;
      if (email) accountData.individual.email = email;
    }

    // Add company information for companies
    if (businessType === 'company' && (companyName || taxId)) {
      accountData.company = {};
      if (companyName) accountData.company.name = companyName;
      if (taxId) accountData.company.tax_id = taxId;
    }

    // Add metadata
    if (userId || platformSource) {
      accountData.metadata = {};
      if (userId) accountData.metadata.user_id = userId;
      if (platformSource) accountData.metadata.platform_source = platformSource;
      accountData.metadata.account_type = 'express';
      accountData.metadata.created_via = 'prefilled_api';
    }
    
    // Create the Express account
    const account = await stripe.accounts.create(accountData);
    
    console.log('Express account created:', account.id);
    
    // Create account link for onboarding if needed
    let accountLinkUrl;
    if (!account.details_submitted) {
      const accountLink = await stripe.accountLinks.create({
        account: account.id,
        refresh_url: `${req.headers.get('origin')}/stripe-onboarding?refresh=true&account=${account.id}`,
        return_url: `${req.headers.get('origin')}/stripe-onboarding?success=true&account=${account.id}`,
        type: 'account_onboarding',
      });
      accountLinkUrl = accountLink.url;
    }
    
    return new Response(JSON.stringify({
      success: true,
      data: {
        accountId: account.id,
        onboardingRequired: !account.details_submitted,
        chargesEnabled: account.charges_enabled,
        payoutsEnabled: account.payouts_enabled,
        requirementsCurrentlyDue: account.requirements?.currently_due || [],
        detailsSubmitted: account.details_submitted,
        accountLinkUrl,
      },
      timestamp: new Date().toISOString(),
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('Express Account Creation Error:', error);
    
    let errorMessage = error.message;
    
    if (error.message.includes('email')) {
      errorMessage = 'Invalid email address provided.';
    } else if (error.message.includes('tax_id')) {
      errorMessage = 'Invalid tax ID format. Please check the tax identification number.';
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
