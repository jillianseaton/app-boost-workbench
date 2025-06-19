
import { supabase } from '@/integrations/supabase/client';

export interface CashAppPayoutRequest {
  amount: number; // Amount in USD
  cashAppTag: string; // Cash App $cashtag (e.g., $username)
  email: string;
  userId: string;
  description?: string;
}

export interface CashAppPayoutResponse {
  success: boolean;
  data?: {
    payoutId: string;
    amount: number;
    status: string;
    estimatedArrival: string;
    connectAccountId: string;
    cashAppTag: string;
  };
  error?: string;
  timestamp: string;
}

export interface CashAppAccountSetupResponse {
  success: boolean;
  data?: {
    connectAccountId: string;
    onboardingUrl: string;
    payoutsEnabled: boolean;
    cashAppEnabled: boolean;
  };
  error?: string;
  timestamp: string;
}

class CashAppPayoutService {
  async setupCashAppAccount(email: string, userId: string, cashAppTag: string): Promise<CashAppAccountSetupResponse> {
    try {
      console.log('CashAppPayoutService: Setting up Cash App Connect account:', { email, userId, cashAppTag });
      
      const { data, error } = await supabase.functions.invoke('setup-cashapp-connect', {
        body: { 
          email: email,
          userId: userId,
          cashAppTag: cashAppTag
        },
      });

      console.log('CashAppPayoutService: Edge function response:', { data, error });

      if (error) {
        console.error('CashAppPayoutService: Edge function error:', error);
        throw new Error(error.message || 'Cash App account setup failed');
      }

      if (!data) {
        throw new Error('No response data from Cash App setup');
      }

      if (!data.success) {
        throw new Error(data.error || 'Cash App account setup failed');
      }

      console.log('CashAppPayoutService: Cash App Connect account setup successful:', data);
      return data;
    } catch (error) {
      console.error('CashAppPayoutService: Cash App Connect Account Setup Error:', error);
      throw new Error(error instanceof Error ? error.message : 'Cash App account setup failed');
    }
  }

  async createCashAppPayout(request: CashAppPayoutRequest): Promise<CashAppPayoutResponse> {
    try {
      console.log('CashAppPayoutService: Creating Cash App payout:', request);
      
      // Validate minimum amount for live transactions
      if (request.amount < 1.00) {
        throw new Error('Minimum Cash App payout amount is $1.00 for live transactions.');
      }

      // Validate Cash App tag format
      if (!request.cashAppTag.startsWith('$') || request.cashAppTag.length < 2) {
        throw new Error('Invalid Cash App tag format. Please use format: $username');
      }
      
      const { data, error } = await supabase.functions.invoke('create-cashapp-payout', {
        body: request,
      });

      if (error) {
        throw new Error(error.message || 'Cash App payout failed');
      }

      console.log('CashAppPayoutService: Cash App payout created successfully:', data);
      return data;
    } catch (error) {
      console.error('CashAppPayoutService: Cash App Payout Error:', error);
      throw new Error(error instanceof Error ? error.message : 'Cash App payout failed');
    }
  }

  async getCashAppAccountStatus(connectAccountId: string) {
    try {
      console.log('CashAppPayoutService: Getting Cash App account status:', connectAccountId);
      
      const { data, error } = await supabase.functions.invoke('get-cashapp-account-status', {
        body: { connectAccountId },
      });

      if (error) {
        throw new Error(error.message || 'Failed to get account status');
      }

      return data;
    } catch (error) {
      console.error('CashAppPayoutService: Cash App Account Status Error:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to get account status');
    }
  }
}

export const cashAppPayoutService = new CashAppPayoutService();
