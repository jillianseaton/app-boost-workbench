
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Calendar, DollarSign, Clock, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { adRevenueService } from '@/services/adRevenueService';

interface PayoutScheduleProps {
  connectAccountId: string;
}

const PayoutSchedule: React.FC<PayoutScheduleProps> = ({ connectAccountId }) => {
  const [payoutAmount, setPayoutAmount] = useState('');
  const [isRequesting, setIsRequesting] = useState(false);
  const { toast } = useToast();

  // TODO: Fetch real balance and schedule data from API
  const balance = {
    available: 1250.00,
    pending: 875.50,
  };

  const upcomingPayouts = [
    {
      id: '1',
      amount: 1200.00,
      date: '2024-01-20',
      status: 'scheduled',
      method: 'ACH Transfer',
    },
    {
      id: '2',
      amount: 800.00,
      date: '2024-01-15',
      status: 'completed',
      method: 'Wire Transfer',
    },
  ];

  const handleRequestPayout = async () => {
    const amount = parseFloat(payoutAmount);
    
    if (!amount || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid payout amount.",
        variant: "destructive",
      });
      return;
    }

    if (amount > balance.available) {
      toast({
        title: "Insufficient Balance",
        description: "Requested amount exceeds available balance.",
        variant: "destructive",
      });
      return;
    }

    setIsRequesting(true);
    
    try {
      await adRevenueService.requestPayout(connectAccountId, amount * 100); // Convert to cents
      
      toast({
        title: "Payout Requested",
        description: `Payout of $${amount.toFixed(2)} has been requested.`,
      });
      
      setPayoutAmount('');
    } catch (error) {
      console.error('Payout request error:', error);
      toast({
        title: "Payout Failed",
        description: "Failed to request payout. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRequesting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Available Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">${balance.available.toFixed(2)}</div>
            <p className="text-sm text-muted-foreground">
              Ready for withdrawal
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Pending Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">${balance.pending.toFixed(2)}</div>
            <p className="text-sm text-muted-foreground">
              Processing, available soon
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Request Payout</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="payoutAmount">Amount ($)</Label>
            <Input
              id="payoutAmount"
              type="number"
              placeholder="0.00"
              value={payoutAmount}
              onChange={(e) => setPayoutAmount(e.target.value)}
              min="0"
              max={balance.available}
              step="0.01"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Maximum: ${balance.available.toFixed(2)}
            </p>
          </div>
          <Button 
            onClick={handleRequestPayout} 
            disabled={isRequesting || !payoutAmount}
            className="w-full"
          >
            {isRequesting ? 'Processing...' : 'Request Payout'}
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Payout History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {upcomingPayouts.map((payout) => (
              <div key={payout.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <DollarSign className="h-8 w-8 text-muted-foreground" />
                  <div>
                    <p className="font-medium">${payout.amount.toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">{payout.method}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Calendar className="h-3 w-3" />
                      <span className="text-xs text-muted-foreground">{payout.date}</span>
                    </div>
                  </div>
                </div>
                <Badge variant={payout.status === 'completed' ? 'default' : 'secondary'}>
                  {payout.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PayoutSchedule;
