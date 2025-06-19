
import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface CashAppOnboardingStatus {
  onboarded: boolean;
  payoutsEnabled: boolean;
  cashAppEnabled: boolean;
  requiresAction: boolean;
  connectAccountId: string | null;
}

export const useCashAppStatus = (userId?: string) => {
  const [status, setStatus] = useState<CashAppOnboardingStatus>({
    onboarded: false,
    payoutsEnabled: false,
    cashAppEnabled: false,
    requiresAction: false,
    connectAccountId: null,
  });
  const [loading, setLoading] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const { toast } = useToast();

  const checkOnboardingStatus = useCallback(async (connectAccountId?: string) => {
    if (!userId) {
      console.log('useCashAppStatus: No userId provided, skipping status check');
      return;
    }

    setLoading(true);
    try {
      console.log('useCashAppStatus: Checking onboarding status for user:', userId);
      
      const { data, error } = await supabase.functions.invoke('get-cashapp-onboarding-status', {
        body: { 
          userId,
          connectAccountId: connectAccountId || status.connectAccountId 
        },
      });

      if (error) {
        throw new Error(error.message || 'Failed to check onboarding status');
      }

      if (data?.success && data.data) {
        console.log('useCashAppStatus: Status updated:', data.data);
        setStatus(data.data);
        setLastChecked(new Date());
        
        // Store the connect account ID in localStorage if we got one
        if (data.data.connectAccountId && userId) {
          localStorage.setItem(`cashapp_account_${userId}`, data.data.connectAccountId);
        }
      } else {
        throw new Error(data?.error || 'Invalid response from status check');
      }
      
    } catch (error) {
      console.error('useCashAppStatus: Error checking onboarding status:', error);
      
      toast({
        title: "Status Check Failed",
        description: error instanceof Error ? error.message : "Failed to check Cash App status",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [userId, status.connectAccountId, toast]);

  // Auto-check status on mount and when userId changes
  useEffect(() => {
    if (userId) {
      // Load connectAccountId from localStorage
      const savedAccountId = localStorage.getItem(`cashapp_account_${userId}`);
      if (savedAccountId) {
        setStatus(prev => ({ ...prev, connectAccountId: savedAccountId }));
      }
      
      // Check status immediately
      checkOnboardingStatus(savedAccountId);
    }
  }, [userId, checkOnboardingStatus]);

  // Set up polling every 10 seconds when user might be completing onboarding
  useEffect(() => {
    if (!userId || status.onboarded) return;

    console.log('useCashAppStatus: Setting up polling for onboarding completion');
    const interval = setInterval(() => {
      checkOnboardingStatus();
    }, 10000); // Poll every 10 seconds

    return () => {
      console.log('useCashAppStatus: Cleaning up polling interval');
      clearInterval(interval);
    };
  }, [userId, status.onboarded, checkOnboardingStatus]);

  const refreshStatus = useCallback((connectAccountId?: string) => {
    console.log('useCashAppStatus: Manual status refresh requested');
    return checkOnboardingStatus(connectAccountId);
  }, [checkOnboardingStatus]);

  return {
    status,
    loading,
    lastChecked,
    refreshStatus,
    checkOnboardingStatus,
  };
};
