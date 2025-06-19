
import { supabase } from '@/integrations/supabase/client';

export interface ExpressLoginLinkResponse {
  object?: string;
  created?: number;
  url?: string;
  error?: string;
}

class StripeExpressLoginService {
  async createLoginLink(accountId: string): Promise<ExpressLoginLinkResponse> {
    try {
      console.log('Creating Express dashboard login link for:', accountId);
      
      const { data, error } = await supabase.functions.invoke('create-express-login-link', {
        body: { account: accountId },
      });

      if (error) {
        throw new Error(error.message || 'Login link creation failed');
      }

      return data;
    } catch (error) {
      console.error('Express Login Link Creation Error:', error);
      return {
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
}

export const stripeExpressLoginService = new StripeExpressLoginService();
