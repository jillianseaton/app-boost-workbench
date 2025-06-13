
import { useState, useCallback } from 'react';
import { stripeAccountMonitorService, AccountMonitoringData } from '@/services/stripeAccountMonitorService';
import { useToast } from '@/hooks/use-toast';

export const useStripeAccountMonitor = () => {
  const [loading, setLoading] = useState(false);
  const [accountData, setAccountData] = useState<AccountMonitoringData | null>(null);
  const { toast } = useToast();

  const getAccountStatus = useCallback(async (accountId: string) => {
    setLoading(true);
    try {
      console.log('Retrieving account status for:', accountId);
      
      const result = await stripeAccountMonitorService.getAccountStatus(accountId);
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to retrieve account status');
      }
      
      setAccountData(result.data);
      
      // Log account requirements for monitoring
      console.log('Requirements currently due:', result.data.requirements.currentlyDue);
      console.log('Charges enabled:', result.data.chargesEnabled);
      console.log('Payouts enabled:', result.data.payoutsEnabled);
      
      return result.data;
    } catch (error) {
      console.error('Account status error:', error);
      
      toast({
        title: "Account Status Error",
        description: error instanceof Error ? error.message : "Failed to retrieve account status",
        variant: "destructive",
      });
      
      throw error;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const monitorAccountHealth = useCallback(async (accountId: string) => {
    setLoading(true);
    try {
      console.log('Monitoring account health for:', accountId);
      
      const healthCheck = await stripeAccountMonitorService.monitorAccountHealth(accountId);
      
      if (healthCheck.data) {
        setAccountData(healthCheck.data);
      }
      
      // Show health status in toast
      if (healthCheck.isHealthy) {
        toast({
          title: "Account Healthy",
          description: "Your Stripe account is fully operational.",
        });
      } else {
        toast({
          title: "Account Issues Detected",
          description: `${healthCheck.issues.length} issues found. Check the dashboard for details.`,
          variant: "destructive",
        });
      }
      
      return healthCheck;
    } catch (error) {
      console.error('Account health monitoring error:', error);
      
      toast({
        title: "Health Check Failed",
        description: error instanceof Error ? error.message : "Failed to check account health",
        variant: "destructive",
      });
      
      throw error;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  return {
    loading,
    accountData,
    getAccountStatus,
    monitorAccountHealth,
    getStateDescription: stripeAccountMonitorService.getStateDescription,
    getRequirementDescription: stripeAccountMonitorService.getRequirementDescription,
  };
};
