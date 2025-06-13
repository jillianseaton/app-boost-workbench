
import { supabase } from '@/integrations/supabase/client';

export interface AccountLinkRequest {
  accountId: string;
  refreshUrl: string;
  returnUrl: string;
  collectionType: 'currently_due' | 'eventually_due';
}

export interface AccountLinkResponse {
  success: boolean;
  data?: {
    url: string;
    expires_at: number;
  };
  error?: string;
  timestamp: string;
}

export interface PaymentMethodConfiguration {
  id: string;
  object: string;
  name: string;
  active: boolean;
  is_default: boolean;
  [key: string]: any;
}

export interface PaymentMethodConfigResponse {
  success: boolean;
  data?: PaymentMethodConfiguration[];
  error?: string;
  timestamp: string;
}

export interface CurrencyCheckoutRequest {
  accountId: string;
  currency: string;
  amount: number;
  productName: string;
  successUrl: string;
  cancelUrl: string;
}

export interface CurrencyCheckoutResponse {
  success: boolean;
  data?: {
    url: string;
    sessionId: string;
  };
  error?: string;
  timestamp: string;
}

class StripeAdvancedService {
  async createAccountLink(request: AccountLinkRequest): Promise<AccountLinkResponse> {
    try {
      console.log('Creating account link:', request);
      
      const { data, error } = await supabase.functions.invoke('create-account-link', {
        body: request,
      });

      if (error) {
        throw new Error(error.message || 'Account link creation failed');
      }

      return data;
    } catch (error) {
      console.error('Account Link Error:', error);
      throw error;
    }
  }

  async getPaymentMethodConfigurations(accountId: string): Promise<PaymentMethodConfigResponse> {
    try {
      console.log('Getting payment method configurations for:', accountId);
      
      const { data, error } = await supabase.functions.invoke('get-payment-method-configurations', {
        body: { accountId },
      });

      if (error) {
        throw new Error(error.message || 'Failed to get payment method configurations');
      }

      return data;
    } catch (error) {
      console.error('Payment Method Config Error:', error);
      throw error;
    }
  }

  async updatePaymentMethodConfiguration(
    accountId: string,
    configurationId: string,
    paymentMethod: string,
    preference: 'on' | 'off'
  ): Promise<PaymentMethodConfigResponse> {
    try {
      console.log('Updating payment method configuration:', { accountId, configurationId, paymentMethod, preference });
      
      const { data, error } = await supabase.functions.invoke('update-payment-method-configuration', {
        body: { accountId, configurationId, paymentMethod, preference },
      });

      if (error) {
        throw new Error(error.message || 'Failed to update payment method configuration');
      }

      return data;
    } catch (error) {
      console.error('Update Payment Method Config Error:', error);
      throw error;
    }
  }

  async createCurrencyCheckout(request: CurrencyCheckoutRequest): Promise<CurrencyCheckoutResponse> {
    try {
      console.log('Creating currency checkout session:', request);
      
      const { data, error } = await supabase.functions.invoke('create-currency-checkout', {
        body: request,
      });

      if (error) {
        throw new Error(error.message || 'Currency checkout creation failed');
      }

      return data;
    } catch (error) {
      console.error('Currency Checkout Error:', error);
      throw error;
    }
  }
}

export const stripeAdvancedService = new StripeAdvancedService();
