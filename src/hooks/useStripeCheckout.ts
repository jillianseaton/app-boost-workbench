
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
  paymentMethod?: 'card' | 'cashapp';
}

export const useStripeCheckout = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const createCheckoutSession = useCallback(async (request: CheckoutSessionRequest) => {
    setLoading(true);
    try {
      console.log('Creating Stripe checkout session (Production):', request);
      
      // Production validation
      if (request.mode === 'payment' && request.amount < 50) {
        throw new Error('Minimum withdrawal amount is $0.50 for live transactions.');
      }
      
      const result = await stripeService.createCheckoutSession(request);
      
      if (!result.success || !result.data?.url) {
        throw new Error(result.error || 'Failed to create checkout session');
      }
      
      console.log('Checkout session created successfully (Production), URL:', result.data.url);
      
      // Show loading toast immediately
      toast({
        title: "Redirecting to Stripe",
        description: "Opening Stripe checkout in a new window...",
      });
      
      // Small delay to ensure toast shows, then redirect
      setTimeout(() => {
        try {
          // Try to open in new window first (better UX)
          const newWindow = window.open(result.data.url, '_blank', 'width=800,height=600,scrollbars=yes,resizable=yes');
          
          // Fallback to same window if popup blocked
          if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
            console.log('Popup blocked, redirecting in same window');
            window.location.href = result.data.url;
          } else {
            console.log('Opened Stripe checkout in new window');
            toast({
              title: "Checkout Opened",
              description: "Complete your payment in the new window that opened.",
            });
          }
        } catch (redirectError) {
          console.error('Redirect error, trying fallback:', redirectError);
          window.location.href = result.data.url;
        }
      }, 500);
      
      return result.data;
    } catch (error) {
      console.error('Checkout session error (Production):', error);
      
      let errorMessage = 'Failed to create checkout session';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Checkout Failed",
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
    createCheckoutSession,
  };
};
