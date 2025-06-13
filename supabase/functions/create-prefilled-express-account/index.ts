
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
  // Address fields
  businessAddress?: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  personalAddress?: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  dateOfBirth?: {
    day: number;
    month: number;
    year: number;
  };
  // Bank account information
  bankAccount?: {
    accountHolderName: string;
    accountHolderType: 'individual' | 'company';
    routingNumber: string;
    accountNumber: string;
    currency: string;
  };
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
      platformSource,
      businessAddress,
      personalAddress,
      dateOfBirth,
      bankAccount
    } = body;
    
    console.log('Creating Express account with prefilled data:', {
      email,
      country,
      businessType,
      hasBusinessName: !!businessName,
      hasProductDescription: !!productDescription,
      hasBankAccount: !!bankAccount
    });
    
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeKey) {
      throw new Error('Stripe secret key not configured');
    }
    
    const stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16' });
    
    // Prepare account data with Jillian Seaton's specific information as default
    const accountData: any = {
      type: 'express',
      country: country || 'US',
      email: email || 'jillianseaton1303@gmail.com',
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
    };

    // Add business profile with Jillian's defaults
    accountData.business_profile = {
      name: businessName || 'Jillian Seaton',
      product_description: productDescription || 'Software development services',
      support_email: supportEmail || 'jillianseaton1303@gmail.com',
      support_phone: supportPhone || '+1-937-287-1973',
      url: websiteUrl || 'https://app-boost-workbench.lovable.app/',
      mcc: merchantCategoryCode || '5734', // Computer software and data processing services
    };

    // Add individual information with Jillian's defaults
    accountData.individual = {
      first_name: firstName || 'Jillian',
      last_name: lastName || 'Seaton',
      email: email || 'jillianseaton1303@gmail.com',
      phone: supportPhone || '+1-937-287-1973',
    };

    // Add date of birth if provided or use Jillian's default
    if (dateOfBirth || !dateOfBirth) {
      accountData.individual.dob = dateOfBirth || {
        day: 16,
        month: 8,
        year: 1985,
      };
    }

    // Add personal address with Jillian's defaults
    if (personalAddress || businessType === 'individual') {
      accountData.individual.address = personalAddress || {
        line1: '301 Troy St',
        city: 'Dayton',
        state: 'OH',
        postal_code: '45404',
        country: 'US',
      };
    }

    // Add company information if business type is company or if Jillian's defaults
    if (businessType === 'company' || (!businessType && (companyName || taxId))) {
      accountData.company = {
        name: companyName || 'Jillian Seaton',
        phone: supportPhone || '+1-937-287-1973',
      };

      if (taxId) {
        accountData.company.tax_id = taxId;
      } else {
        accountData.company.tax_id = '12-3456789'; // Jillian's default (test EIN)
      }

      if (businessAddress) {
        accountData.company.address = {
          line1: businessAddress.line1,
          line2: businessAddress.line2,
          city: businessAddress.city,
          state: businessAddress.state,
          postal_code: businessAddress.postalCode,
          country: businessAddress.country,
        };
      } else {
        // Use Jillian's default business address
        accountData.company.address = {
          line1: '301 Troy St',
          city: 'Dayton',
          state: 'OH',
          postal_code: '45404',
          country: 'US',
        };
      }
    }

    // Add external account (bank account) with Jillian's defaults if provided
    if (bankAccount) {
      accountData.external_account = {
        object: 'bank_account',
        country: bankAccount.currency === 'usd' ? 'US' : country,
        currency: bankAccount.currency,
        account_holder_name: bankAccount.accountHolderName,
        account_holder_type: bankAccount.accountHolderType,
        routing_number: bankAccount.routingNumber,
        account_number: bankAccount.accountNumber,
      };
    } else {
      // Use Jillian's default bank account (test data)
      accountData.external_account = {
        object: 'bank_account',
        country: 'US',
        currency: 'usd',
        account_holder_name: 'Jillian Seaton',
        account_holder_type: 'individual',
        routing_number: '110000000', // Test routing number for development
        account_number: '000123456789', // Test account number for development
      };
    }

    // Add metadata with Jillian's platform defaults
    accountData.metadata = {
      user_id: userId || 'jillian_seaton_001',
      platform_source: platformSource || 'app_boost_workbench',
      account_type: 'express',
      created_via: 'prefilled_api',
      business_type: businessType || 'sole_proprietorship',
      onboarding_source: 'prefilled_api',
      created_date: new Date().toISOString(),
    };
    
    // Create the Express account
    const account = await stripe.accounts.create(accountData);
    
    console.log('Express account created for Jillian Seaton:', account.id);
    
    // Create account link for onboarding if needed
    let accountLinkUrl;
    if (!account.details_submitted) {
      const accountLink = await stripe.accountLinks.create({
        account: account.id,
        refresh_url: `${req.headers.get('origin') || 'https://app-boost-workbench.lovable.app'}/stripe-onboarding?refresh=true&account=${account.id}`,
        return_url: `${req.headers.get('origin') || 'https://app-boost-workbench.lovable.app'}/stripe-onboarding?success=true&account=${account.id}`,
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
        accountType: 'express',
        businessName: accountData.business_profile.name,
        email: accountData.email,
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
    } else if (error.message.includes('routing_number')) {
      errorMessage = 'Invalid bank routing number. Please verify the routing number.';
    } else if (error.message.includes('account_number')) {
      errorMessage = 'Invalid bank account number. Please verify the account number.';
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
