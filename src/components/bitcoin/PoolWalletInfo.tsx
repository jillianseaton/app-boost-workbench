import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Wallet, ExternalLink, RefreshCw, Bitcoin } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface PoolWalletData {
  poolWalletAddress: string;
  network: string;
  balanceInfo?: {
    balance_sats: number;
    balance_btc: number;
    tx_count: number;
    unconfirmed_tx_count: number;
  };
  explorerUrl: string;
}

const PoolWalletInfo: React.FC = () => {
  const [walletInfo, setWalletInfo] = useState<PoolWalletData | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const getPoolWalletInfo = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('get-pool-wallet-address');

      if (error) {
        console.error('Error getting pool wallet info:', error);
        toast({
          title: "Error",
          description: `Failed to get pool wallet info: ${error.message}`,
          variant: "destructive",
        });
        return;
      }

      if (!data || !data.success) {
        toast({
          title: "Error",
          description: data?.error || "Failed to get pool wallet information",
          variant: "destructive",
        });
        return;
      }

      setWalletInfo(data);
      toast({
        title: "Pool Wallet Info Retrieved",
        description: `Address: ${data.poolWalletAddress.slice(0, 12)}...`,
      });

    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5 text-blue-600" />
          Pool Wallet Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground">
          View information about your Bitcoin pool wallet used for payouts
        </div>

        {!walletInfo ? (
          <div className="text-center">
            <Button onClick={getPoolWalletInfo} disabled={loading} variant="outline">
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Getting Info...
                </>
              ) : (
                <>
                  <Wallet className="h-4 w-4 mr-2" />
                  Get Pool Wallet Info
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="space-y-2">
                <div className="text-sm font-medium text-blue-800">Pool Wallet Address:</div>
                <div className="font-mono text-sm break-all bg-white p-2 rounded border">
                  {walletInfo.poolWalletAddress}
                </div>
                <div className="flex justify-between items-center text-xs text-blue-600">
                  <span>Network: {walletInfo.network}</span>
                  <a 
                    href={walletInfo.explorerUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 hover:underline"
                  >
                    View on Explorer <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            </div>

            {walletInfo.balanceInfo && (
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="text-sm text-muted-foreground">Balance</div>
                  <div className="text-2xl font-bold text-green-600">
                    {walletInfo.balanceInfo.balance_btc.toFixed(8)} BTC
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {walletInfo.balanceInfo.balance_sats.toLocaleString()} sats
                  </div>
                </div>
                
                <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <div className="text-sm text-muted-foreground">Transactions</div>
                  <div className="text-2xl font-bold text-orange-600">
                    {walletInfo.balanceInfo.tx_count}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {walletInfo.balanceInfo.unconfirmed_tx_count} unconfirmed
                  </div>
                </div>
              </div>
            )}

            <div className="p-3 bg-yellow-50 rounded-md border border-yellow-200">
              <p className="text-sm text-yellow-800">
                <strong>Important:</strong> This is your pool wallet that sends Bitcoin payouts to users. 
                Make sure it has sufficient balance to handle conversion requests.
              </p>
            </div>

            <Button 
              onClick={getPoolWalletInfo}
              disabled={loading}
              variant="outline"
              size="sm"
              className="w-full"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh Info
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PoolWalletInfo;