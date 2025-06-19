
import { useState, useCallback } from 'react';
import { cashAppPayoutLinkService, CashAppPayoutLinkRequest } from '@/services/cashAppPayoutLinkService';
import { useToast } from '@/hooks/use-toast';

export const useCashAppPayoutLink = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const createPayoutLink = useCallback(async (request: CashAppPayoutLinkRequest) => {
    setLoading(true);
    try {
      console.log('useCashAppPayoutLink: Creating payout link:', request);
      
      const result = await cashAppPayoutLinkService.createPayoutLink(request);
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to create payout link');
      }
      
      toast({
        title: "Payout Link Created",
        description: `Payout link for ${request.cashAppTag} has been created successfully.`,
      });
      
      return result.data;
    } catch (error) {
      console.error('useCashAppPayoutLink: Error:', error);
      
      toast({
        title: "Payout Link Creation Failed",
        description: error instanceof Error ? error.message : "Failed to create payout link",
        variant: "destructive",
      });
      
      throw error;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  return {
    loading,
    createPayoutLink,
  };
};
