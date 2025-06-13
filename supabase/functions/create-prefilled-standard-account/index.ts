
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
  userId?: string;
  platformSource?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: PrefilledAccountRequest = await req.json();
    const { email, country, businessName, userId, platformSource } = body;
    
    console.log('Creating Standard account with prefilled data:', {
      email,
      country,
      hasBusinessName: !!businessName
    });
    
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeKey) {
      throw new Error('Stripe secret key not configured');
    }
    
    const stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16' });
    
    // For Standard accounts, we create an OAuth link
    // Note: This would typically redirect to Stripe's OAuth flow
    // For demo purposes, we'll create a simplified version
    
    const accountData: any = {
      type: 'standard',
      email,
      metadata: {
        user_id: userId || 'standard_user',
        platform_source: platformSource || 'web',
        account_type: 'standard',
        created_via: 'prefilled_api',
      },
    };

    if (businessName) {
      accountData.business_profile = {
        name: businessName,
      };
    }
    
    // Create the Standard account
    const account = await stripe.accounts.create(accountData);
    
    console.log('Standard account created:', account.id);
    
    // For Standard accounts, users typically need to complete OAuth flow
    // Create account link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${req.headers.get('origin')}/stripe-onboarding?refresh=true&account=${account.id}`,
      return_url: `${req.headers.get('origin')}/stripe-onboarding?success=true&account=${account.id}`,
      type: 'account_onboarding',
    });
    
    return new Response(JSON.stringify({
      success: true,
      data: {
        accountId: account.id,
        onboardingRequired: true, // Standard accounts always need OAuth completion
        chargesEnabled: account.charges_enabled,
        payoutsEnabled: account.payouts_enabled,
        requirementsCurrentlyDue: account.requirements?.currently_due || [],
        detailsSubmitted: account.details_submitted,
        accountLinkUrl: accountLink.url,
      },
      timestamp: new Date().toISOString(),
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('Standard Account Creation Error:', error);
    
    let errorMessage = error.message;
    
    if (error.message.includes('email')) {
      errorMessage = 'Invalid email address provided.';
    } else if (error.message.includes('OAuth')) {
      errorMessage = 'Standard account requires OAuth setup. Please contact support.';
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
