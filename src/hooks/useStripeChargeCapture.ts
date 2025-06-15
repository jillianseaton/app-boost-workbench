
import { useState, useCallback } from 'react';
import { stripeService, CaptureChargeRequest } from '@/services/stripeService';
import { useToast } from '@/hooks/use-toast';

export const useStripeChargeCapture = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const captureCharge = useCallback(async (request: CaptureChargeRequest) => {
    setLoading(true);
    try {
      console.log('Capturing Stripe charge:', request);
      
      const result = await stripeService.captureCharge(request);
      
      if (!result.success) {
        throw new Error(result.error || 'Charge capture failed');
      }
      
      toast({
        title: "Charge Captured",
        description: `Charge ${request.chargeId} has been captured successfully.`,
      });
      
      return result.data;
    } catch (error) {
      console.error('Charge capture error:', error);
      
      toast({
        title: "Charge Capture Failed",
        description: error instanceof Error ? error.message : "Failed to capture charge",
        variant: "destructive",
      });
      
      throw error;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  return {
    loading,
    captureCharge,
  };
};
