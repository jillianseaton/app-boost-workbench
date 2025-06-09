import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Wallet, RefreshCw, Send, Copy, ArrowUpRight } from 'lucide-react';
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

const BitcoinWallet: React.FC = () => {
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [balance, setBalance] = useState<BalanceData | null>(null);
  const [loading, setLoading] = useState(false);
  const [recipientAddress, setRecipientAddress] = useState('');
  const [amountSats, setAmountSats] = useState('');
  const [sendLoading, setSendLoading] = useState(false);
  const [selectedExchange, setSelectedExchange] = useState('');
  const { toast } = useToast();

  // Popular exchange testnet addresses for quick selection
  const exchangeWallets = [
    { name: 'Coinbase (Testnet)', address: 'tb1qw508d6qejxtdg4y5r3zarvary0c5xw7kxpjzsx' },
    { name: 'Binance (Testnet)', address: 'tb1qrp33g013s6g2s4q6fqfqcbx8dfgfqd3xw8zhvc' },
    { name: 'Kraken (Testnet)', address: 'tb1qqqqqp0whnp6x8s3y5vqh4q4z9p7z5z8p5t4q3' },
    { name: 'Custom Exchange', value: 'custom' }
  ];

  const generateWallet = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-wallet');
      
      if (error) throw error;
      
      console.log('Generated wallet:', data);
      setWallet(data);
      setBalance(null); // Reset balance when generating new wallet
      
      toast({
        title: "Wallet Generated!",
        description: "Your new Bitcoin testnet wallet has been created.",
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
        title: "Transaction Sent!",
        description: `TXID: ${data.txid}`,
      });
      
      // Clear form and refresh balance
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

  const withdrawToExchange = async () => {
    if (!wallet || !balance || !recipientAddress) {
      toast({
        title: "Error",
        description: "Please select an exchange and ensure you have a balance",
        variant: "destructive",
      });
      return;
    }

    // Calculate amount to send (leave some for fees)
    const feeReserve = 1000; // Reserve 1000 sats for fees
    const sendAmount = Math.max(0, balance.balanceSats - feeReserve);

    if (sendAmount <= 0) {
      toast({
        title: "Insufficient Balance",
        description: "Not enough balance to cover transaction fees",
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
          amountSats: sendAmount
        }
      });
      
      if (error) throw error;
      
      toast({
        title: "Withdrawal Successful!",
        description: `Sent ${sendAmount} sats to exchange. TXID: ${data.txid}`,
      });
      
      // Refresh balance
      await getBalance();
      
    } catch (error) {
      console.error('Error withdrawing to exchange:', error);
      toast({
        title: "Withdrawal Failed",
        description: `${error.message}`,
        variant: "destructive",
      });
    } finally {
      setSendLoading(false);
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
      {/* Wallet Generation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Bitcoin Testnet Wallet
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!wallet ? (
            <Button onClick={generateWallet} disabled={loading} className="w-full">
              {loading ? "Generating..." : "Generate New Wallet"}
            </Button>
          ) : (
            <div className="space-y-4">
              <Alert>
                <AlertDescription>
                  <strong>⚠️ Important:</strong> This is a testnet wallet. Save your private key securely - it cannot be recovered!
                </AlertDescription>
              </Alert>
              
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

      {/* Balance */}
      {wallet && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Wallet Balance</span>
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

      {/* Exchange Withdrawal */}
      {wallet && balance && balance.balanceSats > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowUpRight className="h-5 w-5" />
              Withdraw to Exchange
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Exchange</label>
              <Select value={selectedExchange} onValueChange={handleExchangeSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose an exchange or enter custom address" />
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

            {(selectedExchange === 'custom' || selectedExchange === '') && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Exchange Wallet Address</label>
                <Input 
                  value={recipientAddress}
                  onChange={(e) => setRecipientAddress(e.target.value)}
                  placeholder="Enter exchange testnet address"
                  className="font-mono"
                />
              </div>
            )}

            {selectedExchange && selectedExchange !== 'custom' && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Selected Exchange Address</label>
                <div className="p-2 bg-muted rounded-md">
                  <p className="font-mono text-xs break-all">{recipientAddress}</p>
                </div>
              </div>
            )}

            <div className="p-3 bg-blue-50 rounded-md">
              <p className="text-sm text-blue-800">
                <strong>Withdrawal Amount:</strong> {balance.balanceSats - 1000} sats 
                <br />
                <span className="text-xs">(1000 sats reserved for transaction fees)</span>
              </p>
            </div>

            <Button 
              onClick={withdrawToExchange} 
              disabled={sendLoading || !recipientAddress || balance.balanceSats <= 1000}
              className="w-full"
            >
              {sendLoading ? "Processing Withdrawal..." : "Withdraw All to Exchange"}
            </Button>

            <Alert>
              <AlertDescription>
                This will send your entire balance (minus fees) to the selected exchange address. 
                Make sure the address is correct!
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

      {/* Manual Send BTC */}
      {wallet && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              Send Bitcoin (Manual)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Recipient Address</label>
              <Input 
                value={recipientAddress}
                onChange={(e) => setRecipientAddress(e.target.value)}
                placeholder="Enter testnet address (starts with m, n, or tb1)"
                className="font-mono"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Amount (satoshis)</label>
              <Input 
                type="number"
                value={amountSats}
                onChange={(e) => setAmountSats(e.target.value)}
                placeholder="Enter amount in satoshis"
                min="1"
              />
              <p className="text-xs text-muted-foreground">
                1 BTC = 100,000,000 satoshis
              </p>
            </div>
            
            <Button 
              onClick={sendBTC} 
              disabled={sendLoading || !recipientAddress || !amountSats}
              className="w-full"
            >
              {sendLoading ? "Sending..." : "Send Bitcoin"}
            </Button>
            
            <Alert>
              <AlertDescription>
                This will create and broadcast a real transaction on Bitcoin testnet. 
                Make sure the recipient address is correct!
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BitcoinWallet;
