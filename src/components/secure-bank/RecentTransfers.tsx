
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { History, ArrowUpRight } from 'lucide-react';

interface Transfer {
  id: string;
  action: string;
  created_at: string;
  details: any;
}

interface RecentTransfersProps {
  transfers: Transfer[];
}

const RecentTransfers: React.FC<RecentTransfersProps> = ({ transfers }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Recent Transfer Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        {transfers.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">No recent transfers</p>
        ) : (
          <div className="space-y-3">
            {transfers.map((transfer) => {
              const amount = typeof transfer.details === 'object' && 
                           transfer.details && 
                           typeof transfer.details === 'object' && 
                           'amount' in transfer.details 
                ? Number(transfer.details.amount) || 0 
                : 0;
              
              return (
                <div key={transfer.id} className="flex items-center justify-between p-3 bg-muted rounded-md">
                  <div className="flex items-center gap-3">
                    <ArrowUpRight className="h-4 w-4 text-green-500" />
                    <div>
                      <p className="text-sm font-medium">
                        ${amount.toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(transfer.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {transfer.action.replace('secure_deposit_', '')}
                  </Badge>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentTransfers;
