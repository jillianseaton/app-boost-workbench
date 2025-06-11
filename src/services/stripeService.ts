
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

export interface CreatePaymentIntentRequest {
  amount: number; // Amount in cents
  description?: string;
  currency?: string;
  customerEmail?: string;
}

export interface CreatePaymentIntentResponse {
  success: boolean;
  data?: {
    clientSecret: string;
    paymentIntentId: string;
    amount: number;
    currency: string;
    status: string;
  };
  error?: string;
  timestamp: string;
}

export interface VerifyPaymentRequest {
  paymentIntentId: string;
}

export interface VerifyPaymentResponse {
  success: boolean;
  data?: {
    paymentIntentId: string;
    status: string;
    amount: number;
    currency: string;
    customerEmail?: string;
    created: number;
    confirmed: boolean;
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

  async createPaymentIntent(request: CreatePaymentIntentRequest): Promise<CreatePaymentIntentResponse> {
    try {
      console.log('Creating payment intent:', request);
      
      const { data, error } = await supabase.functions.invoke('create-payment-intent', {
        body: request,
      });

      if (error) {
        throw new Error(error.message || 'Payment intent creation failed');
      }

      return data;
    } catch (error) {
      console.error('Payment Intent Creation Error:', error);
      throw error;
    }
  }

  async verifyPayment(paymentIntentId: string): Promise<VerifyPaymentResponse> {
    try {
      console.log('Verifying payment:', paymentIntentId);
      
      const { data, error } = await supabase.functions.invoke('verify-payment', {
        body: { paymentIntentId },
      });

      if (error) {
        throw new Error(error.message || 'Payment verification failed');
      }

      return data;
    } catch (error) {
      console.error('Payment Verification Error:', error);
      throw error;
    }
  }
}

export const stripeService = new StripeService();
