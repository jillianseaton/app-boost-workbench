
import { supabase } from '@/integrations/supabase/client';

export interface CustomAccountOnboardingRequest {
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

export interface CustomAccountOnboardingResponse {
  success: boolean;
  data?: {
    accountId: string;
    status: string;
    chargesEnabled: boolean;
    payoutsEnabled: boolean;
    requirementsCurrentlyDue: string[];
    requirementsEventuallyDue: string[];
  };
  error?: string;
  timestamp: string;
}

export interface AccountRequirementsResponse {
  success: boolean;
  data?: {
    accountId: string;
    state: string;
    chargesEnabled: boolean;
    payoutsEnabled: boolean;
    detailsSubmitted: boolean;
    requirements: {
      currentlyDue: string[];
      eventuallyDue: string[];
      pastDue: string[];
      pendingVerification: string[];
      disabledReason?: string;
      currentDeadline?: number;
    };
  };
  error?: string;
  timestamp: string;
}

class StripeCustomService {
  async createAndOnboardCustomAccount(request: CustomAccountOnboardingRequest): Promise<CustomAccountOnboardingResponse> {
    try {
      console.log('Creating custom Stripe account:', request);
      
      const { data, error } = await supabase.functions.invoke('create-custom-stripe-account', {
        body: request,
      });

      if (error) {
        throw new Error(error.message || 'Custom account creation failed');
      }

      return data;
    } catch (error) {
      console.error('Custom Stripe Account Error:', error);
      throw error;
    }
  }

  async updateCustomAccount(accountId: string, updates: Partial<CustomAccountOnboardingRequest>): Promise<CustomAccountOnboardingResponse> {
    try {
      console.log('Updating custom Stripe account:', accountId, updates);
      
      const { data, error } = await supabase.functions.invoke('update-custom-stripe-account', {
        body: { accountId, ...updates },
      });

      if (error) {
        throw new Error(error.message || 'Custom account update failed');
      }

      return data;
    } catch (error) {
      console.error('Custom Account Update Error:', error);
      throw error;
    }
  }

  async getAccountRequirements(accountId: string): Promise<AccountRequirementsResponse> {
    try {
      console.log('Getting account requirements for:', accountId);
      
      const { data, error } = await supabase.functions.invoke('get-account-requirements', {
        body: { accountId },
      });

      if (error) {
        throw new Error(error.message || 'Failed to get account requirements');
      }

      return data;
    } catch (error) {
      console.error('Get Account Requirements Error:', error);
      throw error;
    }
  }
}

export const stripeCustomService = new StripeCustomService();
