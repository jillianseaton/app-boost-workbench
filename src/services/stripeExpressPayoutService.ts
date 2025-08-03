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
      
      const response = await fetch('https://node-js1-6awq.onrender.com/api/express-payout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
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