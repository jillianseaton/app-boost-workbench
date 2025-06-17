
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CreateAdRevenueAccountRequest {
  email: string;
  businessName: string;
  businessType: 'individual' | 'company';
  country: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: CreateAdRevenueAccountRequest = await req.json();
    const { email, businessName, businessType, country } = body;
    
    console.log('Creating ad revenue Express account:', { email, businessName, businessType, country });
    
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeKey) {
      throw new Error('Stripe secret key not configured');
    }
    
    const stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16' });
    
    // Create Express account for ad revenue collection
    const account = await stripe.accounts.create({
      type: 'express',
      country: country || 'US',
      email: email,
      
      // Business profile for ad revenue
      business_profile: {
        name: businessName,
        product_description: 'Digital advertising revenue collection',
        support_email: email,
        mcc: '7372', // Business services - advertising
      },
      
      // Enable required capabilities
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
        tax_reporting_us_1099_k: { requested: true },
      },
      
      // Business type
      business_type: businessType,
      
      // Metadata for tracking
      metadata: {
        purpose: 'ad_revenue_collection',
        created_via: 'ad_revenue_api',
        business_type: businessType,
      },
    });
    
    console.log('Ad revenue account created:', account.id);
    
    // Create account link for onboarding if needed
    let onboardingUrl;
    if (!account.details_submitted) {
      const accountLink = await stripe.accountLinks.create({
        account: account.id,
        refresh_url: `${req.headers.get('origin') || 'https://app-boost-workbench.lovable.app'}/ad-revenue?refresh=true`,
        return_url: `${req.headers.get('origin') || 'https://app-boost-workbench.lovable.app'}/ad-revenue?success=true`,
        type: 'account_onboarding',
        collection_options: {
          fields: 'eventually_due',
        },
      });
      
      onboardingUrl = accountLink.url;
      console.log('Onboarding link created:', onboardingUrl);
    }
    
    return new Response(JSON.stringify({
      success: true,
      data: {
        accountId: account.id,
        onboardingUrl,
        payoutsEnabled: account.payouts_enabled,
        chargesEnabled: account.charges_enabled,
        detailsSubmitted: account.details_submitted,
        requirementsCurrentlyDue: account.requirements?.currently_due || [],
      },
      message: account.details_submitted 
        ? 'Ad revenue account created and ready to receive payments'
        : 'Ad revenue account created, onboarding required',
      timestamp: new Date().toISOString(),
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('Ad Revenue Account Creation Error:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Failed to create ad revenue account',
      timestamp: new Date().toISOString(),
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
