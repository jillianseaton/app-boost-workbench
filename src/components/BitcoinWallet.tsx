import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Wallet, RefreshCw, Send, Copy } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { supabase } from '@/integrations/supabase/client';

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
  const { toast } = useToast();

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

      {/* Send BTC */}
      {wallet && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              Send Bitcoin
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
