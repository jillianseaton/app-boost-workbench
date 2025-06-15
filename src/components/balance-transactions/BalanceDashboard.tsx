
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  ArrowUpRight,
  ArrowDownRight,
  Activity
} from 'lucide-react';
import { useBalanceTransactions } from '@/hooks/useBalanceTransactions';
import { BalanceTransaction as BalanceTransactionType } from '@/types/balanceTransaction';

const BalanceDashboard: React.FC = () => {
  const { transactions, loading, fetchTransactions } = useBalanceTransactions();
  const [stats, setStats] = useState({
    totalIn: 0,
    totalOut: 0,
    netAmount: 0,
    totalFees: 0,
    transactionCount: 0,
  });

  useEffect(() => {
    fetchTransactions({ limit: 100 });
  }, [fetchTransactions]);

  useEffect(() => {
    if (transactions.length > 0) {
      const calculated = transactions.reduce((acc, transaction) => {
        if (transaction.amount > 0) {
          acc.totalIn += transaction.amount;
        } else {
          acc.totalOut += Math.abs(transaction.amount);
        }
        acc.netAmount += transaction.net;
        acc.totalFees += transaction.fee;
        acc.transactionCount += 1;
        return acc;
      }, {
        totalIn: 0,
        totalOut: 0,
        netAmount: 0,
        totalFees: 0,
        transactionCount: 0,
      });

      setStats(calculated);
    }
  }, [transactions]);

  const formatAmount = (amount: number, currency: string = 'usd') => {
    const value = amount / 100;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(value);
  };

  const getRecentTransactions = () => {
    return transactions
      .sort((a, b) => b.created - a.created)
      .slice(0, 5);
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Incoming</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatAmount(stats.totalIn)}
            </div>
            <p className="text-xs text-muted-foreground">
              Money received
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Outgoing</CardTitle>
            <ArrowDownRight className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatAmount(stats.totalOut)}
            </div>
            <p className="text-xs text-muted-foreground">
              Money sent out
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Amount</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stats.netAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatAmount(stats.netAmount)}
            </div>
            <p className="text-xs text-muted-foreground">
              After fees
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Fees</CardTitle>
            <Activity className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {formatAmount(stats.totalFees)}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.transactionCount} transactions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">Loading recent transactions...</div>
          ) : getRecentTransactions().length > 0 ? (
            <div className="space-y-3">
              {getRecentTransactions().map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 bg-muted rounded-md">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${transaction.amount < 0 ? 'bg-red-500' : 'bg-green-500'}`} />
                    <div>
                      <div className="font-medium capitalize">
                        {transaction.type.replace('_', ' ')}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(transaction.created * 1000).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-medium ${transaction.amount < 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {transaction.amount < 0 ? '-' : '+'}
                      {formatAmount(Math.abs(transaction.amount), transaction.currency)}
                    </div>
                    <Badge className="text-xs">
                      {transaction.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              No recent transactions
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BalanceDashboard;
