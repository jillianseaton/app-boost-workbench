
import { supabase } from '@/integrations/supabase/client';

export interface StripePayoutRequest {
  amount: number;
  email: string;
  userId: string;
}

export interface StripePayoutResponse {
  success: boolean;
  data?: {
    payoutId: string;
    amount: number;
    status: string;
    estimatedArrival: string;
    accountId: string;
  };
  error?: string;
  timestamp: string;
}

export interface StripeAccountSetupResponse {
  success: boolean;
  data?: {
    accountId: string;
    onboardingUrl: string;
    payoutsEnabled: boolean;
  };
  error?: string;
  timestamp: string;
}

class StripeService {
  async createPayout(request: StripePayoutRequest): Promise<StripePayoutResponse> {
    try {
      console.log('Creating Stripe payout:', request);
      
      const { data, error } = await supabase.functions.invoke('stripe-payout', {
        body: request,
      });

      if (error) {
        throw new Error(error.message || 'Payout request failed');
      }

      return data;
    } catch (error) {
      console.error('Stripe Payout Error:', error);
      throw error;
    }
  }

  async setupAccount(email: string, userId: string, returnUrl?: string): Promise<StripeAccountSetupResponse> {
    try {
      console.log('Setting up Stripe account:', { email, userId });
      
      const { data, error } = await supabase.functions.invoke('stripe-account-setup', {
        body: { email, userId, returnUrl },
      });

      if (error) {
        throw new Error(error.message || 'Account setup failed');
      }

      return data;
    } catch (error) {
      console.error('Stripe Account Setup Error:', error);
      throw error;
    }
  }
}

export const stripeService = new StripeService();
