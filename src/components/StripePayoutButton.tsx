
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { stripeExpressPayoutService } from '@/services/stripeExpressPayoutService';
import { DollarSign, Loader2, CreditCard } from 'lucide-react';

interface StripePayoutButtonProps {
  stripeAccountId?: string;
  className?: string;
  title?: string;
  description?: string;
  method?: 'instant' | 'standard';
}

const StripePayoutButton: React.FC<StripePayoutButtonProps> = ({
  stripeAccountId,
  className = "",
  title = "Request Payout",
  description = "Transfer your earnings to your Stripe account",
  method = 'standard'
}) => {
  const [amount, setAmount] = useState('');
  const [accountId, setAccountId] = useState(stripeAccountId || '');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handlePayout = async () => {
    if (!amount || !accountId || !user) {
      toast({
        title: "Missing Information",
        description: "Please enter amount and Stripe account ID",
        variant: "destructive",
      });
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum < 1) {
      toast({
        title: "Invalid Amount",
        description: "Minimum payout amount is $1.00",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      console.log('Initiating Express payout:', { amount: amountNum, accountId, method });
      
      const result = await stripeExpressPayoutService.createExpressPayout({
        amount: amountNum,
        stripeAccountId: accountId,
        method,
        description: `Payout for ${user.email}`,
      });

      if (result.success && result.data) {
        toast({
          title: "Payout Initiated",
          description: `$${amountNum.toFixed(2)} payout initiated. Arrival: ${method === 'instant' ? 'Within 30 minutes' : '1-2 business days'}`,
        });
        setAmount('');
      } else {
        throw new Error(result.error || 'Payout failed');
      }
    } catch (error) {
      console.error('Payout error:', error);
      toast({
        title: "Payout Failed",
        description: error instanceof Error ? error.message : "Failed to process payout",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Please sign in to access payout functionality.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          {title}
        </CardTitle>
        <p className="text-sm text-muted-foreground">{description}</p>
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
        
        <div className="space-y-2">
          <Label htmlFor="accountId">Stripe Account ID</Label>
          <Input
            id="accountId"
            type="text"
            placeholder="acct_..."
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
          />
        </div>
        
        <Button 
          onClick={handlePayout} 
          disabled={!amount || !accountId || loading}
          className="w-full"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Processing...</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              <span>Request {method === 'instant' ? 'Instant' : 'Standard'} Payout</span>
            </div>
          )}
        </Button>
        
        <p className="text-xs text-muted-foreground text-center">
          {method === 'instant' ? 'Instant payouts arrive within 30 minutes' : 'Standard payouts arrive in 1-2 business days'}
        </p>
      </CardContent>
    </Card>
  );
};

export default StripePayoutButton;
