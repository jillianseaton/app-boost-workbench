
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Banknote, CheckCircle, ArrowUpRight, History } from 'lucide-react';

interface OverviewStatsProps {
  currentBalance: number;
  verifiedAccountsCount: number;
  totalTransferred: number;
  completedTransfers: number;
}

const OverviewStats: React.FC<OverviewStatsProps> = ({
  currentBalance,
  verifiedAccountsCount,
  totalTransferred,
  completedTransfers,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Available Balance</p>
              <p className="text-2xl font-bold text-green-600">${currentBalance.toFixed(2)}</p>
            </div>
            <Banknote className="h-8 w-8 text-green-500" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Verified Accounts</p>
              <p className="text-2xl font-bold text-blue-600">{verifiedAccountsCount}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-blue-500" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Transferred</p>
              <p className="text-2xl font-bold text-purple-600">${totalTransferred.toFixed(2)}</p>
            </div>
            <ArrowUpRight className="h-8 w-8 text-purple-500" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Completed Transfers</p>
              <p className="text-2xl font-bold text-orange-600">{completedTransfers}</p>
            </div>
            <History className="h-8 w-8 text-orange-500" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OverviewStats;
