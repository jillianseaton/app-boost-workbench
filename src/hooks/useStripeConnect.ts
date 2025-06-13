
import { useState, useEffect } from 'react';
import { loadConnectAndInitialize } from '@stripe/connect-js';
import { stripeConnectService } from '@/services/stripeConnectService';

export const useStripeConnect = (connectedAccountId: string | undefined) => {
  const [stripeConnectInstance, setStripeConnectInstance] = useState<any>(null);

  useEffect(() => {
    if (!connectedAccountId) {
      return;
    }

    const initializeStripeConnect = async () => {
      try {
        // Create account session to get client secret
        const response = await stripeConnectService.createAccountSession(connectedAccountId);

        if (response.error || !response.client_secret) {
          throw new Error(response.error || 'Failed to create account session');
        }

        // Initialize Stripe Connect with live publishable key
        const stripeConnect = await loadConnectAndInitialize({
          publishableKey: 'pk_live_51RBGS0K9RLxvHin2BAeEEZasJJp3IHcwM2QCBIksHEUaDa1GC5MDwwGYbMDejH2Pa9y6ZXvCdoDGTPIEqvmqhcr500r2MxBFkC',
          fetchClientSecret: async () => response.client_secret!,
        });

        setStripeConnectInstance(stripeConnect);
      } catch (error) {
        console.error('Error initializing Stripe Connect:', error);
      }
    };

    initializeStripeConnect();
  }, [connectedAccountId]);

  return stripeConnectInstance;
};
