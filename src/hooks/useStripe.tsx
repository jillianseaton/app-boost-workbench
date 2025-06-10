
import { useState, useCallback } from 'react';
import { stripeService, StripePayoutRequest } from '@/services/stripeService';
import { useToast } from '@/hooks/use-toast';

export const useStripe = () => {
  const [loading, setLoading] = useState(false);
  const [accountSetupLoading, setAccountSetupLoading] = useState(false);
  const { toast } = useToast();

  const createPayout = useCallback(async (request: StripePayoutRequest) => {
    setLoading(true);
    try {
      console.log('Initiating Stripe payout:', request);
      
      const result = await stripeService.createPayout(request);
      
      if (!result.success) {
        throw new Error(result.error || 'Payout failed');
      }
      
      toast({
        title: "Withdrawal Initiated",
        description: `$${request.amount.toFixed(2)} withdrawal initiated. Funds will arrive in 1-2 business days.`,
      });
      
      return result.data;
    } catch (error) {
      console.error('Payout error:', error);
      
      toast({
        title: "Withdrawal Failed",
        description: error instanceof Error ? error.message : "Failed to process withdrawal",
        variant: "destructive",
      });
      
      throw error;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const setupAccount = useCallback(async (email: string, userId: string, returnUrl?: string) => {
    setAccountSetupLoading(true);
    try {
      console.log('Setting up Stripe account:', { email, userId });
      
      const result = await stripeService.setupAccount(email, userId, returnUrl);
      
      if (!result.success) {
        throw new Error(result.error || 'Account setup failed');
      }
      
      return result.data;
    } catch (error) {
      console.error('Account setup error:', error);
      
      toast({
        title: "Account Setup Failed",
        description: error instanceof Error ? error.message : "Failed to setup withdrawal account",
        variant: "destructive",
      });
      
      throw error;
    } finally {
      setAccountSetupLoading(false);
    }
  }, [toast]);

  return {
    loading,
    accountSetupLoading,
    createPayout,
    setupAccount,
  };
};
