
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, DollarSign, Building } from 'lucide-react';

interface PaymentHistoryProps {
  connectAccountId: string;
}

const PaymentHistory: React.FC<PaymentHistoryProps> = ({ connectAccountId }) => {
  // TODO: Fetch real payment data from API
  const payments = [
    {
      id: '1',
      partner: 'Google AdSense',
      amount: 1250.00,
      date: '2024-01-15',
      status: 'completed',
      campaign: 'Banner Ads Q1',
    },
    {
      id: '2',
      partner: 'Facebook Audience Network',
      amount: 875.50,
      date: '2024-01-14',
      status: 'completed',
      campaign: 'Video Ads',
    },
    {
      id: '3',
      partner: 'Amazon Associates',
      amount: 432.25,
      date: '2024-01-13',
      status: 'pending',
      campaign: 'Product Recommendations',
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Payment History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {payments.map((payment) => (
            <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-4">
                <Building className="h-8 w-8 text-muted-foreground" />
                <div>
                  <p className="font-medium">{payment.partner}</p>
                  <p className="text-sm text-muted-foreground">{payment.campaign}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Calendar className="h-3 w-3" />
                    <span className="text-xs text-muted-foreground">{payment.date}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-lg">${payment.amount.toFixed(2)}</p>
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

export default PaymentHistory;
