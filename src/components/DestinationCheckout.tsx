
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ShoppingCart, ArrowLeft, DollarSign } from 'lucide-react';
import { useDestinationCheckout } from '@/hooks/useDestinationCheckout';

interface DestinationCheckoutProps {
  onBack?: () => void;
}

const DestinationCheckout: React.FC<DestinationCheckoutProps> = ({ onBack }) => {
  const [amount, setAmount] = useState<number>(50.00);
  const [description, setDescription] = useState('Marketplace Purchase');
  const [connectedAccountId, setConnectedAccountId] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [onBehalfOf, setOnBehalfOf] = useState(false);
  const [feePercentage, setFeePercentage] = useState(3);

  const { loading, createDestinationCheckout, calculatePlatformFee, formatAmount } = useDestinationCheckout();

  const amountInCents = Math.round(amount * 100);
  const platformFee = calculatePlatformFee(amountInCents, feePercentage);
  const connectedAccountAmount = amountInCents - platformFee;

  const handleCheckout = async () => {
    if (!connectedAccountId.trim()) {
      alert('Please enter a connected account ID');
      return;
    }

    const successUrl = `${window.location.origin}/payment-success`;
    const cancelUrl = `${window.location.origin}/payment-cancelled`;

    await createDestinationCheckout({
      amount: amountInCents,
      description,
      connectedAccountId: connectedAccountId.trim(),
      applicationFeeAmount: platformFee,
      successUrl,
      cancelUrl,
      customerEmail: customerEmail.trim() || undefined,
      onBehalfOf,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="container mx-auto max-w-2xl space-y-6">
        {onBack && (
          <div className="flex items-center gap-4">
            <Button onClick={onBack} variant="outline" size="sm" disabled={loading}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h1 className="text-3xl font-bold text-primary">Destination Charges</h1>
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Marketplace Checkout
            </CardTitle>
            <p className="text-muted-foreground">
              Create a checkout session with destination charges for marketplace payments
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Product Details */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="description">Product Description</Label>
                <Input
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter product description"
                  disabled={loading}
                />
              </div>
              
              <div>
                <Label htmlFor="amount">Amount ($)</Label>
                <Input
                  id="amount"
                  type="number"
                  min="0.50"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                  placeholder="50.00"
                  disabled={loading}
                />
              </div>

              <div>
                <Label htmlFor="customerEmail">Customer Email (Optional)</Label>
                <Input
                  id="customerEmail"
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="customer@example.com"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Connected Account Details */}
            <div className="space-y-4 border-t pt-4">
              <div>
                <Label htmlFor="connectedAccount">Connected Account ID</Label>
                <Input
                  id="connectedAccount"
                  value={connectedAccountId}
                  onChange={(e) => setConnectedAccountId(e.target.value)}
                  placeholder="acct_1234567890"
                  disabled={loading}
                />
                <p className="text-sm text-muted-foreground mt-1">
                  The Stripe Connect account that will receive the funds
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="onBehalfOf"
                  checked={onBehalfOf}
                  onCheckedChange={setOnBehalfOf}
                  disabled={loading}
                />
                <Label htmlFor="onBehalfOf">Use on_behalf_of parameter</Label>
              </div>
              {onBehalfOf && (
                <p className="text-sm text-muted-foreground">
                  This sets the connected account as the settlement merchant
                </p>
              )}
            </div>

            {/* Platform Fee Configuration */}
            <div className="space-y-4 border-t pt-4">
              <div>
                <Label htmlFor="feePercentage">Platform Fee (%)</Label>
                <Input
                  id="feePercentage"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={feePercentage}
                  onChange={(e) => setFeePercentage(parseFloat(e.target.value) || 0)}
                  disabled={loading}
                />
              </div>

              {/* Fee Breakdown */}
              <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                <h4 className="font-medium flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Payment Breakdown
                </h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Total Amount:</span>
                    <span>${formatAmount(amountInCents)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Platform Fee ({feePercentage}%):</span>
                    <span>${formatAmount(platformFee)}</span>
                  </div>
                  <div className="flex justify-between font-medium border-t pt-1">
                    <span>To Connected Account:</span>
                    <span>${formatAmount(connectedAccountAmount)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Checkout Button */}
            <Button
              onClick={handleCheckout}
              disabled={loading || !connectedAccountId.trim() || amount < 0.5}
              size="lg"
              className="w-full"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Creating Checkout Session...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4" />
                  <span>Create Destination Checkout - ${formatAmount(amountInCents)}</span>
                </div>
              )}
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              This will create a Stripe Checkout session with destination charges. 
              Funds will be transferred to the connected account after fees are collected.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DestinationCheckout;
