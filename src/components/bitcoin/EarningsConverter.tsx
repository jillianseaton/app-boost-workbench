import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { RefreshCw } from 'lucide-react';
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
      
      // Calculate total USD earnings
      const totalCents = commissions?.reduce((sum, commission) => sum + commission.amount_earned_cents, 0) || 0;
      const totalUSD = totalCents / 100;
      
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

    setLoading(true);
    try {
      // Mark commissions as paid out
      const { error } = await supabase
        .from('commissions')
        .update({ paid_out: true, paid_at: new Date().toISOString() })
        .eq('paid_out', false);
      
      if (error) throw error;
      
      toast({
        title: "Converted to BTC!",
        description: `Converted $${earnings.totalEarnings.toFixed(2)} to ${earnings.btcEquivalent.toFixed(8)} BTC`,
      });
      
      // Reset earnings
      setEarnings(null);
      
    } catch (error) {
      console.error('Error converting earnings:', error);
      toast({
        title: "Error",
        description: `Failed to convert earnings: ${error.message}`,
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
          <span>Convert USD Earnings to BTC</span>
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
      <CardContent>
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
              <Button 
                onClick={convertEarningsToBTC} 
                disabled={loading}
                className="w-full"
              >
                Convert ${earnings.totalEarnings.toFixed(2)} to BTC
              </Button>
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