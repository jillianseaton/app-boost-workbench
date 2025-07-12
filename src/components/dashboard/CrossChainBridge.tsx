import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowDownUp, Loader2, Bitcoin, Coins } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

const CrossChainBridge: React.FC = () => {
  const { user } = useAuth();
  const [btcAmount, setBtcAmount] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const { toast } = useToast();

  // Your predefined addresses
  const btcSourceAddress = '1LJmPcYx6occVUs4h1ENrkN4L3pS7y7VAh';
  const ethDestinationAddress = '0x5Dd9529Bb5387bd64A2bEeb490ed417675e11d98';

  const fetchExchangeRate = async () => {
    try {
      // Get BTC to ETH exchange rate
      const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd');
      const data = await response.json();
      
      const btcPrice = data.bitcoin.usd;
      const ethPrice = data.ethereum.usd;
      const rate = btcPrice / ethPrice;
      
      setExchangeRate(rate);
      return rate;
    } catch (error) {
      console.error('Failed to fetch exchange rate:', error);
      toast({
        title: "Exchange Rate Error",
        description: "Could not fetch current exchange rates. Please try again.",
        variant: "destructive",
      });
      return null;
    }
  };

  const handleBridgeTransfer = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to continue.",
        variant: "destructive",
      });
      return;
    }

    const btcAmountNum = parseFloat(btcAmount);
    if (isNaN(btcAmountNum) || btcAmountNum <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid BTC amount.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Get current exchange rate
      const currentRate = await fetchExchangeRate();
      if (!currentRate) {
        return;
      }

      // Calculate ETH equivalent (minus 2% bridge fee)
      const ethEquivalent = btcAmountNum * currentRate * 0.98;

      toast({
        title: "Processing Bridge Transfer",
        description: `Converting ${btcAmountNum} BTC to ${ethEquivalent.toFixed(6)} ETH...`,
      });

      // First, get the private key for the BTC address
      const { data: keyData, error: keyError } = await supabase.functions.invoke('get-wallet-private-key', {
        body: {
          address: btcSourceAddress,
          userId: user.id,
        },
      });

      if (keyError || !keyData.privateKey) {
        throw new Error('Could not retrieve private key for BTC address');
      }

      // Step 1: Send BTC from source address
      const amountSats = Math.round(btcAmountNum * 100000000); // Convert BTC to satoshis
      const { data: btcData, error: btcError } = await supabase.functions.invoke('send-btc', {
        body: {
          privateKeyWIF: keyData.privateKey,
          recipientAddress: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh', // Bridge wallet address
          amountSats: amountSats,
        },
      });

      if (btcError || !btcData.success) {
        throw new Error(btcData?.error || btcError?.message || 'BTC transfer failed');
      }

      // Step 2: Send equivalent ETH to destination
      const { data: ethData, error: ethError } = await supabase.functions.invoke('send-eth-to-wallet', {
        body: {
          toAddress: ethDestinationAddress,
          amountEth: ethEquivalent.toString(),
          userId: user.id,
        },
      });

      if (ethError || !ethData.success) {
        throw new Error(ethData?.error || ethError?.message || 'ETH transfer failed');
      }

      setBtcAmount('');
      
      toast({
        title: "Bridge Transfer Successful! 🎉",
        description: `Converted ${btcAmountNum} BTC to ${ethEquivalent.toFixed(6)} ETH and sent to your Ethereum address.`,
      });
      
    } catch (error: any) {
      console.error('Bridge transfer error:', error);
      toast({
        title: "Bridge Transfer Failed",
        description: error.message || "Failed to complete cross-chain transfer. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchExchangeRate();
  }, []);

  const ethEquivalent = btcAmount && exchangeRate ? 
    (parseFloat(btcAmount) * exchangeRate * 0.98).toFixed(6) : '0';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ArrowDownUp className="h-5 w-5" />
          Cross-Chain Bridge
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-muted p-3 rounded-lg space-y-2">
          <div className="flex items-center gap-2">
            <Bitcoin className="h-4 w-4" />
            <span className="text-sm font-medium">From (Bitcoin)</span>
          </div>
          <p className="font-mono text-xs text-muted-foreground">
            {btcSourceAddress.slice(0, 10)}...{btcSourceAddress.slice(-6)}
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="btc-amount">BTC Amount</Label>
          <Input
            id="btc-amount"
            type="number"
            step="0.00000001"
            min="0"
            value={btcAmount}
            onChange={(e) => setBtcAmount(e.target.value)}
            placeholder="0.00000000"
            disabled={isLoading}
          />
          {exchangeRate && (
            <p className="text-xs text-muted-foreground">
              Rate: 1 BTC = {exchangeRate.toFixed(4)} ETH
            </p>
          )}
        </div>

        <div className="flex justify-center">
          <ArrowDownUp className="h-6 w-6 text-muted-foreground" />
        </div>

        <div className="bg-muted p-3 rounded-lg space-y-2">
          <div className="flex items-center gap-2">
            <Coins className="h-4 w-4" />
            <span className="text-sm font-medium">To (Ethereum)</span>
          </div>
          <p className="font-mono text-xs text-muted-foreground">
            {ethDestinationAddress.slice(0, 10)}...{ethDestinationAddress.slice(-6)}
          </p>
          <p className="font-mono text-sm">
            ≈ {ethEquivalent} ETH
          </p>
          <p className="text-xs text-muted-foreground">
            (includes 2% bridge fee)
          </p>
        </div>

        <Button 
          onClick={handleBridgeTransfer}
          disabled={isLoading || !btcAmount || parseFloat(btcAmount) <= 0 || !exchangeRate}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Bridging...
            </>
          ) : (
            <>
              <ArrowDownUp className="h-4 w-4 mr-2" />
              Bridge BTC to ETH
            </>
          )}
        </Button>

        <div className="text-xs text-muted-foreground space-y-1">
          <p>• Cross-chain bridge converts BTC to ETH automatically</p>
          <p>• 2% bridge fee included in conversion</p>
          <p>• Transaction may take 10-30 minutes to complete</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default CrossChainBridge;