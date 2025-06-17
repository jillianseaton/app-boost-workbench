
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, DollarSign, Clock, ArrowRight } from 'lucide-react';

interface PayoutScheduleProps {
  connectAccountId: string;
}

const PayoutSchedule: React.FC<PayoutScheduleProps> = ({ connectAccountId }) => {
  const [requesting, setRequesting] = useState(false);

  // TODO: Fetch real payout data from API
  const payouts = [
    {
      id: '1',
      amount: 2450.75,
      scheduledDate: '2024-01-20',
      status: 'scheduled',
      bankAccount: '****4567',
    },
    {
      id: '2',
      amount: 1875.50,
      scheduledDate: '2024-01-15',
      status: 'completed',
      bankAccount: '****4567',
    },
    {
      id: '3',
      amount: 3240.25,
      scheduledDate: '2024-01-10',
      status: 'completed',
      bankAccount: '****4567',
    },
  ];

  const pendingBalance = 1250.00;

  const handleRequestPayout = async () => {
    setRequesting(true);
    // TODO: Implement payout request
    setTimeout(() => {
      setRequesting(false);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Available Balance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold">${pendingBalance.toFixed(2)}</p>
              <p className="text-muted-foreground">Available for payout</p>
            </div>
            <Button 
              onClick={handleRequestPayout}
              disabled={requesting || pendingBalance === 0}
              size="lg"
            >
              {requesting ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Request Payout
                </>
              )}
            </Button>
          </div>
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
            {payouts.map((payout) => (
              <div key={payout.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <Calendar className="h-8 w-8 text-muted-foreground" />
                  <div>
                    <p className="font-medium">${payout.amount.toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">
                      To account ending in {payout.bankAccount}
                    </p>
                    <p className="text-xs text-muted-foreground">{payout.scheduledDate}</p>
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
