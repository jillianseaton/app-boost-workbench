
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Payment {
  id: string;
  amount: number;
  campaign: string;
  status: string;
  date: string;
}

interface PartnerPaymentsListProps {
  payments: Payment[];
}

const PartnerPaymentsList: React.FC<PartnerPaymentsListProps> = ({ payments }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Payments</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {payments.map((payment) => (
            <div key={payment.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">{payment.campaign}</p>
                <p className="text-sm text-muted-foreground">{payment.date}</p>
              </div>
              <div className="text-right">
                <p className="font-bold">${payment.amount.toFixed(2)}</p>
                <Badge variant={payment.status === 'completed' ? 'default' : 'secondary'}>
                  {payment.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default PartnerPaymentsList;
