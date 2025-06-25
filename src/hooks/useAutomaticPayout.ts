
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { stripeService } from '@/services/stripeService';

interface AutomaticPayoutConfig {
  enabled: boolean;
  minimumAmount: number;
  transferTime: string; // HH:MM format
}

export const useAutomaticPayout = (userId: string, userEmail: string, todaysEarnings: number) => {
  const [config, setConfig] = useState<AutomaticPayoutConfig>({
    enabled: false,
    minimumAmount: 10,
    transferTime: '18:00' // 6 PM default
  });
  const [isTransferring, setIsTransferring] = useState(false);
  const [lastTransferDate, setLastTransferDate] = useState<string | null>(null);
  const { toast } = useToast();

  // Load configuration from localStorage
  useEffect(() => {
    const savedConfig = localStorage.getItem(`autopayout_${userId}`);
    if (savedConfig) {
      setConfig(JSON.parse(savedConfig));
    }
    
    const lastTransfer = localStorage.getItem(`last_transfer_${userId}`);
    if (lastTransfer) {
      setLastTransferDate(lastTransfer);
    }
  }, [userId]);

  // Save configuration to localStorage
  const updateConfig = (newConfig: Partial<AutomaticPayoutConfig>) => {
    const updatedConfig = { ...config, ...newConfig };
    setConfig(updatedConfig);
    localStorage.setItem(`autopayout_${userId}`, JSON.stringify(updatedConfig));
  };

  // Check if we should trigger automatic transfer
  const shouldTransferToday = () => {
    const today = new Date().toISOString().split('T')[0];
    const now = new Date();
    const [hours, minutes] = config.transferTime.split(':');
    const transferTime = new Date();
    transferTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    return (
      config.enabled &&
      todaysEarnings >= config.minimumAmount &&
      now >= transferTime &&
      lastTransferDate !== today
    );
  };

  // Execute automatic transfer
  const executeAutomaticTransfer = async () => {
    if (!shouldTransferToday() || isTransferring) return;

    setIsTransferring(true);
    try {
      console.log('Executing automatic payout:', { amount: todaysEarnings, userEmail });
      
      await stripeService.createPayout({
        amount: todaysEarnings,
        email: userEmail,
        userId: userId,
      });

      const today = new Date().toISOString().split('T')[0];
      setLastTransferDate(today);
      localStorage.setItem(`last_transfer_${userId}`, today);

      toast({
        title: "Automatic Transfer Complete",
        description: `$${todaysEarnings.toFixed(2)} has been automatically transferred to your Stripe account.`,
      });

      console.log('Automatic payout completed successfully');
    } catch (error) {
      console.error('Automatic payout failed:', error);
      toast({
        title: "Automatic Transfer Failed",
        description: "Your daily earnings transfer could not be completed. Please try manually.",
        variant: "destructive",
      });
    } finally {
      setIsTransferring(false);
    }
  };

  // Check for automatic transfer every minute
  useEffect(() => {
    if (!config.enabled || !userId || !userEmail) return;

    const interval = setInterval(() => {
      if (shouldTransferToday()) {
        executeAutomaticTransfer();
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [config, todaysEarnings, userId, userEmail, lastTransferDate]);

  return {
    config,
    updateConfig,
    isTransferring,
    lastTransferDate,
    shouldTransferToday: shouldTransferToday(),
    executeAutomaticTransfer
  };
};
