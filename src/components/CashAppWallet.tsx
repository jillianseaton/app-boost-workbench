
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Smartphone, RefreshCw, Send, Copy, Link, DollarSign } from 'lucide-react';

interface CashAppAccount {
  cashtag: string;
  balance: number;
  connected: boolean;
}

const CashAppWallet: React.FC = () => {
  const [account, setAccount] = useState<CashAppAccount | null>(null);
  const [loading, setLoading] = useState(false);
  const [cashtag, setCashtag] = useState('');
  const [recipientCashtag, setRecipientCashtag] = useState('');
  const [amount, setAmount] = useState('');
  const [sendLoading, setSendLoading] = useState(false);
  const { toast } = useToast();

  const connectCashApp = async () => {
    if (!cashtag.startsWith('$')) {
      toast({
        title: "Invalid Cashtag",
        description: "Cashtag must start with $ (e.g., $yourname)",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Simulate API call to connect CashApp account
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock account data
      const mockAccount: CashAppAccount = {
        cashtag: cashtag,
        balance: Math.random() * 1000 + 50, // Random balance between $50-$1050
        connected: true
      };
      
      setAccount(mockAccount);
      
      toast({
        title: "CashApp Connected!",
        description: `Successfully connected ${cashtag}`,
      });
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: "Unable to connect to CashApp. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshBalance = async () => {
    if (!account) return;
    
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setAccount(prev => prev ? {
        ...prev,
        balance: Math.random() * 1000 + 50
      } : null);
      
      toast({
        title: "Balance Updated",
        description: `Current balance: $${account.balance.toFixed(2)}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to refresh balance",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const sendMoney = async () => {
    if (!account || !recipientCashtag || !amount) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    if (!recipientCashtag.startsWith('$')) {
      toast({
        title: "Invalid Cashtag",
        description: "Recipient cashtag must start with $ (e.g., $recipient)",
        variant: "destructive",
      });
      return;
    }

    const sendAmount = parseFloat(amount);
    if (sendAmount > account.balance) {
      toast({
        title: "Insufficient Balance",
        description: "You don't have enough funds for this transaction",
        variant: "destructive",
      });
      return;
    }

    setSendLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setAccount(prev => prev ? {
        ...prev,
        balance: prev.balance - sendAmount
      } : null);
      
      toast({
        title: "Money Sent!",
        description: `Successfully sent $${sendAmount.toFixed(2)} to ${recipientCashtag}`,
      });
      
      setRecipientCashtag('');
      setAmount('');
    } catch (error) {
      toast({
        title: "Transaction Failed",
        description: "Unable to send money. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSendLoading(false);
    }
  };

  const buyBitcoin = async () => {
    if (!account || !amount) {
      toast({
        title: "Error",
        description: "Please enter an amount to buy Bitcoin",
        variant: "destructive",
      });
      return;
    }

    const buyAmount = parseFloat(amount);
    if (buyAmount > account.balance) {
      toast({
        title: "Insufficient Balance",
        description: "You don't have enough funds to buy Bitcoin",
        variant: "destructive",
      });
      return;
    }

    setSendLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const btcPrice = 45000; // Mock BTC price
      const btcAmount = buyAmount / btcPrice;
      
      setAccount(prev => prev ? {
        ...prev,
        balance: prev.balance - buyAmount
      } : null);
      
      toast({
        title: "Bitcoin Purchased!",
        description: `Bought ${btcAmount.toFixed(8)} BTC for $${buyAmount.toFixed(2)}`,
      });
      
      setAmount('');
    } catch (error) {
      toast({
        title: "Purchase Failed",
        description: "Unable to buy Bitcoin. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSendLoading(false);
    }
  };

  const copyTag = () => {
    if (account) {
      navigator.clipboard.writeText(account.cashtag);
      toast({
        title: "Copied!",
        description: "Cashtag copied to clipboard",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Connection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            CashApp Integration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertDescription>
              <strong>Note:</strong> This is a demonstration integration. CashApp has limited public API access.
            </AlertDescription>
          </Alert>
          
          {!account ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Your Cashtag</label>
                <Input 
                  value={cashtag}
                  onChange={(e) => setCashtag(e.target.value)}
                  placeholder="$yourcashtag"
                  className="font-mono"
                />
              </div>
              
              <Button onClick={connectCashApp} disabled={loading || !cashtag} className="w-full">
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Connecting...
                  </>
                ) : (
                  <>
                    <Link className="h-4 w-4 mr-2" />
                    Connect CashApp
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Connected: {account.cashtag}</p>
                  <div className="flex items-center gap-2">
                    <p className="text-2xl font-bold">${account.balance.toFixed(2)}</p>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={copyTag}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={refreshBalance} 
                  disabled={loading}
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Send Money */}
      {account && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              Send Money
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Recipient Cashtag</label>
              <Input 
                value={recipientCashtag}
                onChange={(e) => setRecipientCashtag(e.target.value)}
                placeholder="$recipient"
                className="font-mono"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Amount ($)</label>
              <Input 
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                min="0.01"
                step="0.01"
              />
            </div>
            
            <Button 
              onClick={sendMoney} 
              disabled={sendLoading || !recipientCashtag || !amount}
              className="w-full"
            >
              {sendLoading ? "Sending..." : "Send Money"}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Buy Bitcoin */}
      {account && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Buy Bitcoin
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Amount to Spend ($)</label>
              <Input 
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                min="1"
                step="0.01"
              />
              <p className="text-xs text-muted-foreground">
                Current BTC price: ~$45,000 (demo price)
              </p>
            </div>
            
            <Button 
              onClick={buyBitcoin} 
              disabled={sendLoading || !amount}
              className="w-full"
            >
              {sendLoading ? "Processing..." : "Buy Bitcoin"}
            </Button>
            
            <Alert>
              <AlertDescription>
                Bitcoin purchases through CashApp would appear in your CashApp Bitcoin wallet.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CashAppWallet;
