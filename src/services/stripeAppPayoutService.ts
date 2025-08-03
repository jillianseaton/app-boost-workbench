import { supabase } from '@/integrations/supabase/client';

export interface StripeAppPayoutRequest {
  amount?: number; // Optional: specific amount to payout (in USD)
  stripeAccountId?: string; // Optional: specific Stripe account for Express payouts
  method?: 'instant' | 'standard';
  description?: string;
  payoutType?: 'commissions' | 'manual'; // Type of payout
}

export interface StripeAppPayoutResponse {
  success: boolean;
  data?: {
    payoutId: string;
    amount: number; // Amount in cents
    amountUSD: number; // Amount in USD
    currency: string;
    status: string;
    method: string;
    arrivalDate: number;
    stripeAccountId: string;
    created: number;
    commissionsProcessed: number;
    payoutType: string;
    isSimulation: boolean;
  };
  error?: string;
  message?: string;
  timestamp: string;
}

class StripeAppPayoutService {
  async createAppPayout(request: StripeAppPayoutRequest): Promise<StripeAppPayoutResponse> {
    try {
      console.log('Creating Stripe app payout:', request);
      
      // Convert to your backend's expected format
      const backendRequest = {
        accountId: request.stripeAccountId || 'platform', // Use 'platform' for non-Express payouts
        amount: request.amount ? Math.round(request.amount * 100) : 0, // Convert dollars to cents
      };
      
      const response = await fetch('https://node-js1-6awq.onrender.com/payout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(backendRequest),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        return {
          success: true,
          data: {
            payoutId: data.payoutId || 'unknown',
            amount: backendRequest.amount,
            amountUSD: backendRequest.amount / 100,
            currency: 'usd',
            status: 'pending',
            method: request.method || 'standard',
            arrivalDate: Date.now() + (request.method === 'instant' ? 30 * 60 * 1000 : 2 * 24 * 60 * 60 * 1000),
            stripeAccountId: request.stripeAccountId || 'platform',
            created: Date.now(),
            commissionsProcessed: 0,
            payoutType: request.payoutType || 'manual',
            isSimulation: false,
          },
          timestamp: new Date().toISOString()
        };
      } else {
        throw new Error(data.error || 'Payout failed');
      }
    } catch (error) {
      console.error('Stripe App Payout Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: new Date().toISOString()
      };
    }
  }

  // Helper method to create commission-based payout
  async payoutCommissions(options?: {
    amount?: number;
    stripeAccountId?: string;
    method?: 'instant' | 'standard';
    description?: string;
  }): Promise<StripeAppPayoutResponse> {
    return this.createAppPayout({
      ...options,
      payoutType: 'commissions'
    });
  }

  // Helper method to create manual payout
  async payoutManual(
    amount: number,
    options?: {
      stripeAccountId?: string;
      method?: 'instant' | 'standard';
      description?: string;
    }
  ): Promise<StripeAppPayoutResponse> {
    return this.createAppPayout({
      amount,
      ...options,
      payoutType: 'manual'
    });
  }

  // Helper method to format amounts for display
  formatAmount(amountInCents: number): string {
    return (amountInCents / 100).toFixed(2);
  }

  // Helper method to calculate estimated arrival time
  getEstimatedArrival(method: 'instant' | 'standard'): string {
    if (method === 'instant') {
      return 'Within 30 minutes';
    }
    return '1-2 business days';
  }
}

export const stripeAppPayoutService = new StripeAppPayoutService();