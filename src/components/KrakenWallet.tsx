import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { 
  TrendingUp, 
  Wallet, 
  Send, 
  Download, 
  RefreshCw, 
  Eye, 
  EyeOff,
  Shield,
  AlertTriangle,
  ExternalLink,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface KrakenBalance {
  [currency: string]: string;
}

interface KrakenAccount {
  connected: boolean;
  balances: KrakenBalance;
  tradeFee: number;
  verification: 'unverified' | 'intermediate' | 'pro';
}

interface WithdrawalMethod {
  method: string;
  limit: string;
  fee: string;
  processingTime: string;
}

const KrakenWallet: React.FC = () => {
  const [account, setAccount] = useState<KrakenAccount | null>(null);
  const [loading, setLoading] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const [showSecrets, setShowSecrets] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawCurrency, setWithdrawCurrency] = useState('BTC');
  const [withdrawAddress, setWithdrawAddress] = useState('');
  const [withdrawMethod, setWithdrawMethod] = useState('bitcoin');
  const [connectionError, setConnectionError] = useState<string>('');
  const { toast } = useToast();

  const withdrawalMethods: WithdrawalMethod[] = [
    {
      method: 'bitcoin',
      limit: '10,000 USD/day',
      fee: '0.0005 BTC',
      processingTime: '0-60 minutes'
    },
    {
      method: 'wire_transfer',
      limit: '100,000 USD/day',
      fee: '25 USD',
      processingTime: '1-3 business days'
    },
    {
      method: 'ach',
      limit: '50,000 USD/day',
      fee: '5 USD',
      processingTime: '1-2 business days'
    }
  ];

  const validateApiCredentials = () => {
    if (!apiKey.trim() || !apiSecret.trim()) {
      setConnectionError('Both API key and secret are required');
      return false;
    }

    if (apiKey.length < 50) {
      setConnectionError('API key appears too short. Please check your Kraken API key.');
      return false;
    }

    if (apiSecret.length < 80) {
      setConnectionError('API secret appears too short. Please check your Kraken API secret.');
      return false;
    }

    // Check for common issues
    if (apiKey.includes(' ') || apiSecret.includes(' ')) {
      setConnectionError('API credentials should not contain spaces. Please check for copy/paste errors.');
      return false;
    }

    setConnectionError('');
    return true;
  };

  const connectKraken = async () => {
    if (!validateApiCredentials()) {
      return;
    }

    setLoading(true);
    setConnectionError('');
    
    try {
      console.log('Connecting to Kraken with API key:', apiKey.substring(0, 8) + '...');
      
      const { data, error } = await supabase.functions.invoke('kraken-api', {
        body: {
          action: 'connect',
          apiKey: apiKey.trim(),
          apiSecret: apiSecret.trim()
        }
      });

      console.log('Supabase function response:', { data, error });

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(`Connection error: ${error.message}`);
      }

      if (data?.error) {
        console.error('Kraken API error:', data.error);
        throw new Error(data.error);
      }

      if (!data?.connected) {
        throw new Error('Connection failed - no data returned');
      }

      console.log('Kraken connection successful:', data);
      
      setAccount({
        connected: true,
        balances: data.balances || {},
        tradeFee: data.tradeFee || 0.26,
        verification: data.verification || 'intermediate'
      });

      toast({
        title: "Kraken Connected!",
        description: "Successfully connected to your Kraken account",
      });

      setConnectionError('');
    } catch (error: any) {
      console.error('Connection error:', error);
      const errorMessage = error.message || "Unable to connect to Kraken. Please check your API credentials.";
      setConnectionError(errorMessage);
      
      toast({
        title: "Connection Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshBalances = async () => {
    if (!account) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('kraken-api', {
        body: {
          action: 'balances',
          apiKey,
          apiSecret
        }
      });

      if (error) {
        throw new Error(error.message || 'Failed to refresh balances');
      }

      if (data.error) {
        throw new Error(data.error);
      }
      
      setAccount(prev => prev ? {
        ...prev,
        balances: data.balances
      } : null);
      
      toast({
        title: "Balances Updated",
        description: "Account balances refreshed successfully",
      });
    } catch (error) {
      console.error('Refresh balances error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to refresh balances",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const withdrawFunds = async () => {
    if (!account || !withdrawAmount || !withdrawAddress) {
      toast({
        title: "Missing Information",
        description: "Please fill in all withdrawal fields",
        variant: "destructive",
      });
      return;
    }

    const confirmed = window.confirm(
      `⚠️ REAL WITHDRAWAL WARNING ⚠️\n\n` +
      `You are about to withdraw ${withdrawAmount} ${withdrawCurrency} from your Kraken account.\n` +
      `This is a REAL transaction that cannot be reversed.\n\n` +
      `Destination: ${withdrawAddress}\n` +
      `Method: ${withdrawMethod}\n\n` +
      `Are you absolutely sure you want to proceed?`
    );

    if (!confirmed) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('kraken-api', {
        body: {
          action: 'withdraw',
          apiKey,
          apiSecret,
          asset: withdrawCurrency,
          amount: withdrawAmount,
          address: withdrawAddress,
          method: withdrawMethod
        }
      });

      if (error) {
        throw new Error(error.message || 'Withdrawal failed');
      }

      if (data.error) {
        throw new Error(data.error);
      }

      toast({
        title: "Withdrawal Initiated!",
        description: `Withdrawal of ${withdrawAmount} ${withdrawCurrency} has been submitted. Reference: ${data.refid}`,
      });

      // Clear form
      setWithdrawAmount('');
      setWithdrawAddress('');
      
      // Refresh balances
      await refreshBalances();
    } catch (error) {
      console.error('Withdrawal error:', error);
      toast({
        title: "Withdrawal Failed",
        description: error.message || "Unable to process withdrawal",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatBalance = (balance: string) => {
    const num = parseFloat(balance);
    return num > 0.001 ? num.toFixed(8) : num.toExponential(2);
  };

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Kraken Exchange Integration
            {account?.connected && <CheckCircle className="h-5 w-5 text-green-500" />}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              <strong>Real Kraken Integration:</strong> This connects to your actual Kraken account for live trading and withdrawals.
              Never share your API credentials with anyone.
            </AlertDescription>
          </Alert>

          {!account ? (
            <div className="space-y-4">
              {connectionError && (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>{connectionError}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label>Kraken API Key</Label>
                <div className="relative">
                  <Input 
                    type={showSecrets ? "text" : "password"}
                    value={apiKey}
                    onChange={(e) => {
                      setApiKey(e.target.value);
                      setConnectionError('');
                    }}
                    placeholder="Enter your Kraken API key (starts with letters/numbers)"
                    className="pr-10"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowSecrets(!showSecrets)}
                  >
                    {showSecrets ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Should be ~56 characters long
                </p>
              </div>

              <div className="space-y-2">
                <Label>Kraken API Secret</Label>
                <Input 
                  type={showSecrets ? "text" : "password"}
                  value={apiSecret}
                  onChange={(e) => {
                    setApiSecret(e.target.value);
                    setConnectionError('');
                  }}
                  placeholder="Enter your Kraken API secret (long base64 string)"
                />
                <p className="text-xs text-muted-foreground">
                  Should be ~88 characters long
                </p>
              </div>

              <Alert>
                <AlertDescription>
                  Generate API credentials at: 
                  <a href="https://www.kraken.com/u/security/api" target="_blank" rel="noopener noreferrer" className="ml-1 text-blue-600 hover:underline">
                    Kraken API Settings <ExternalLink className="h-3 w-3 inline" />
                  </a>
                  <br />
                  <strong>Required permissions:</strong> Query Funds, Withdraw Funds, Trade
                  <br />
                  <strong>Note:</strong> API keys may take a few minutes to become active after creation.
                </AlertDescription>
              </Alert>
              
              <Button 
                onClick={connectKraken} 
                disabled={loading || !apiKey || !apiSecret} 
                className="w-full"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Connecting to Kraken...
                  </>
                ) : (
                  "Connect Kraken Account"
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="default" className="bg-green-500">Connected</Badge>
                  <Badge variant="secondary">Verification: {account.verification}</Badge>
                  <Badge variant="outline">Fee: {account.tradeFee}%</Badge>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={refreshBalances} 
                  disabled={loading}
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Account Balances */}
      {account && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              Account Balances
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Object.entries(account.balances).map(([currency, balance]) => {
                const balanceNum = parseFloat(balance);
                if (balanceNum <= 0) return null;
                
                return (
                  <div key={currency} className="p-3 bg-muted rounded-lg">
                    <div className="font-medium">{currency}</div>
                    <div className="text-sm text-muted-foreground">
                      {formatBalance(balance)}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Withdrawal Section */}
      {account && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              Withdraw Funds
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="crypto" className="space-y-4">
              <TabsList>
                <TabsTrigger value="crypto">Cryptocurrency</TabsTrigger>
                <TabsTrigger value="fiat">Fiat (USD)</TabsTrigger>
              </TabsList>

              <TabsContent value="crypto" className="space-y-4">
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Real Bitcoin Withdrawal:</strong> This will withdraw actual cryptocurrency from your Kraken account.
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Currency</Label>
                    <Select value={withdrawCurrency} onValueChange={setWithdrawCurrency}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BTC">Bitcoin (BTC)</SelectItem>
                        <SelectItem value="ETH">Ethereum (ETH)</SelectItem>
                        <SelectItem value="LTC">Litecoin (LTC)</SelectItem>
                        <SelectItem value="XRP">Ripple (XRP)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Amount</Label>
                    <Input 
                      type="number"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      placeholder="0.00000000"
                      step="0.00000001"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Withdrawal Address</Label>
                  <Input 
                    value={withdrawAddress}
                    onChange={(e) => setWithdrawAddress(e.target.value)}
                    placeholder="Enter cryptocurrency address"
                    className="font-mono text-sm"
                  />
                </div>

                <Button 
                  onClick={withdrawFunds} 
                  disabled={loading || !withdrawAmount || !withdrawAddress}
                  className="w-full"
                  variant="destructive"
                >
                  {loading ? "Processing..." : `Withdraw ${withdrawAmount} ${withdrawCurrency}`}
                </Button>
              </TabsContent>

              <TabsContent value="fiat" className="space-y-4">
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Real Bank Withdrawal:</strong> This will transfer actual USD to your bank account.
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <Label>Withdrawal Method</Label>
                  <Select value={withdrawMethod} onValueChange={setWithdrawMethod}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="wire_transfer">Wire Transfer</SelectItem>
                      <SelectItem value="ach">ACH Transfer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Amount (USD)</Label>
                  <Input 
                    type="number"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder="0.00"
                    step="0.01"
                  />
                </div>

                <Button 
                  onClick={withdrawFunds} 
                  disabled={loading || !withdrawAmount}
                  className="w-full"
                  variant="destructive"
                >
                  {loading ? "Processing..." : `Withdraw $${withdrawAmount} USD`}
                </Button>
              </TabsContent>
            </Tabs>

            {/* Withdrawal Methods Info */}
            <div className="mt-6 space-y-2">
              <h4 className="font-medium">Withdrawal Methods & Limits</h4>
              <div className="space-y-2">
                {withdrawalMethods.map((method) => (
                  <div key={method.method} className="text-sm p-3 bg-muted rounded-lg">
                    <div className="font-medium capitalize">{method.method.replace('_', ' ')}</div>
                    <div className="text-muted-foreground">
                      Limit: {method.limit} | Fee: {method.fee} | Time: {method.processingTime}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default KrakenWallet;
