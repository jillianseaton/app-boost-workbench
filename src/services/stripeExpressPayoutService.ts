import { supabase } from '@/integrations/supabase/client';

export interface StripeExpressPayoutRequest {
  amount: number; // Amount in dollars
  currency?: string;
  stripeAccountId: string;
  method?: 'instant' | 'standard';
  description?: string;
}

export interface StripeExpressPayoutResponse {
  success: boolean;
  data?: {
    payoutId: string;
    amount: number;
    currency: string;
    status: string;
    method: string;
    arrivalDate: number;
    stripeAccountId: string;
    created: number;
  };
  error?: string;
  timestamp: string;
}

class StripeExpressPayoutService {
  async createExpressPayout(request: StripeExpressPayoutRequest): Promise<StripeExpressPayoutResponse> {
    try {
      console.log('Creating Stripe Express payout:', request);
      
      // Convert to your backend's expected format
      const backendRequest = {
        accountId: request.stripeAccountId,
        amount: Math.round(request.amount * 100), // Convert dollars to cents
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
            currency: request.currency || 'usd',
            status: 'pending',
            method: request.method || 'standard',
            arrivalDate: Date.now() + (request.method === 'instant' ? 30 * 60 * 1000 : 2 * 24 * 60 * 60 * 1000),
            stripeAccountId: request.stripeAccountId,
            created: Date.now(),
          },
          timestamp: new Date().toISOString()
        };
      } else {
        throw new Error(data.error || 'Payout failed');
      }
    } catch (error) {
      console.error('Stripe Express Payout Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: new Date().toISOString()
      };
    }
  }
}

export const stripeExpressPayoutService = new StripeExpressPayoutService();