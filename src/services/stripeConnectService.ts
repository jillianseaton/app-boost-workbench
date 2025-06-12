
import { supabase } from '@/integrations/supabase/client';

export interface CreateAccountResponse {
  account?: string;
  error?: string;
}

export interface CreateAccountSessionResponse {
  client_secret?: string;
  error?: string;
}

class StripeConnectService {
  async createAccount(): Promise<CreateAccountResponse> {
    try {
      console.log('Creating Stripe Connect account');
      
      const { data, error } = await supabase.functions.invoke('create-stripe-account');

      if (error) {
        throw new Error(error.message || 'Account creation failed');
      }

      return data;
    } catch (error) {
      console.error('Stripe Connect Account Creation Error:', error);
      return {
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  async createAccountSession(accountId: string): Promise<CreateAccountSessionResponse> {
    try {
      console.log('Creating account session for:', accountId);
      
      const { data, error } = await supabase.functions.invoke('create-account-session', {
        body: { account: accountId },
      });

      if (error) {
        throw new Error(error.message || 'Account session creation failed');
      }

      return data;
    } catch (error) {
      console.error('Account Session Creation Error:', error);
      return {
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
}

export const stripeConnectService = new StripeConnectService();
