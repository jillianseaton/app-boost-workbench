import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { RefreshCw, Bitcoin, DollarSign, ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface EarningsData {
  totalUSD: number;
  btcEquivalent: number;
  btcPrice: number;
  commissionsCount: number;
}

interface WalletData {
  address: string;
  privateKey: string;
  network: string;
}

interface EarningsPayoutConverterProps {
  wallet: WalletData | null;
  onBalanceUpdate?: () => void;
}

const EarningsPayoutConverter: React.FC<EarningsPayoutConverterProps> = ({ 
  wallet, 
  onBalanceUpdate 
}) => {
  const [earnings, setEarnings] = useState<EarningsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [converting, setConverting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const calculateEarnings = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to check your earnings",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Get unpaid commissions
      const { data: commissions, error: commissionsError } = await supabase
        .from('commissions')
        .select('amount_earned_cents')
        .eq('user_id', user.id)
        .eq('paid_out', false);
      
      if (commissionsError) throw commissionsError;

      const totalCents = commissions?.reduce((sum, commission) => sum + commission.amount_earned_cents, 0) || 0;
      const totalUSD = totalCents / 100;

      // Get current BTC price
      const { data: priceData, error: priceError } = await supabase.functions.invoke('get-btc-price');
      
      if (priceError) throw priceError;

      const btcPrice = priceData.price;
      const btcEquivalent = totalUSD / btcPrice;

      setEarnings({
        totalUSD,
        btcEquivalent,
        btcPrice,
        commissionsCount: commissions?.length || 0
      });

      if (totalUSD === 0) {
        toast({
          title: "No Earnings",
          description: "You don't have any unpaid commission earnings to convert",
        });
      } else {
        toast({
          title: "Earnings Calculated",
          description: `$${totalUSD.toFixed(2)} available for Bitcoin conversion`,
        });
      }
    } catch (error) {
      console.error('Error calculating earnings:', error);
      toast({
        title: "Error",
        description: `Failed to calculate earnings: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const convertToBitcoin = async () => {
    if (!earnings || earnings.totalUSD === 0) {
      toast({
        title: "No Earnings",
        description: "No earnings available to convert",
        variant: "destructive",
      });
      return;
    }

    if (!wallet) {
      toast({
        title: "No Wallet",
        description: "Please generate a Bitcoin wallet first",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to convert earnings",
        variant: "destructive",
      });
      return;
    }

    setConverting(true);
    try {
      console.log('=== DEBUGGING CONVERT TO BTC ===');
      console.log('User object:', user);
      console.log('User ID:', user?.id);
      console.log('Wallet object:', wallet);
      console.log('Wallet address:', wallet?.address);
      console.log('Earnings object:', earnings);
      
      if (!user?.id) {
        console.error('USER ID IS MISSING!');
        toast({
          title: "User ID Missing",
          description: "User authentication ID not found. Please refresh and try again.",
          variant: "destructive",
        });
        return;
      }
      
      if (!wallet?.address) {
        console.error('WALLET ADDRESS IS MISSING!');
        toast({
          title: "Wallet Address Missing", 
          description: "Bitcoin wallet address not found. Please generate a wallet first.",
          variant: "destructive",
        });
        return;
      }

      console.log('Converting earnings to Bitcoin:', {
        totalUSD: earnings.totalUSD,
        btcAmount: earnings.btcEquivalent,
        userWallet: wallet.address
      });

      console.log('About to call convert-earnings-to-btc with:', {
        userWalletAddress: wallet.address,
        userId: user.id
      });

      const requestPayload = {
        userWalletAddress: wallet.address,
        userId: user.id
      };
      
      console.log('EXACT REQUEST PAYLOAD BEING SENT:', JSON.stringify(requestPayload, null, 2));
      
      const { data, error } = await supabase.functions.invoke('convert-earnings-to-btc', {
        body: requestPayload
      });

      console.log('Function response received:', { data, error });

      if (error) {
        console.error('Supabase function error details:', error);
        console.error('Error type:', typeof error);
        console.error('Error keys:', Object.keys(error));
        console.error('Full error object:', JSON.stringify(error, null, 2));
        
        // Log each key individually
        Object.keys(error).forEach(key => {
          console.error(`Error[${key}]:`, error[key]);
        });
        
        toast({
          title: "Conversion Failed",
          description: `Function error: ${error.message || 'Unknown function error'}. Check console for details.`,
          variant: "destructive",
        });
        return;
      }

      if (!data) {
        toast({
          title: "Conversion Failed",
          description: "No response data received from function",
          variant: "destructive",
        });
        return;
      }

      if (!data.success) {
        console.error('Function returned failure:', data);
        toast({
          title: "Conversion Failed",
          description: data.error || data.message || "Unknown error from function",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Bitcoin Conversion Successful! 🎉",
        description: `${data.btcAmount.toFixed(8)} BTC sent to your wallet`,
      });

      // Reset earnings display
      setEarnings(null);
      
      // Trigger balance update to show new Bitcoin in wallet
      if (onBalanceUpdate) {
        setTimeout(onBalanceUpdate, 2000); // Wait a bit for the transaction to propagate
      }

    } catch (error) {
      console.error('Unexpected error during conversion:', error);
      toast({
        title: "Conversion Failed",
        description: `Unexpected error: ${error.message || 'Unknown error'}`,
        variant: "destructive",
      });
    } finally {
      setConverting(false);
    }
  };

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Convert Earnings to Bitcoin
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Please log in to convert your commission earnings to Bitcoin.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!wallet) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Convert Earnings to Bitcoin
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Please generate a Bitcoin wallet first to receive your converted earnings.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-green-200">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            Convert Earnings to Bitcoin
          </span>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={calculateEarnings} 
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground">
          Convert your commission earnings to Bitcoin sent directly to your wallet
        </div>

        {earnings ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="text-sm text-muted-foreground">Available Earnings</div>
                <div className="text-2xl font-bold text-green-600">
                  ${earnings.totalUSD.toFixed(2)}
                </div>
                <div className="text-xs text-muted-foreground">
                  {earnings.commissionsCount} unpaid commission{earnings.commissionsCount !== 1 ? 's' : ''}
                </div>
              </div>
              
              <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
                <div className="text-sm text-muted-foreground">Bitcoin Equivalent</div>
                <div className="text-2xl font-bold text-orange-600">
                  {earnings.btcEquivalent.toFixed(8)} BTC
                </div>
                <div className="text-xs text-muted-foreground">
                  @ ${earnings.btcPrice.toLocaleString()}
                </div>
              </div>
            </div>

            {earnings.totalUSD > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <DollarSign className="h-4 w-4" />
                  <ArrowRight className="h-4 w-4" />
                  <Bitcoin className="h-4 w-4" />
                  <span>Converts to your wallet: {wallet.address.slice(0, 8)}...{wallet.address.slice(-8)}</span>
                </div>

                <div className="p-3 bg-blue-50 rounded-md border border-blue-200">
                  <p className="text-sm text-blue-800">
                    <strong>How it works:</strong> Your commission earnings will be converted to Bitcoin 
                    at the current market rate and sent directly to your wallet. You can then withdraw 
                    this Bitcoin to any address you choose.
                  </p>
                </div>

                <Button 
                  onClick={convertToBitcoin}
                  disabled={converting}
                  className="w-full bg-gradient-to-r from-green-600 to-orange-600 hover:from-green-700 hover:to-orange-700"
                  size="lg"
                >
                  {converting ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Converting to Bitcoin...
                    </>
                  ) : (
                    <>
                      <Bitcoin className="h-4 w-4 mr-2" />
                      Convert ${earnings.totalUSD.toFixed(2)} to Bitcoin
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-muted-foreground">No unpaid earnings available for conversion</p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center">
            <Button onClick={calculateEarnings} disabled={loading} variant="outline">
              {loading ? "Calculating..." : "Check Available Earnings"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EarningsPayoutConverter;