
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { RefreshCw, Bitcoin } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface EarningsData {
  totalEarnings: number;
  btcEquivalent: number;
  btcPrice: number;
}

interface WalletData {
  address: string;
  privateKey: string;
  network: string;
}

interface EarningsConverterProps {
  wallet: WalletData | null;
}

const EarningsConverter: React.FC<EarningsConverterProps> = ({ wallet }) => {
  const [earnings, setEarnings] = useState<EarningsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [recipientAddress, setRecipientAddress] = useState('');
  const { toast } = useToast();

  const getEarningsInBTC = async () => {
    setLoading(true);
    try {
      // Get commissions
      const { data: commissions, error: commissionsError } = await supabase
        .from('commissions')
        .select('amount_earned_cents')
        .eq('paid_out', false);
      
      if (commissionsError) throw commissionsError;
      
      // Calculate total USD earnings from commissions
      const totalCents = commissions?.reduce((sum, commission) => sum + commission.amount_earned_cents, 0) || 0;
      let totalUSD = totalCents / 100;

      // Get affiliate earnings
      try {
        const { data: earningsData } = await supabase.functions.invoke('income-affiliate', {
          body: {
            action: 'calculate_earnings',
            data: {
              affiliateId: 'YOUR_AFFILIATE_ID',
              timeframe: 'monthly'
            }
          }
        });
        
        // Add affiliate earnings to total
        if (earningsData?.earnings?.total) {
          totalUSD += parseFloat(earningsData.earnings.total);
        }
      } catch (affiliateError) {
        console.log('No affiliate earnings found:', affiliateError);
      }
      
      // Get BTC price
      const { data: priceData, error: priceError } = await supabase.functions.invoke('get-btc-price');
      
      if (priceError) throw priceError;
      
      const btcPrice = priceData.price;
      const btcEquivalent = totalUSD / btcPrice;
      
      setEarnings({
        totalEarnings: totalUSD,
        btcEquivalent,
        btcPrice
      });
      
      toast({
        title: "Earnings Converted",
        description: `$${totalUSD.toFixed(2)} = ${btcEquivalent.toFixed(8)} BTC`,
      });
    } catch (error) {
      console.error('Error getting earnings:', error);
      toast({
        title: "Error",
        description: `Failed to convert earnings: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const convertEarningsToBTC = async () => {
    if (!earnings || earnings.totalEarnings === 0) {
      toast({
        title: "No Earnings",
        description: "You don't have any USD earnings to convert",
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

    if (!recipientAddress) {
      toast({
        title: "No Recipient Address",
        description: "Please enter a Bitcoin address to receive the funds",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Convert BTC amount to satoshis
      const amountSats = Math.floor(earnings.btcEquivalent * 100000000);

      if (amountSats < 1000) {
        throw new Error("Amount too small - minimum 1000 satoshis required");
      }

      console.log('Processing real Bitcoin transaction:', {
        recipientAddress,
        amountSats,
        btcAmount: earnings.btcEquivalent
      });

      // Send actual Bitcoin transaction
      const { data: txData, error: txError } = await supabase.functions.invoke('send-btc', {
        body: {
          privateKeyWIF: wallet.privateKey,
          recipientAddress,
          amountSats
        }
      });

      if (txError) throw txError;

      console.log('Bitcoin transaction successful:', txData);

      // Only mark earnings as paid AFTER successful Bitcoin transaction
      const { error: commissionsError } = await supabase
        .from('commissions')
        .update({ 
          paid_out: true, 
          paid_at: new Date().toISOString(),
          description: `Paid out as Bitcoin - TXID: ${txData.txid}`
        })
        .eq('paid_out', false);
      
      if (commissionsError) {
        console.error('Error updating commissions after successful Bitcoin tx:', commissionsError);
        // Don't throw here since Bitcoin was sent successfully
      }

      // Process affiliate earnings payout
      try {
        await supabase.functions.invoke('income-affiliate', {
          body: {
            action: 'process_payout',
            data: {
              affiliateId: 'YOUR_AFFILIATE_ID',
              amount: earnings.totalEarnings,
              paymentMethod: 'bitcoin',
              txid: txData.txid
            }
          }
        });
      } catch (affiliateError) {
        console.log('No affiliate earnings to process:', affiliateError);
      }
      
      toast({
        title: "Bitcoin Sent Successfully!",
        description: `Sent ${earnings.btcEquivalent.toFixed(8)} BTC to ${recipientAddress}. TXID: ${txData.txid}`,
      });
      
      // Reset form
      setEarnings(null);
      setRecipientAddress('');
      
    } catch (error) {
      console.error('Error processing Bitcoin payout:', error);
      toast({
        title: "Bitcoin Transaction Failed",
        description: `Failed to send Bitcoin: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!wallet) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bitcoin className="h-5 w-5" />
            Convert USD Earnings to BTC
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Please generate a Bitcoin wallet first to convert your earnings to Bitcoin.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Bitcoin className="h-5 w-5" />
            Convert USD Earnings to BTC
          </span>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={getEarningsInBTC} 
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {earnings ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-lg font-semibold">USD Earnings: ${earnings.totalEarnings.toFixed(2)}</p>
              <p className="text-xl font-bold text-orange-600">{earnings.btcEquivalent.toFixed(8)} BTC</p>
              <p className="text-sm text-muted-foreground">
                BTC Price: ${earnings.btcPrice.toLocaleString()}
              </p>
            </div>
            
            {earnings.totalEarnings > 0 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Bitcoin Address (Recipient)</label>
                  <Input 
                    value={recipientAddress}
                    onChange={(e) => setRecipientAddress(e.target.value)}
                    placeholder="Enter Bitcoin address to receive funds"
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    This should be your personal Bitcoin address or exchange deposit address
                  </p>
                </div>
                
                <div className="p-3 bg-orange-50 rounded-md border border-orange-200">
                  <p className="text-sm text-orange-800">
                    <strong>Warning:</strong> This will send real Bitcoin to the address above. 
                    Make sure the address is correct and belongs to you.
                  </p>
                </div>
                
                <Button 
                  onClick={convertEarningsToBTC} 
                  disabled={loading || !recipientAddress}
                  className="w-full"
                >
                  {loading ? "Sending Bitcoin..." : `Send ${earnings.btcEquivalent.toFixed(8)} BTC`}
                </Button>
              </div>
            )}
          </div>
        ) : (
          <p className="text-muted-foreground">Click refresh to check your USD earnings</p>
        )}
      </CardContent>
    </Card>
  );
};

export default EarningsConverter;
