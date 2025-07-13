
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Wallet, RefreshCw, Send, Copy, ArrowUpRight } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { supabase } from '@/integrations/supabase/client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import BitcoinWithdrawal from '@/components/bitcoin/BitcoinWithdrawal';
import BitcoinBalance from '@/components/bitcoin/BitcoinBalance';
import EarningsConverter from '@/components/bitcoin/EarningsConverter';
import BitcoinDebugger from '@/components/bitcoin/BitcoinDebugger';

interface WalletData {
  address: string;
  privateKey: string;
  network: string;
}

interface BalanceData {
  balanceSats: number;
  balanceBTC: number;
  address: string;
  transactions: number;
}

const BitcoinWallet: React.FC = () => {
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [balance, setBalance] = useState<BalanceData | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const generateWallet = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-wallet');
      
      if (error) throw error;
      
      console.log('Generated wallet:', data);
      setWallet(data);
      setBalance(null);
      
      toast({
        title: "Wallet Generated!",
        description: "Your new Bitcoin mainnet wallet has been created.",
      });
    } catch (error) {
      console.error('Error generating wallet:', error);
      toast({
        title: "Error",
        description: `Failed to generate wallet: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBalanceUpdate = (newBalance: BalanceData) => {
    setBalance(newBalance);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Address copied to clipboard",
    });
  };

  return (
    <div className="space-y-6">
      {/* Wallet Generation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Bitcoin Mainnet Wallet
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!wallet ? (
            <Button onClick={generateWallet} disabled={loading} className="w-full">
              {loading ? "Generating..." : "Generate New Wallet"}
            </Button>
          ) : (
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Public Address</label>
                  <div className="flex gap-2">
                    <Input 
                      value={wallet.address} 
                      readOnly 
                      className="font-mono text-xs"
                    />
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => copyToClipboard(wallet.address)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="flex justify-center">
                  <QRCodeSVG value={wallet.address} size={120} />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Private Key (WIF)</label>
                <Input 
                  value={wallet.privateKey} 
                  readOnly 
                  className="font-mono text-xs"
                  type="password"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Balance Component */}
      <BitcoinBalance 
        wallet={wallet}
        balance={balance}
        onBalanceUpdated={handleBalanceUpdate}
      />

      {/* Earnings Converter - NEW: Real Bitcoin transactions */}
      <EarningsConverter wallet={wallet} />

      {/* Bitcoin Debugger */}
      <BitcoinDebugger wallet={wallet} />

      {/* Bitcoin Withdrawal Component */}
      <BitcoinWithdrawal 
        wallet={wallet}
        balance={balance}
        onBalanceUpdate={() => {
          // Refresh balance after withdrawal
          if (wallet) {
            // Trigger balance refresh
            const refreshBalance = async () => {
              try {
                const { data, error } = await supabase.functions.invoke('get-balance', {
                  body: { address: wallet.address }
                });
                if (!error && data) {
                  setBalance(data);
                }
              } catch (error) {
                console.error('Error refreshing balance:', error);
              }
            };
            refreshBalance();
          }
        }}
      />
    </div>
  );
};

export default BitcoinWallet;
