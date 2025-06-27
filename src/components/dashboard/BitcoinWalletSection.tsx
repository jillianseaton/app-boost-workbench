
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Bitcoin, Wallet, RefreshCw, Send, Copy, ArrowUpRight } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { supabase } from '@/integrations/supabase/client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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

const BitcoinWalletSection: React.FC = () => {
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [balance, setBalance] = useState<BalanceData | null>(null);
  const [loading, setLoading] = useState(false);
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

  const generateWallet = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-wallet');
      
      if (error) throw error;
      
      console.log('Generated wallet:', data);
      setWallet(data);
      setBalance(null);
      
      toast({
        title: "Bitcoin Wallet Generated!",
        description: "Your new Bitcoin wallet has been created.",
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

  const getBalance = async () => {
    if (!wallet) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('get-balance', {
        body: { address: wallet.address }
      });
      
      if (error) throw error;
      
      console.log('Balance data:', data);
      setBalance(data);
      
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
      const { data, error } = await supabase.functions.invoke('send-btc', {
        body: {
          privateKeyWIF: wallet.privateKey,
          recipientAddress,
          amountSats: parseInt(amountSats)
        }
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
      await getBalance();
      
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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Address copied to clipboard",
    });
  };

  return (
    <div className="space-y-6">
      {/* Bitcoin Wallet Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bitcoin className="h-5 w-5 text-orange-500" />
            Bitcoin Mainnet Wallet
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Generate a Bitcoin wallet to receive cryptocurrency payouts and manage your Bitcoin earnings directly from your dashboard.
          </p>
          
          {!wallet ? (
            <Button onClick={generateWallet} disabled={loading} className="w-full">
              <Wallet className="h-4 w-4 mr-2" />
              {loading ? "Generating..." : "Generate Bitcoin Wallet"}
            </Button>
          ) : (
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Bitcoin Address</label>
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
                  <QRCodeSVG value={wallet.address} size={100} />
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Balance Display */}
      {wallet && (
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
      )}

      {/* Quick Exchange Withdrawal */}
      {wallet && balance && balance.balanceSats > 0 && (
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

export default BitcoinWalletSection;
