
import { useState, useCallback } from 'react';
import { cashAppPayoutService, CashAppPayoutRequest } from '@/services/cashAppPayoutService';
import { useToast } from '@/hooks/use-toast';

export const useCashAppPayout = () => {
  const [loading, setLoading] = useState(false);
  const [setupLoading, setSetupLoading] = useState(false);
  const [connectAccountId, setConnectAccountId] = useState<string>();
  const { toast } = useToast();

  const setupCashAppAccount = useCallback(async (email: string, userId: string, cashAppTag: string) => {
    setSetupLoading(true);
    try {
      console.log('Setting up Cash App account:', { email, userId, cashAppTag });
      
      const result = await cashAppPayoutService.setupCashAppAccount(email, userId, cashAppTag);
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Cash App account setup failed');
      }
      
      setConnectAccountId(result.data.connectAccountId);
      
      // Open onboarding in new tab
      if (result.data.onboardingUrl) {
        window.open(result.data.onboardingUrl, '_blank');
        
        toast({
          title: "Cash App Setup Started",
          description: "Complete the onboarding process in the new tab to enable Cash App payouts.",
        });
      }
      
      return result.data;
    } catch (error) {
      console.error('Cash App setup error:', error);
      
      toast({
        title: "Cash App Setup Failed",
        description: error instanceof Error ? error.message : "Failed to setup Cash App account",
        variant: "destructive",
      });
      
      throw error;
    } finally {
      setSetupLoading(false);
    }
  }, [toast]);

  const createCashAppPayout = useCallback(async (request: CashAppPayoutRequest) => {
    setLoading(true);
    try {
      console.log('Creating Cash App payout:', request);
      
      const result = await cashAppPayoutService.createCashAppPayout(request);
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Cash App payout failed');
      }
      
      toast({
        title: "Cash App Payout Initiated",
        description: `$${request.amount.toFixed(2)} payout to ${request.cashAppTag} has been initiated.`,
      });
      
      return result.data;
    } catch (error) {
      console.error('Cash App payout error:', error);
      
      toast({
        title: "Cash App Payout Failed",
        description: error instanceof Error ? error.message : "Failed to process Cash App payout",
        variant: "destructive",
      });
      
      throw error;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  return {
    loading,
    setupLoading,
    connectAccountId,
    setupCashAppAccount,
    createCashAppPayout,
  };
};
