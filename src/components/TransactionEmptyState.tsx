
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bitcoin } from 'lucide-react';

const TransactionEmptyState: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bitcoin className="h-5 w-5" />
          Transaction History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <Bitcoin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No transactions yet</p>
          <p className="text-sm text-muted-foreground mt-1">
            Your withdrawals and earnings will appear here
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default TransactionEmptyState;
