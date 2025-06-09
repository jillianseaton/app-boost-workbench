
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Bitcoin, Clock, CheckCircle, AlertCircle } from 'lucide-react';

interface Transaction {
  id: string;
  type: 'withdrawal' | 'earning';
  amount: number;
  address?: string;
  status: 'pending' | 'confirmed' | 'failed';
  timestamp: Date;
  txHash?: string;
}

interface TransactionHistoryProps {
  transactions: Transaction[];
}

const TransactionHistory: React.FC<TransactionHistoryProps> = ({ transactions }) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'confirmed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (transactions.length === 0) {
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
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bitcoin className="h-5 w-5" />
          Transaction History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Address/Details</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {transaction.type === 'withdrawal' ? (
                      <Bitcoin className="h-4 w-4 text-orange-500" />
                    ) : (
                      <div className="h-4 w-4 bg-green-500 rounded-full" />
                    )}
                    <span className="capitalize">{transaction.type}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className={transaction.type === 'withdrawal' ? 'text-red-600' : 'text-green-600'}>
                    {transaction.type === 'withdrawal' ? '-' : '+'}${transaction.amount.toFixed(2)}
                  </span>
                </TableCell>
                <TableCell>
                  {transaction.address ? (
                    <div className="font-mono text-xs break-all max-w-[200px]">
                      {transaction.address}
                    </div>
                  ) : (
                    <span className="text-muted-foreground">Task completion</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge className={getStatusColor(transaction.status)}>
                    <div className="flex items-center gap-1">
                      {getStatusIcon(transaction.status)}
                      <span className="capitalize">{transaction.status}</span>
                    </div>
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    {transaction.timestamp.toLocaleDateString()}
                    <div className="text-xs text-muted-foreground">
                      {transaction.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        {transactions.some(t => t.status === 'pending') && (
          <div className="mt-4 p-3 bg-blue-50 rounded-md">
            <p className="text-sm text-blue-800">
              <strong>Pending Transactions:</strong> Bitcoin transactions typically take 10-20 minutes to confirm. 
              Please allow time for blockchain confirmation.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TransactionHistory;
