import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface BalanceData {
  balanceSats: number;
  balanceBTC: number;
  address: string;
  transactions: number;
}

interface WalletData {
  address: string;
  privateKey: string;
  network: string;
}

interface BitcoinBalanceProps {
  wallet: WalletData | null;
  balance: BalanceData | null;
  onBalanceUpdated: (balance: BalanceData) => void;
}

const BitcoinBalance: React.FC<BitcoinBalanceProps> = ({
  wallet,
  balance,
  onBalanceUpdated,
}) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const getBalance = async () => {
    if (!wallet) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('get-balance', {
        body: { address: wallet.address }
      });
      
      if (error) throw error;
      
      console.log('Balance data:', data);
      onBalanceUpdated(data);
      
      toast({
        title: "Balance Updated",
        description: `Balance: ${data.balanceBTC} BTC (${data.balanceSats} sats)`,
      });
    } catch (error) {
      console.error('Error getting balance:', error);
      toast({
        title: "Error",
        description: `Failed to get balance: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!wallet) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Bitcoin Balance</span>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={getBalance} 
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {balance ? (
          <div className="space-y-2">
            <p className="text-2xl font-bold">{balance.balanceBTC} BTC</p>
            <p className="text-muted-foreground">{balance.balanceSats} satoshis</p>
            <p className="text-sm text-muted-foreground">
              Transactions: {balance.transactions}
            </p>
          </div>
        ) : (
          <p className="text-muted-foreground">Click refresh to get balance</p>
        )}
      </CardContent>
    </Card>
  );
};

export default BitcoinBalance;