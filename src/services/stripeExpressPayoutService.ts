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
      
      const res = await fetch('https://node-js1-6awq.onrender.com/payout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountId: request.stripeAccountId,
          amount: Math.round(request.amount * 100), // Convert dollars to cents
          method: request.method || 'standard',
          description: request.description,
        }),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      console.log('Payout response:', data);

      if (data.success) {
        return {
          success: true,
          data: {
            payoutId: data.payout?.id || 'unknown',
            amount: data.payout?.amount || Math.round(request.amount * 100),
            currency: data.payout?.currency || request.currency || 'usd',
            status: data.payout?.status || 'pending',
            method: data.payout?.method || request.method || 'standard',
            arrivalDate: data.payout?.arrival_date || Date.now() + (request.method === 'instant' ? 30 * 60 * 1000 : 2 * 24 * 60 * 60 * 1000),
            stripeAccountId: request.stripeAccountId,
            created: data.payout?.created || Date.now(),
          },
          timestamp: new Date().toISOString()
        };
      } else {
        throw new Error(data.error || 'Payout failed');
      }
    } catch (error) {
      console.error('Fetch error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send payout',
        timestamp: new Date().toISOString()
      };
    }
  }
}

export const stripeExpressPayoutService = new StripeExpressPayoutService();