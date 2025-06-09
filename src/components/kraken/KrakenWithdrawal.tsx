
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Send, AlertTriangle } from 'lucide-react';

interface WithdrawalMethod {
  method: string;
  limit: string;
  fee: string;
  processingTime: string;
}

interface KrakenWithdrawalProps {
  loading: boolean;
  onWithdraw: (amount: string, currency: string, address: string, method: string) => Promise<void>;
}

const KrakenWithdrawal: React.FC<KrakenWithdrawalProps> = ({ loading, onWithdraw }) => {
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawCurrency, setWithdrawCurrency] = useState('BTC');
  const [withdrawAddress, setWithdrawAddress] = useState('');
  const [withdrawMethod, setWithdrawMethod] = useState('bitcoin');

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

  const handleWithdraw = async () => {
    await onWithdraw(withdrawAmount, withdrawCurrency, withdrawAddress, withdrawMethod);
    setWithdrawAmount('');
    setWithdrawAddress('');
  };

  return (
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
              onClick={handleWithdraw} 
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
              onClick={handleWithdraw} 
              disabled={loading || !withdrawAmount}
              className="w-full"
              variant="destructive"
            >
              {loading ? "Processing..." : `Withdraw $${withdrawAmount} USD`}
            </Button>
          </TabsContent>
        </Tabs>

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
  );
};

export default KrakenWithdrawal;
