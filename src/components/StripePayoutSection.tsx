import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DollarSign, ArrowRight } from 'lucide-react';
import { useStripe } from '@/hooks/useStripe';
import { useAuth } from '@/hooks/useAuth';

const StripePayoutSection = () => {
  const [amount, setAmount] = useState('');
  const { createPayout, setupAccount, loading, accountSetupLoading } = useStripe();
  const { user } = useAuth();

  const handlePayout = async () => {
    if (!amount || !user?.email) return;

    try {
      await createPayout({
        amount: parseFloat(amount),
        email: user.email,
        userId: user.id,
      });
      setAmount('');
    } catch (error) {
      console.error('Payout error:', error);
    }
  };

  const handleAccountSetup = async () => {
    if (!user?.email) return;

    try {
      const result = await setupAccount(user.email, user.id, window.location.origin);
      if (result.onboardingUrl) {
        window.open(result.onboardingUrl, '_blank');
      }
    } catch (error) {
      console.error('Account setup error:', error);
    }
  };

  if (!user) {
    return (
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Stripe Payout
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Please sign in to access payout functionality.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Stripe Payout
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="amount">Payout Amount ($)</Label>
          <Input
            id="amount"
            type="number"
            placeholder="Enter amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min="1"
            step="0.01"
          />
        </div>
        
        <div className="flex flex-col gap-2">
          <Button 
            onClick={handlePayout} 
            disabled={!amount || loading}
            className="w-full"
          >
            {loading ? 'Processing...' : 'Request Payout'}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          
          <Button 
            variant="outline" 
            onClick={handleAccountSetup}
            disabled={accountSetupLoading}
            className="w-full"
          >
            {accountSetupLoading ? 'Setting up...' : 'Setup Stripe Account'}
          </Button>
        </div>
        
        <p className="text-xs text-muted-foreground text-center">
          Payouts typically arrive in 1-2 business days
        </p>
      </CardContent>
    </Card>
  );
};

export default StripePayoutSection;