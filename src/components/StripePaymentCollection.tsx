
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CreditCard, DollarSign } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const StripePaymentCollection: React.FC = () => {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handlePayment = async () => {
    const paymentAmount = parseFloat(amount);
    if (!paymentAmount || paymentAmount < 0.50) {
      toast({
        title: "Invalid Amount",
        description: "Minimum payment amount is $0.50",
        variant: "destructive",
      });
      return;
    }

    if (!customerEmail) {
      toast({
        title: "Email Required",
        description: "Please provide your email address",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: {
          amount: Math.round(paymentAmount * 100), // Convert to cents
          description: description || `Payment to Lovable.dev - $${paymentAmount}`,
          successUrl: `${window.location.origin}/payment-success`,
          cancelUrl: `${window.location.origin}/`,
          customerEmail: customerEmail,
          mode: 'payment'
        },
      });

      if (error) throw error;

      if (data?.success && data?.data?.url) {
        // Open Stripe checkout in a new tab
        window.open(data.data.url, '_blank');
        
        toast({
          title: "Payment Link Created",
          description: "Stripe checkout opened in a new tab",
        });
      } else {
        throw new Error(data?.error || 'Failed to create payment session');
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: "Payment Failed",
        description: error instanceof Error ? error.message : "Failed to create payment session",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Make a Payment
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="amount">Payment Amount ($)</Label>
            <Input
              id="amount"
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="0.50"
              step="0.01"
            />
          </div>
          <div>
            <Label htmlFor="customerEmail">Your Email</Label>
            <Input
              id="customerEmail"
              type="email"
              placeholder="your@email.com"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="description">Description (Optional)</Label>
          <Input
            id="description"
            placeholder="What is this payment for?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <Button 
          onClick={handlePayment} 
          disabled={isProcessing || !amount || !customerEmail}
          className="w-full"
        >
          {isProcessing ? (
            <>Processing...</>
          ) : (
            <>
              <DollarSign className="h-4 w-4 mr-2" />
              Pay with Stripe
            </>
          )}
        </Button>

        <div className="p-4 bg-green-50 rounded-lg">
          <p className="text-sm text-green-800">
            <strong>Secure Payment:</strong> This payment will be processed securely through Stripe 
            and deposited directly into the Lovable.dev Stripe account.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default StripePaymentCollection;
