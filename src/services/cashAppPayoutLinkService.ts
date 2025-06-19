
import { supabase } from '@/integrations/supabase/client';

export interface CashAppPayoutLinkRequest {
  amount: number;
  cashAppTag: string;
  description?: string;
  userId: string;
  email: string;
}

export interface CashAppPayoutLinkResponse {
  success: boolean;
  data?: {
    payoutLinkId: string;
    payoutUrl: string;
    amount: number;
    cashAppTag: string;
    description: string;
  };
  error?: string;
  timestamp: string;
}

class CashAppPayoutLinkService {
  async createPayoutLink(request: CashAppPayoutLinkRequest): Promise<CashAppPayoutLinkResponse> {
    try {
      console.log('CashAppPayoutLinkService: Creating payout link:', request);
      
      const { data, error } = await supabase.functions.invoke('create-cashapp-payout-link', {
        body: request,
      });

      if (error) {
        console.error('CashAppPayoutLinkService: Edge function returned error:', error);
        throw new Error(error.message || 'Failed to create Cash App payout link');
      }

      if (!data || !data.success) {
        console.error('CashAppPayoutLinkService: Edge function returned unsuccessful response:', data);
        throw new Error(data?.error || 'Failed to create Cash App payout link');
      }

      console.log('CashAppPayoutLinkService: Payout link created successfully:', data);
      return data;
    } catch (error) {
      console.error('CashAppPayoutLinkService: Error:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to create Cash App payout link');
    }
  }
}

export const cashAppPayoutLinkService = new CashAppPayoutLinkService();
