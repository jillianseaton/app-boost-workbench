import { supabase } from '@/integrations/supabase/client';

export interface CreateExpressAccountRequest {
  email: string;
  businessName: string;
  businessType: 'individual' | 'company';
  country: string;
}

export interface AdRevenuePaymentRequest {
  partnerId: string;
  amount: number;
  campaign: string;
  description: string;
  metadata?: Record<string, any>;
}

export interface ExpressAccountResponse {
  success: boolean;
  data?: {
    accountId: string;
    onboardingUrl?: string;
    payoutsEnabled: boolean;
  };
  error?: string;
  simulation?: boolean;
  note?: string;
}

export interface PaymentResponse {
  success: boolean;
  data?: {
    paymentId: string;
    transferId: string;
    amount: number;
  };
  error?: string;
}

class AdRevenueService {
  async createExpressAccount(request: CreateExpressAccountRequest): Promise<ExpressAccountResponse> {
    try {
      console.log('Creating Express account for ad revenue:', request);
      
      const { data, error } = await supabase.functions.invoke('create-ad-revenue-account', {
        body: request,
      });

      if (error) {
        throw new Error(error.message || 'Express account creation failed');
      }

      return data;
    } catch (error) {
      console.error('Ad Revenue Account Creation Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  async receivePayment(request: AdRevenuePaymentRequest): Promise<PaymentResponse> {
    try {
      console.log('Processing ad revenue payment:', request);
      
      const { data, error } = await supabase.functions.invoke('receive-ad-payment', {
        body: request,
      });

      if (error) {
        throw new Error(error.message || 'Payment processing failed');
      }

      return data;
    } catch (error) {
      console.error('Ad Revenue Payment Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  async getAccountBalance(accountId: string) {
    try {
      const { data, error } = await supabase.functions.invoke('get-ad-revenue-balance', {
        body: { accountId },
      });

      if (error) {
        throw new Error(error.message || 'Failed to get balance');
      }

      return data;
    } catch (error) {
      console.error('Balance fetch error:', error);
      throw error;
    }
  }

  async requestPayout(accountId: string, amount: number) {
    try {
      const { data, error } = await supabase.functions.invoke('request-ad-revenue-payout', {
        body: { accountId, amount },
      });

      if (error) {
        throw new Error(error.message || 'Payout request failed');
      }

      return data;
    } catch (error) {
      console.error('Payout request error:', error);
      throw error;
    }
  }
}

export const adRevenueService = new AdRevenueService();
