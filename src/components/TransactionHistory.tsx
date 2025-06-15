
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Bitcoin } from 'lucide-react';
import { Transaction } from '@/utils/transactionUtils';
import TransactionRow from './TransactionRow';
import TransactionEmptyState from './TransactionEmptyState';
import TransactionNotes from './TransactionNotes';

interface TransactionHistoryProps {
  transactions: Transaction[];
}

const TransactionHistory: React.FC<TransactionHistoryProps> = ({ transactions }) => {
  if (transactions.length === 0) {
    return <TransactionEmptyState />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bitcoin className="h-5 w-5" />
          Transaction History
          <span className="text-sm font-normal text-muted-foreground ml-auto">
            Powered by mempool.space
          </span>
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
              <TableHead>Explorer</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((transaction) => (
              <TransactionRow key={transaction.id} transaction={transaction} />
            ))}
          </TableBody>
        </Table>
        
        <TransactionNotes transactions={transactions} />
      </CardContent>
    </Card>
  );
};

export default TransactionHistory;
