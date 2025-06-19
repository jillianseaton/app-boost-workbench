
import { useState, useCallback } from 'react';
import { stripeService } from '@/services/stripeService';
import { useToast } from '@/hooks/use-toast';

interface PayoutRequest {
  amount: number; // Amount in dollars
  description: string;
  userEmail: string;
  userId: string;
  method?: 'bank_transfer' | 'cashapp';
}

export const useStripeCheckout = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const createPayout = useCallback(async (request: PayoutRequest) => {
    setLoading(true);
    try {
      console.log('Creating payout to deposit earnings:', request);
      
      // Production validation
      if (request.amount < 0.5) {
        throw new Error('Minimum payout amount is $0.50 for live transactions.');
      }
      
      const result = await stripeService.createPayout({
        amount: request.amount,
        email: request.userEmail,
        userId: request.userId,
      });
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to create payout');
      }
      
      console.log('Payout created successfully:', result.data);
      
      toast({
        title: "Withdrawal Initiated",
        description: `$${request.amount.toFixed(2)} will be deposited to your account within 1-2 business days.`,
      });
      
      return result.data;
    } catch (error) {
      console.error('Payout creation error:', error);
      
      let errorMessage = 'Failed to create payout';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Withdrawal Failed",
        description: errorMessage,
        variant: "destructive",
      });
      
      throw error;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  return {
    loading,
    createPayout,
  };
};
