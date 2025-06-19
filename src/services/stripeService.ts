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

export interface PaymentItem {
  amount: number;
}

export interface CreatePaymentIntentRequest {
  amount?: number; // Amount in cents (for backward compatibility)
  items?: PaymentItem[]; // New items-based approach (matches Ruby implementation)
  description?: string;
  currency?: string;
  customerEmail?: string;
}

export interface CreatePaymentIntentResponse {
  success: boolean;
  clientSecret?: string; // Direct access to clientSecret (matching Ruby response)
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
  console.error(`Live Production Error - ${context}:`, error);
  
  // Map common Stripe live production errors to user-friendly messages
  if (error.message?.includes('Your account cannot currently make live charges')) {
    return 'Your live Stripe account is not yet activated for payouts. Please complete your account activation in the Stripe Dashboard.';
  }
  
  if (error.message?.includes('Invalid API Key') || error.message?.includes('api_key')) {
    return 'Invalid live Stripe API key. Please verify your live API key (sk_live_...) is correctly configured in Supabase secrets.';
  }
  
  if (error.message?.includes('permissions') || error.message?.includes('restricted')) {
    return 'Insufficient API key permissions. Your live Stripe key may be restricted. Please use a full secret key or update permissions.';
  }
  
  if (error.message?.includes('rate_limit')) {
    return 'Rate limit exceeded. Please wait a moment before trying again.';
  }
  
  if (error.message?.includes('amount_too_small') || error.message?.includes('minimum')) {
    return 'Payout amount is too small. Minimum amount for live payouts is $0.50.';
  }
  
  // Generic production error message
  return error.message || 'A payout processing error occurred in live mode. Please try again or contact support.';
};

class StripeService {
  async createPayout(request: StripePayoutRequest): Promise<StripePayoutResponse> {
    try {
      console.log('Creating live Stripe payout (depositing earnings):', { ...request, amount: request.amount });
      
      // Production validation
      if (request.amount < 0.5) {
        throw new Error('Minimum payout amount is $0.50 for live transactions.');
      }
      
      const { data, error } = await supabase.functions.invoke('stripe-payout', {
        body: request,
      });

      if (error) {
        throw new Error(handleProductionError(error, 'Live Payout Creation'));
      }

      console.log('Live payout created successfully (earnings deposited):', data);
      return data;
    } catch (error) {
      console.error('Live Stripe Payout Error:', error);
      throw new Error(handleProductionError(error, 'Live Payout Creation'));
    }
  }

  async setupAccount(email: string, userId: string, returnUrl?: string): Promise<StripeAccountSetupResponse> {
    try {
      console.log('Setting up live Stripe account:', { email, userId });
      
      const { data, error } = await supabase.functions.invoke('stripe-account-setup', {
        body: { email, userId, returnUrl },
      });

      if (error) {
        throw new Error(handleProductionError(error, 'Live Account Setup'));
      }

      console.log('Live account setup successful:', data);
      return data;
    } catch (error) {
      console.error('Live Stripe Account Setup Error:', error);
      throw new Error(handleProductionError(error, 'Live Account Setup'));
    }
  }

  async createPaymentIntent(request: CreatePaymentIntentRequest): Promise<CreatePaymentIntentResponse> {
    try {
      // Support both legacy amount-based and new items-based approaches (matching Ruby implementation)
      if (!request.amount && !request.items) {
        throw new Error('Either amount or items must be provided');
      }
      
      const requestBody: any = {
        description: request.description,
        currency: request.currency || 'usd',
        customerEmail: request.customerEmail,
      };
      
      if (request.items) {
        console.log('Creating payment intent with items (Ruby-style):', request.items);
        requestBody.items = request.items;
      } else if (request.amount) {
        console.log('Creating payment intent with amount (legacy):', request.amount);
        // Convert single amount to items format for consistency with Ruby implementation
        requestBody.items = [{ amount: request.amount }];
      }
      
      // Production validation
      const totalAmount = request.items 
        ? request.items.reduce((sum, item) => sum + item.amount, 0)
        : request.amount || 0;
        
      if (totalAmount < 50) { // $0.50 minimum
        throw new Error('Minimum payment amount is $0.50 for live transactions.');
      }
      
      const { data, error } = await supabase.functions.invoke('create-payment-intent', {
        body: requestBody,
      });

      if (error) {
        throw new Error(handleProductionError(error, 'Payment Intent Creation'));
      }

      console.log('Payment intent created successfully:', data);
      
      // Return response matching Ruby format with direct clientSecret access
      return {
        success: data.success,
        clientSecret: data.clientSecret, // Direct access like Ruby response
        data: data.data,
        error: data.error,
        timestamp: data.timestamp
      };
    } catch (error) {
      console.error('Payment Intent Creation Error:', error);
      throw new Error(handleProductionError(error, 'Payment Intent Creation'));
    }
  }

  async createCheckoutSession(request: CreateCheckoutSessionRequest): Promise<CreateCheckoutSessionResponse> {
    try {
      console.log('Creating live checkout session:', { 
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
        throw new Error(handleProductionError(error, 'Live Checkout Session Creation'));
      }

      if (!data?.success || !data?.data?.url) {
        throw new Error('Failed to create live checkout session. Please verify your live Stripe configuration.');
      }

      console.log('Live checkout session created successfully:', data);
      return data;
    } catch (error) {
      console.error('Live Checkout Session Creation Error:', error);
      throw new Error(handleProductionError(error, 'Live Checkout Session Creation'));
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

  // Enhanced production configuration verification
  async verifyProductionConfig(): Promise<{ isProductionReady: boolean; issues: string[]; warnings: string[] }> {
    const issues: string[] = [];
    const warnings: string[] = [];
    
    try {
      console.log('Verifying live production payout configuration...');
      
      // Test basic live API connectivity for payouts
      const testResponse = await supabase.functions.invoke('stripe-payout', {
        body: {
          amount: 0.50, // $0.50 minimum for live
          email: 'production-test@example.com',
          userId: 'test-user-id'
        }
      });

      if (!testResponse.data?.success) {
        const error = testResponse.data?.error || testResponse.error?.message || 'Unknown error';
        if (error.includes('api_key') || error.includes('Invalid API Key')) {
          issues.push('Live API key is not configured or invalid. Please set your live Stripe secret key (sk_live_...)');
        } else if (error.includes('account cannot currently make live charges')) {
          issues.push('Your Stripe account is not activated for live payouts. Complete activation in Stripe Dashboard');
        } else {
          issues.push(`Live payout API connectivity issue: ${error}`);
        }
      } else {
        console.log('Live payout API connectivity verified successfully');
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown configuration error';
      issues.push(`Payout configuration verification failed: ${errorMessage}`);
      console.error('Production payout config verification error:', error);
    }

    // Add warnings for common production considerations
    if (issues.length === 0) {
      warnings.push('Ensure your Stripe account has been fully activated for live payouts');
      warnings.push('Test with small amounts before processing larger payouts');
      warnings.push('Verify your bank account is connected for receiving payouts');
    }

    const isProductionReady = issues.length === 0;
    
    console.log('Production payout readiness check completed:', {
      isProductionReady,
      issuesCount: issues.length,
      warningsCount: warnings.length
    });

    return {
      isProductionReady,
      issues,
      warnings
    };
  }
}

export const stripeService = new StripeService();
