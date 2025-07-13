import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { RefreshCw, Search } from 'lucide-react';
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
  const [customAddress, setCustomAddress] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
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

  const checkCustomAddress = async () => {
    if (!customAddress.trim()) {
      toast({
        title: "Error",
        description: "Please enter a Bitcoin address",
        variant: "destructive",
      });
      return;
    }
    
    setSearchLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('get-balance', {
        body: { address: customAddress.trim() }
      });
      
      if (error) throw error;
      
      console.log('Custom address balance data:', data);
      onBalanceUpdated(data);
      
      toast({
        title: "Balance Updated",
        description: `Address: ${data.address}\nBalance: ${data.balanceBTC} BTC (${data.balanceSats} sats)`,
      });
    } catch (error) {
      console.error('Error getting custom address balance:', error);
      toast({
        title: "Error",
        description: `Failed to get balance: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setSearchLoading(false);
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
        <div className="space-y-4">
          {/* Current wallet balance display */}
          {balance ? (
            <div className="space-y-2">
              <p className="text-2xl font-bold">{balance.balanceBTC} BTC</p>
              <p className="text-muted-foreground">{balance.balanceSats} satoshis</p>
              <p className="text-sm text-muted-foreground">
                Address: {balance.address}
              </p>
              <p className="text-sm text-muted-foreground">
                Transactions: {balance.transactions}
              </p>
            </div>
          ) : (
            <p className="text-muted-foreground">Click refresh to get balance for current wallet</p>
          )}
          
          {/* Manual address input */}
          <div className="border-t pt-4">
            <Label htmlFor="custom-address" className="text-sm font-medium">
              Check Any Bitcoin Address
            </Label>
            <div className="flex gap-2 mt-2">
              <Input
                id="custom-address"
                placeholder="Enter Bitcoin address (e.g., 1PT2g9chJ6qkVx7zsP8z2w1vsXM4NxVmmy)"
                value={customAddress}
                onChange={(e) => setCustomAddress(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && checkCustomAddress()}
              />
              <Button
                onClick={checkCustomAddress}
                disabled={searchLoading}
                size="sm"
              >
                {searchLoading ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BitcoinBalance;