import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { ArrowUpRight, Send } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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

interface BitcoinWithdrawalProps {
  wallet: WalletData | null;
  balance: BalanceData | null;
  onBalanceUpdate: () => void;
}

const BitcoinWithdrawal: React.FC<BitcoinWithdrawalProps> = ({
  wallet,
  balance,
  onBalanceUpdate,
}) => {
  const [recipientAddress, setRecipientAddress] = useState('');
  const [amountSats, setAmountSats] = useState('');
  const [sendLoading, setSendLoading] = useState(false);
  const [selectedExchange, setSelectedExchange] = useState('');
  const { toast } = useToast();

  const exchangeWallets = [
    { name: 'Coinbase', address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa' },
    { name: 'Binance', address: '1NDyJtNTjmwk5xPNhjgAMu4HDHigtobu1s' },
    { name: 'Kraken', address: '1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2' },
    { name: 'Custom Exchange', value: 'custom' }
  ];

  const handleExchangeSelect = (value: string) => {
    setSelectedExchange(value);
    if (value !== 'custom') {
      const exchange = exchangeWallets.find(e => e.address === value);
      if (exchange) {
        setRecipientAddress(exchange.address);
      }
    } else {
      setRecipientAddress('');
    }
  };

  const sendBTC = async () => {
    if (!wallet || !recipientAddress || !amountSats) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setSendLoading(true);
    try {
      const requestData = {
        privateKeyWIF: wallet.privateKey,
        recipientAddress,
        amountSats: parseInt(amountSats)
      };
      
      console.log('Sending request to send-btc:', requestData);
      
      const { data, error } = await supabase.functions.invoke('send-btc', {
        body: requestData
      });
      
      if (error) throw error;
      
      console.log('Transaction result:', data);
      
      toast({
        title: "Bitcoin Sent!",
        description: `TXID: ${data.txid}`,
      });
      
      setRecipientAddress('');
      setAmountSats('');
      setSelectedExchange('');
      onBalanceUpdate();
      
    } catch (error) {
      console.error('Error sending BTC:', error);
      toast({
        title: "Transaction Failed",
        description: `${error.message}`,
        variant: "destructive",
      });
    } finally {
      setSendLoading(false);
    }
  };

  if (!wallet) return null;

  return (
    <div className="space-y-6">
      {/* Quick Exchange Withdrawal */}
      {balance && balance.balanceSats > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowUpRight className="h-5 w-5" />
              Quick Withdrawal to Exchange
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Exchange</label>
              <Select value={selectedExchange} onValueChange={handleExchangeSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose exchange" />
                </SelectTrigger>
                <SelectContent>
                  {exchangeWallets.map((exchange) => (
                    <SelectItem key={exchange.address || exchange.value} value={exchange.address || exchange.value}>
                      {exchange.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedExchange === 'custom' && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Custom Address</label>
                <Input 
                  value={recipientAddress}
                  onChange={(e) => setRecipientAddress(e.target.value)}
                  placeholder="Enter Bitcoin address"
                  className="font-mono"
                />
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">Amount (satoshis)</label>
              <Input 
                type="number"
                value={amountSats}
                onChange={(e) => setAmountSats(e.target.value)}
                placeholder={`Max: ${balance.balanceSats - 1000} sats`}
                min="1"
                max={balance.balanceSats - 1000}
              />
            </div>

            <Button 
              onClick={sendBTC} 
              disabled={sendLoading || !recipientAddress || !amountSats}
              className="w-full"
            >
              <Send className="h-4 w-4 mr-2" />
              {sendLoading ? "Sending..." : "Send Bitcoin"}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BitcoinWithdrawal;