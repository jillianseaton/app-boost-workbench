
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Globe, DollarSign } from 'lucide-react';
import { stripeAdvancedService } from '@/services/stripeAdvancedService';

const CurrencyCheckoutDemo: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [accountId, setAccountId] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [amount, setAmount] = useState('20.00');
  const [productName, setProductName] = useState('Sample Product');
  const { toast } = useToast();

  const currencies = [
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'GBP', name: 'British Pound', symbol: '£' },
    { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
    { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  ];

  const getPaymentMethodsForCurrency = (currencyCode: string) => {
    const methods: { [key: string]: string[] } = {
      USD: ['Cards', 'ACH Direct Debit', 'Affirm', 'Afterpay'],
      EUR: ['Cards', 'SEPA Direct Debit', 'iDEAL', 'Bancontact', 'Sofort', 'Giropay'],
      GBP: ['Cards', 'Bacs Direct Debit', 'Klarna'],
      CAD: ['Cards', 'Pre-authorized Debit'],
      AUD: ['Cards', 'BECS Direct Debit'],
      JPY: ['Cards', 'Konbini'],
    };
    return methods[currencyCode] || ['Cards'];
  };

  const handleCreateCheckout = async () => {
    if (!accountId.trim()) {
      toast({
        title: "Account ID Required",
        description: "Please enter a valid Stripe account ID.",
        variant: "destructive",
      });
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const amountInCents = Math.round(parseFloat(amount) * 100);
      
      const result = await stripeAdvancedService.createCurrencyCheckout({
        accountId: accountId.trim(),
        currency,
        amount: amountInCents,
        productName,
        successUrl: `${window.location.origin}/custom-stripe-onboarding?checkout=success`,
        cancelUrl: `${window.location.origin}/custom-stripe-onboarding?checkout=cancelled`,
      });

      if (result.success && result.data) {
        // Open checkout in a new tab
        window.open(result.data.url, '_blank');
        
        toast({
          title: "Checkout Created",
          description: "Checkout session opened in a new tab.",
        });
      } else {
        throw new Error(result.error || 'Failed to create checkout session');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        title: "Checkout Failed",
        description: error instanceof Error ? error.message : "Failed to create checkout session",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const selectedCurrency = currencies.find(c => c.code === currency);
  const availablePaymentMethods = getPaymentMethodsForCurrency(currency);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Currency-Based Checkout Demo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="accountId">Connected Account ID</Label>
            <Input
              id="accountId"
              placeholder="acct_xxxxxxxxxxxxx"
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select value={currency} onValueChange={setCurrency} disabled={loading}>
                <SelectTrigger>
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map((curr) => (
                    <SelectItem key={curr.code} value={curr.code}>
                      {curr.code} - {curr.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount ({selectedCurrency?.symbol})</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0.50"
                placeholder="20.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="productName">Product Name</Label>
            <Input
              id="productName"
              placeholder="Sample Product"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              disabled={loading}
            />
          </div>

          <Button onClick={handleCreateCheckout} disabled={loading || !accountId.trim()} className="w-full">
            {loading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating Checkout...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Create {currency} Checkout
              </div>
            )}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Available Payment Methods for {currency}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {availablePaymentMethods.map((method) => (
              <div key={method} className="p-2 bg-muted rounded text-sm text-center">
                {method}
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            Payment methods automatically adapt based on the selected currency and connected account's location.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default CurrencyCheckoutDemo;
