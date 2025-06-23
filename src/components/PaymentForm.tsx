
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { CreditCard, DollarSign, Wallet } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

const PaymentForm: React.FC = () => {
  const [amount, setAmount] = useState('');
  const [email, setEmail] = useState('');
  const [description, setDescription] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [payWithEarnings, setPayWithEarnings] = useState(false);
  const [earningsBalance, setEarningsBalance] = useState(0);
  const { toast } = useToast();
  const { user } = useAuth();

  // Fetch user's earnings balance
  useEffect(() => {
    const fetchEarnings = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('commissions')
          .select('amount_earned_cents')
          .eq('user_id', user.id)
          .eq('paid_out', false);

        if (error) throw error;

        const totalCents = data?.reduce((sum, commission) => sum + commission.amount_earned_cents, 0) || 0;
        setEarningsBalance(totalCents / 100); // Convert cents to dollars
      } catch (error) {
        console.error('Error fetching earnings:', error);
      }
    };

    fetchEarnings();
  }, [user]);

  // Set user email if logged in
  useEffect(() => {
    if (user?.email) {
      setEmail(user.email);
    }
  }, [user]);

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

    if (!email) {
      toast({
        title: "Email Required",
        description: "Please provide your email address",
        variant: "destructive",
      });
      return;
    }

    // Handle payment with earnings
    if (payWithEarnings) {
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to pay with earnings",
          variant: "destructive",
        });
        return;
      }

      if (paymentAmount > earningsBalance) {
        toast({
          title: "Insufficient Earnings",
          description: `You only have $${earningsBalance.toFixed(2)} in earnings`,
          variant: "destructive",
        });
        return;
      }

      setIsProcessing(true);

      try {
        // Deduct from earnings by creating a payout commission record
        const { error } = await supabase
          .from('commissions')
          .insert({
            user_id: user.id,
            amount_earned_cents: -Math.round(paymentAmount * 100), // Negative amount for deduction
            description: description || `Payment deducted from earnings - $${paymentAmount}`,
            source: 'earnings_payment',
            paid_out: true,
            paid_at: new Date().toISOString()
          });

        if (error) throw error;

        // Update local balance
        setEarningsBalance(prev => prev - paymentAmount);

        toast({
          title: "Payment Successful",
          description: `$${paymentAmount.toFixed(2)} deducted from your earnings`,
        });

        // Reset form
        setAmount('');
        setDescription('');
        setPayWithEarnings(false);
      } catch (error) {
        console.error('Earnings payment error:', error);
        toast({
          title: "Payment Failed",
          description: "Failed to process payment with earnings",
          variant: "destructive",
        });
      } finally {
        setIsProcessing(false);
      }
      return;
    }

    // Handle regular Stripe payment
    setIsProcessing(true);

    try {
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: {
          amount: Math.round(paymentAmount * 100), // Convert to cents
          description: description || `Payment - $${paymentAmount}`,
          successUrl: `${window.location.origin}/payment-success`,
          cancelUrl: `${window.location.origin}/`,
          customerEmail: email,
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-md">
        {/* Earnings Balance Section */}
        {user && (
          <Card className="mb-6">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2 text-xl">
                <Wallet className="h-5 w-5 text-green-600" />
                Your Earnings Balance
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="text-3xl font-bold text-green-600">
                ${earningsBalance.toFixed(2)}
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Available to use for payments
              </p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2 text-2xl">
              <CreditCard className="h-6 w-6" />
              Make a Payment
            </CardTitle>
            <p className="text-muted-foreground">
              Secure payment powered by Stripe
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="amount">Amount ($)</Label>
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
              <Label htmlFor="email">Your Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={!!user?.email}
              />
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

            {/* Pay with Earnings Checkbox */}
            {user && earningsBalance > 0 && (
              <div className="flex items-center space-x-2 p-4 bg-green-50 rounded-lg">
                <Checkbox
                  id="payWithEarnings"
                  checked={payWithEarnings}
                  onCheckedChange={(checked) => setPayWithEarnings(checked as boolean)}
                />
                <Label htmlFor="payWithEarnings" className="text-sm font-medium">
                  Pay with my earnings balance (${earningsBalance.toFixed(2)} available)
                </Label>
              </div>
            )}

            <Button 
              onClick={handlePayment} 
              disabled={isProcessing || !amount || !email || (payWithEarnings && parseFloat(amount) > earningsBalance)}
              className="w-full"
            >
              {isProcessing ? (
                <>Processing...</>
              ) : payWithEarnings ? (
                <>
                  <Wallet className="h-4 w-4 mr-2" />
                  Pay with Earnings
                </>
              ) : (
                <>
                  <DollarSign className="h-4 w-4 mr-2" />
                  Pay with Stripe
                </>
              )}
            </Button>

            {payWithEarnings && parseFloat(amount) > earningsBalance && (
              <p className="text-sm text-red-600 text-center">
                Insufficient earnings balance. You need ${(parseFloat(amount) - earningsBalance).toFixed(2)} more.
              </p>
            )}

            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-green-800">
                <strong>Secure Payment:</strong> {payWithEarnings ? 
                  'Payment will be deducted from your earnings balance.' :
                  'This payment will be processed securely through Stripe.'
                }
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PaymentForm;
