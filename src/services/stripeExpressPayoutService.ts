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
      
      const { data, error } = await supabase.functions.invoke('stripe-express-payout', {
        body: request,
      });

      if (error) {
        throw new Error(error.message || 'Express payout creation failed');
      }

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