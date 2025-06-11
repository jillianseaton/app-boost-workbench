
import { useState, useCallback } from 'react';
import { stripeService } from '@/services/stripeService';
import { useToast } from '@/hooks/use-toast';

interface CheckoutSessionRequest {
  amount: number; // Amount in cents
  description: string;
  successUrl: string;
  cancelUrl: string;
  customerEmail?: string;
  mode?: 'payment' | 'setup';
}

export const useStripeCheckout = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const createCheckoutSession = useCallback(async (request: CheckoutSessionRequest) => {
    setLoading(true);
    try {
      console.log('Creating Stripe checkout session:', request);
      
      const result = await stripeService.createCheckoutSession(request);
      
      if (!result.success || !result.data?.url) {
        throw new Error(result.error || 'Failed to create checkout session');
      }
      
      // Redirect to Stripe Checkout
      window.location.href = result.data.url;
      
      if (request.mode === 'setup') {
        toast({
          title: "Redirecting to Bank Setup",
          description: "You'll be redirected to Stripe to verify your bank account.",
        });
      } else {
        toast({
          title: "Redirecting to Checkout",
          description: "You'll be redirected to Stripe to complete your withdrawal.",
        });
      }
      
      return result.data;
    } catch (error) {
      console.error('Checkout session error:', error);
      
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
    createCheckoutSession,
  };
};
