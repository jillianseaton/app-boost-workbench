
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
    
    // Check if this is a restricted key
    if (stripeKey.startsWith('rk_')) {
      console.log('Detected restricted key - providing simulation response');
      
      // For restricted keys, provide a simulation response
      return new Response(JSON.stringify({
        success: true,
        data: {
          accountId: `acct_simulation_${Date.now()}`,
          onboardingUrl: `${req.headers.get('origin') || 'https://app-boost-workbench.lovable.app'}/ad-revenue?setup=simulation`,
          payoutsEnabled: false,
          chargesEnabled: false,
          detailsSubmitted: false,
          requirementsCurrentlyDue: ['external_account', 'tos_acceptance'],
        },
        message: 'Account simulation created. For live Express accounts, you need a full Stripe secret key with Connect permissions.',
        simulation: true,
        note: 'This is a simulation. To create real Express accounts, please use a full Stripe secret key in your Stripe dashboard.',
        timestamp: new Date().toISOString(),
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // For full secret keys, create actual Express account
    try {
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
      
    } catch (stripeError: any) {
      console.error('Stripe API Error:', stripeError);
      
      // Handle specific permission errors
      if (stripeError.message?.includes('permissions')) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Insufficient Stripe API permissions. Please use a full Stripe secret key with Connect permissions, or contact support.',
          details: 'Your current API key does not have the required permissions to create Express accounts. Please check your Stripe dashboard settings.',
          helpUrl: 'https://dashboard.stripe.com/apikeys',
          timestamp: new Date().toISOString(),
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      throw stripeError;
    }
    
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
