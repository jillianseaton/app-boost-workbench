import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface SubscriptionData {
  subscribed: boolean;
  plan: string;
  status: string;
  expiry_date: string | null;
}

export const useSubscription = () => {
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData>({
    subscribed: false,
    plan: 'none',
    status: 'inactive',
    expiry_date: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const checkSubscription = useCallback(async () => {
    if (!user) {
      setSubscriptionData({
        subscribed: false,
        plan: 'none',
        status: 'inactive',
        expiry_date: null
      });
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: functionError } = await supabase.functions.invoke('check-subscription');

      if (functionError) {
        throw new Error(functionError.message);
      }

      if (data) {
        setSubscriptionData({
          subscribed: data.subscribed || false,
          plan: data.plan || 'none',
          status: data.status || 'inactive',
          expiry_date: data.expiry_date || null
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to check subscription';
      setError(errorMessage);
      console.error('Error checking subscription:', err);
      
      // Set default values on error
      setSubscriptionData({
        subscribed: false,
        plan: 'none',
        status: 'error',
        expiry_date: null
      });
    } finally {
      setLoading(false);
    }
  }, [user]);

  const refreshSubscription = useCallback(() => {
    checkSubscription();
  }, [checkSubscription]);

  const openCustomerPortal = useCallback(async () => {
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');
      
      if (error) {
        throw new Error(error.message);
      }

      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to open customer portal';
      setError(errorMessage);
      console.error('Error opening customer portal:', err);
    }
  }, []);

  // Check subscription on mount and when user changes
  useEffect(() => {
    checkSubscription();
  }, [checkSubscription]);

  // Auto-refresh subscription every 30 seconds if user is subscribed
  useEffect(() => {
    if (!subscriptionData.subscribed) return;

    const interval = setInterval(() => {
      checkSubscription();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [subscriptionData.subscribed, checkSubscription]);

  return {
    ...subscriptionData,
    loading,
    error,
    refreshSubscription,
    openCustomerPortal,
    isActive: subscriptionData.status === 'active' && subscriptionData.subscribed,
    planName: subscriptionData.plan,
    expiryDate: subscriptionData.expiry_date ? new Date(subscriptionData.expiry_date) : null
  };
};