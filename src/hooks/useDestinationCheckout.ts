
import { useState, useCallback } from 'react';
import { destinationChargeService, DestinationCheckoutRequest } from '@/services/destinationChargeService';
import { useToast } from '@/hooks/use-toast';

export const useDestinationCheckout = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const createDestinationCheckout = useCallback(async (request: DestinationCheckoutRequest) => {
    setLoading(true);
    try {
      console.log('Creating destination checkout session:', request);
      
      const result = await destinationChargeService.createDestinationCheckout(request);
      
      if (!result.success || !result.data?.url) {
        throw new Error(result.error || 'Failed to create destination checkout session');
      }
      
      console.log('Destination checkout session created successfully, URL:', result.data.url);
      
      // Redirect to Stripe checkout
      window.location.href = result.data.url;
      
      toast({
        title: "Redirecting to Checkout",
        description: "Redirecting to Stripe to complete your marketplace purchase...",
      });
      
      return result.data;
    } catch (error) {
      console.error('Destination checkout error:', error);
      
      toast({
        title: "Checkout Failed",
        description: error instanceof Error ? error.message : "Failed to create checkout session",
        variant: "destructive",
      });
      
      throw error;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  return {
    loading,
    createDestinationCheckout,
    calculatePlatformFee: destinationChargeService.calculatePlatformFee,
    formatAmount: destinationChargeService.formatAmount,
  };
};
