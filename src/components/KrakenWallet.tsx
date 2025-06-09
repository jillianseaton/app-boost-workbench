
import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import KrakenConnectionForm from './kraken/KrakenConnectionForm';
import KrakenBalances from './kraken/KrakenBalances';
import KrakenWithdrawal from './kraken/KrakenWithdrawal';

interface KrakenBalance {
  [currency: string]: string;
}

interface KrakenAccount {
  connected: boolean;
  balances: KrakenBalance;
  tradeFee: number;
  verification: 'unverified' | 'intermediate' | 'pro';
}

const KrakenWallet: React.FC = () => {
  const [account, setAccount] = useState<KrakenAccount | null>(null);
  const [loading, setLoading] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const [connectionError, setConnectionError] = useState<string>('');
  const { toast } = useToast();

  const connectKraken = async (key: string, secret: string) => {
    setLoading(true);
    setConnectionError('');
    setApiKey(key);
    setApiSecret(secret);
    
    try {
      console.log('Connecting to Kraken with API key:', key.substring(0, 8) + '...');
      
      const { data, error } = await supabase.functions.invoke('kraken-api', {
        body: {
          action: 'connect',
          apiKey: key,
          apiSecret: secret
        }
      });

      console.log('Supabase function response:', { data, error });

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(`Connection error: ${error.message}`);
      }

      if (data?.error) {
        console.error('Kraken API error:', data.error);
        throw new Error(data.error);
      }

      if (!data?.connected) {
        throw new Error('Connection failed - no data returned');
      }

      console.log('Kraken connection successful:', data);
      
      setAccount({
        connected: true,
        balances: data.balances || {},
        tradeFee: data.tradeFee || 0.26,
        verification: data.verification || 'intermediate'
      });

      toast({
        title: "Kraken Connected!",
        description: "Successfully connected to your Kraken account",
      });

      setConnectionError('');
    } catch (error: any) {
      console.error('Connection error:', error);
      const errorMessage = error.message || "Unable to connect to Kraken. Please check your API credentials.";
      setConnectionError(errorMessage);
      
      toast({
        title: "Connection Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshBalances = async () => {
    if (!account) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('kraken-api', {
        body: {
          action: 'balances',
          apiKey,
          apiSecret
        }
      });

      if (error) {
        throw new Error(error.message || 'Failed to refresh balances');
      }

      if (data.error) {
        throw new Error(data.error);
      }
      
      setAccount(prev => prev ? {
        ...prev,
        balances: data.balances
      } : null);
      
      toast({
        title: "Balances Updated",
        description: "Account balances refreshed successfully",
      });
    } catch (error) {
      console.error('Refresh balances error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to refresh balances",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const withdrawFunds = async (amount: string, currency: string, address: string, method: string) => {
    if (!account || !amount || !address) {
      toast({
        title: "Missing Information",
        description: "Please fill in all withdrawal fields",
        variant: "destructive",
      });
      return;
    }

    const confirmed = window.confirm(
      `⚠️ REAL WITHDRAWAL WARNING ⚠️\n\n` +
      `You are about to withdraw ${amount} ${currency} from your Kraken account.\n` +
      `This is a REAL transaction that cannot be reversed.\n\n` +
      `Destination: ${address}\n` +
      `Method: ${method}\n\n` +
      `Are you absolutely sure you want to proceed?`
    );

    if (!confirmed) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('kraken-api', {
        body: {
          action: 'withdraw',
          apiKey,
          apiSecret,
          asset: currency,
          amount: amount,
          address: address,
          method: method
        }
      });

      if (error) {
        throw new Error(error.message || 'Withdrawal failed');
      }

      if (data.error) {
        throw new Error(data.error);
      }

      toast({
        title: "Withdrawal Initiated!",
        description: `Withdrawal of ${amount} ${currency} has been submitted. Reference: ${data.refid}`,
      });

      await refreshBalances();
    } catch (error) {
      console.error('Withdrawal error:', error);
      toast({
        title: "Withdrawal Failed",
        description: error.message || "Unable to process withdrawal",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <KrakenConnectionForm
        account={account}
        loading={loading}
        connectionError={connectionError}
        onConnect={connectKraken}
        onRefreshBalances={refreshBalances}
      />

      {account && (
        <>
          <KrakenBalances balances={account.balances} />
          <KrakenWithdrawal loading={loading} onWithdraw={withdrawFunds} />
        </>
      )}
    </div>
  );
};

export default KrakenWallet;
