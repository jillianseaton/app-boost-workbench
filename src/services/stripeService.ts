
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

export interface CreateCheckoutSessionRequest {
  amount: number; // Amount in cents
  description: string;
  successUrl: string;
  cancelUrl: string;
  customerEmail?: string;
  mode?: 'payment' | 'setup';
  paymentMethod?: 'card' | 'cashapp';
}

export interface CreateCheckoutSessionResponse {
  success: boolean;
  data?: {
    url: string;
    sessionId: string;
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

export interface CaptureChargeRequest {
  chargeId: string;
  amount?: number; // Optional: partial capture amount in cents
}

export interface CaptureChargeResponse {
  success: boolean;
  data?: {
    chargeId: string;
    status: string;
    amount: number;
    amountCaptured: number;
    currency: string;
    captured: boolean;
    created: number;
  };
  error?: string;
  timestamp: string;
}

// Production-specific error handling
const handleProductionError = (error: any, context: string): string => {
  console.error(`Production Error - ${context}:`, error);
  
  // Map common Stripe production errors to user-friendly messages
  if (error.message?.includes('Your account cannot currently make live charges')) {
    return 'Your Stripe account is not yet activated for live payments. Please complete your account setup in the Stripe Dashboard.';
  }
  
  if (error.message?.includes('cashapp') || error.message?.includes('Cash App')) {
    return 'Cash App Pay is not enabled for your live Stripe account. Please enable it in your Stripe Dashboard under Payment Methods.';
  }
  
  if (error.message?.includes('Invalid API Key')) {
    return 'Invalid Stripe API key. Please verify your live API key is correctly configured.';
  }
  
  if (error.message?.includes('permissions')) {
    return 'Insufficient API key permissions. Please ensure your live Stripe key has the necessary permissions.';
  }
  
  if (error.message?.includes('rate_limit')) {
    return 'Too many requests. Please wait a moment and try again.';
  }
  
  if (error.message?.includes('card_declined')) {
    return 'Payment was declined. Please try a different payment method.';
  }
  
  // Generic production error message
  return error.message || 'A payment processing error occurred. Please try again or contact support.';
};

class StripeService {
  async createPayout(request: StripePayoutRequest): Promise<StripePayoutResponse> {
    try {
      console.log('Creating Stripe payout (Production):', { ...request, amount: request.amount });
      
      const { data, error } = await supabase.functions.invoke('stripe-payout', {
        body: request,
      });

      if (error) {
        throw new Error(handleProductionError(error, 'Payout Creation'));
      }

      return data;
    } catch (error) {
      console.error('Stripe Payout Error (Production):', error);
      throw new Error(handleProductionError(error, 'Payout Creation'));
    }
  }

  async setupAccount(email: string, userId: string, returnUrl?: string): Promise<StripeAccountSetupResponse> {
    try {
      console.log('Setting up Stripe account (Production):', { email, userId });
      
      const { data, error } = await supabase.functions.invoke('stripe-account-setup', {
        body: { email, userId, returnUrl },
      });

      if (error) {
        throw new Error(handleProductionError(error, 'Account Setup'));
      }

      return data;
    } catch (error) {
      console.error('Stripe Account Setup Error (Production):', error);
      throw new Error(handleProductionError(error, 'Account Setup'));
    }
  }

  async createPaymentIntent(request: CreatePaymentIntentRequest): Promise<CreatePaymentIntentResponse> {
    try {
      console.log('Creating payment intent (Production):', { ...request, amount: request.amount });
      
      const { data, error } = await supabase.functions.invoke('create-payment-intent', {
        body: request,
      });

      if (error) {
        throw new Error(handleProductionError(error, 'Payment Intent Creation'));
      }

      return data;
    } catch (error) {
      console.error('Payment Intent Creation Error (Production):', error);
      throw new Error(handleProductionError(error, 'Payment Intent Creation'));
    }
  }

  async createCheckoutSession(request: CreateCheckoutSessionRequest): Promise<CreateCheckoutSessionResponse> {
    try {
      console.log('Creating checkout session (Production):', { 
        ...request, 
        amount: request.amount,
        paymentMethod: request.paymentMethod || 'card'
      });
      
      // Production validation
      if (request.mode === 'payment' && request.amount < 50) {
        throw new Error('Minimum transaction amount is $0.50 for live payments.');
      }
      
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: request,
      });

      if (error) {
        throw new Error(handleProductionError(error, 'Checkout Session Creation'));
      }

      if (!data?.success || !data?.data?.url) {
        throw new Error('Failed to create checkout session. Please try again.');
      }

      return data;
    } catch (error) {
      console.error('Checkout Session Creation Error (Production):', error);
      throw new Error(handleProductionError(error, 'Checkout Session Creation'));
    }
  }

  async verifyPayment(paymentIntentId: string): Promise<VerifyPaymentResponse> {
    try {
      console.log('Verifying payment (Production):', paymentIntentId);
      
      const { data, error } = await supabase.functions.invoke('verify-payment', {
        body: { paymentIntentId },
      });

      if (error) {
        throw new Error(handleProductionError(error, 'Payment Verification'));
      }

      return data;
    } catch (error) {
      console.error('Payment Verification Error (Production):', error);
      throw new Error(handleProductionError(error, 'Payment Verification'));
    }
  }

  async captureCharge(request: CaptureChargeRequest): Promise<CaptureChargeResponse> {
    try {
      console.log('Capturing charge (Production):', request);
      
      const { data, error } = await supabase.functions.invoke('capture-charge', {
        body: request,
      });

      if (error) {
        throw new Error(handleProductionError(error, 'Charge Capture'));
      }

      return data;
    } catch (error) {
      console.error('Charge Capture Error (Production):', error);
      throw new Error(handleProductionError(error, 'Charge Capture'));
    }
  }

  // Production configuration verification
  async verifyProductionConfig(): Promise<{ isProductionReady: boolean; issues: string[] }> {
    const issues: string[] = [];
    
    try {
      // Test basic API connectivity
      const testResponse = await supabase.functions.invoke('create-checkout-session', {
        body: {
          amount: 100, // $1.00 test
          description: 'Configuration Test',
          successUrl: window.location.origin + '/test-success',
          cancelUrl: window.location.origin + '/test-cancel',
          customerEmail: 'test@example.com',
          mode: 'payment' as const,
          paymentMethod: 'card' as const
        }
      });

      if (!testResponse.data?.success) {
        issues.push('Failed to create test checkout session');
      }
    } catch (error) {
      issues.push(`API connectivity issue: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return {
      isProductionReady: issues.length === 0,
      issues
    };
  }
}

export const stripeService = new StripeService();
