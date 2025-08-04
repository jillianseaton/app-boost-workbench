import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

const RAILWAY_BASE_URL = 'https://zoological-liberation.up.railway.app';

export const StripeMarketplace = () => {
  const [businessName, setBusinessName] = useState('');
  const [productName, setProductName] = useState('');
  const [amount, setAmount] = useState('');
  const [connectedAccountId, setConnectedAccountId] = useState('');
  const [loading, setLoading] = useState(false);

  const createConnectedAccount = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${RAILWAY_BASE_URL}/api/stripe/create-account`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessName }),
      });
      
      const data = await response.json();
      if (response.ok) {
        setConnectedAccountId(data.accountId);
        toast.success('Connected account created!');
        
        // Immediately create onboarding link
        const linkResponse = await fetch(`${RAILWAY_BASE_URL}/api/stripe/create-account-link`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ accountId: data.accountId }),
        });
        
        const linkData = await linkResponse.json();
        if (linkResponse.ok) {
          window.open(linkData.url, '_blank');
          toast.success('Onboarding link opened in new tab');
        }
      } else {
        toast.error(data.error || 'Failed to create account');
      }
    } catch (error) {
      toast.error('Network error occurred');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const createMarketplaceCheckout = async () => {
    if (!connectedAccountId || !productName || !amount) {
      toast.error('Please fill in all fields and create a connected account first');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${RAILWAY_BASE_URL}/api/stripe/create-marketplace-checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          connectedAccountId,
          amount: parseInt(amount) * 100, // Convert to cents
          productName,
        }),
      });
      
      const data = await response.json();
      if (response.ok) {
        window.open(data.url, '_blank');
        toast.success('Checkout opened in new tab');
      } else {
        toast.error(data.error || 'Failed to create checkout');
      }
    } catch (error) {
      toast.error('Network error occurred');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle>Stripe Marketplace Setup</CardTitle>
          <CardDescription>
            Create connected accounts and process marketplace payments
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Business Name</label>
            <Input
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="Enter business name"
            />
          </div>
          
          <Button 
            onClick={createConnectedAccount} 
            disabled={loading || !businessName}
            className="w-full"
          >
            {loading ? 'Creating...' : 'Create Connected Account & Onboard'}
          </Button>

          {connectedAccountId && (
            <div className="p-3 bg-green-50 border border-green-200 rounded">
              <p className="text-sm text-green-700">
                ✅ Connected Account ID: <code className="font-mono">{connectedAccountId}</code>
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Create Marketplace Payment</CardTitle>
          <CardDescription>
            Process payments with application fees
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Product Name</label>
            <Input
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="Enter product name"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Amount (USD)</label>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount in dollars"
            />
          </div>
          
          <Button 
            onClick={createMarketplaceCheckout} 
            disabled={loading || !connectedAccountId || !productName || !amount}
            className="w-full"
          >
            {loading ? 'Creating...' : 'Create Marketplace Checkout'}
          </Button>

          {amount && (
            <div className="text-sm text-gray-600">
              <p>Platform fee (10%): ${(parseInt(amount) * 0.1).toFixed(2)}</p>
              <p>Seller receives: ${(parseInt(amount) * 0.9).toFixed(2)}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};