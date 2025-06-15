
import { supabase } from '@/integrations/supabase/client';

export interface CreateConnectAccountResponse {
  account?: string;
  error?: string;
}

export interface CreateAccountLinkResponse {
  url?: string;
  error?: string;
}

class StripeConnectLinkService {
  async createConnectAccount(): Promise<CreateConnectAccountResponse> {
    try {
      console.log('Creating Stripe Connect account');
      
      const { data, error } = await supabase.functions.invoke('create-connect-account');

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

  async createAccountLink(accountId: string, returnUrl?: string, refreshUrl?: string): Promise<CreateAccountLinkResponse> {
    try {
      console.log('Creating account link for:', accountId);
      
      const { data, error } = await supabase.functions.invoke('create-connect-account-link', {
        body: { 
          account: accountId,
          returnUrl,
          refreshUrl
        },
      });

      if (error) {
        throw new Error(error.message || 'Account link creation failed');
      }

      return data;
    } catch (error) {
      console.error('Account Link Creation Error:', error);
      return {
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
}

export const stripeConnectLinkService = new StripeConnectLinkService();
