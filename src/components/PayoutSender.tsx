import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DollarSign, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
interface PayoutSenderProps {
  defaultAmount?: number;
}

const PayoutSender: React.FC<PayoutSenderProps> = ({
  defaultAmount = 50.00
}) => {
  const [amount, setAmount] = useState(defaultAmount);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const sendPayout = async () => {
    if (amount < 1) {
      toast({
        title: "Validation Error", 
        description: "Minimum payout amount is $1.00",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Authentication Required", 
        description: "Please log in to send payouts",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Call Supabase edge function instead of localhost
      const { data, error } = await supabase.functions.invoke('lovable-stripe-payout', {
        body: {
          amount: Math.round(amount * 100), // Amount in cents
          currency: 'usd',
          method: 'standard',
          destination: 'default', // You might want to make this configurable
          userId: user.id,
          userEmail: user.email
        }
      });

      if (error) throw error;
      
      if (data.success) {
        toast({
          title: "Payout Successful!",
          description: `$${amount.toFixed(2)} payout created with ID: ${data.data?.payoutId || 'N/A'}`,
        });
        
        // Reset form after successful payout
        setAmount(50.00);
      } else {
        throw new Error(data.error || 'Payout failed');
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

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Send Stripe Payout
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="amount">Amount (USD)</Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            min="1"
            placeholder="50.00"
            value={amount}
            onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
            disabled={loading}
          />
        </div>
        
        <Button 
          onClick={sendPayout}
          disabled={loading || amount < 1}
          className="w-full"
          size="lg"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Processing Payout...
            </>
          ) : (
            <>
              <DollarSign className="h-4 w-4 mr-2" />
              Send Payout (${amount.toFixed(2)})
            </>
          )}
        </Button>
        
        <div className="p-3 bg-blue-50 rounded-md border border-blue-200">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> Payouts are processed through Stripe and typically arrive in 1-2 business days.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PayoutSender;