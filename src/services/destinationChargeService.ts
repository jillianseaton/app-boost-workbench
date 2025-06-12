
import { supabase } from '@/integrations/supabase/client';

export interface DestinationCheckoutRequest {
  amount: number; // Amount in cents
  description: string;
  connectedAccountId: string;
  applicationFeeAmount: number; // Platform fee in cents
  successUrl: string;
  cancelUrl: string;
  customerEmail?: string;
  onBehalfOf?: boolean;
}

export interface DestinationCheckoutResponse {
  success: boolean;
  data?: {
    url: string;
    sessionId: string;
  };
  error?: string;
  timestamp: string;
}

class DestinationChargeService {
  async createDestinationCheckout(request: DestinationCheckoutRequest): Promise<DestinationCheckoutResponse> {
    try {
      console.log('Creating destination checkout session:', request);
      
      const { data, error } = await supabase.functions.invoke('create-destination-checkout', {
        body: request,
      });

      if (error) {
        throw new Error(error.message || 'Destination checkout session creation failed');
      }

      return data;
    } catch (error) {
      console.error('Destination Charge Service Error:', error);
      throw error;
    }
  }

  // Helper method to calculate platform fee (e.g., 3% of transaction)
  calculatePlatformFee(amount: number, feePercentage: number = 3): number {
    return Math.round(amount * (feePercentage / 100));
  }

  // Helper method to format amount for display
  formatAmount(amountInCents: number): string {
    return (amountInCents / 100).toFixed(2);
  }
}

export const destinationChargeService = new DestinationChargeService();
