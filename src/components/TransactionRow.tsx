
import React from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bitcoin, Banknote, ExternalLink } from 'lucide-react';
import { Transaction, getStatusIcon, getStatusColor, openInMempool, isBankDeposit } from '@/utils/transactionUtils';

interface TransactionRowProps {
  transaction: Transaction;
}

const TransactionRow: React.FC<TransactionRowProps> = ({ transaction }) => {
  const StatusIcon = getStatusIcon(transaction.status);

  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-2">
          {isBankDeposit(transaction) ? (
            <Banknote className="h-4 w-4 text-blue-500" />
          ) : transaction.type === 'withdrawal' ? (
            <Bitcoin className="h-4 w-4 text-orange-500" />
          ) : (
            <div className="h-4 w-4 bg-green-500 rounded-full" />
          )}
          <span className="capitalize">
            {isBankDeposit(transaction) ? 'Bank Deposit' : transaction.type}
          </span>
        </div>
      </TableCell>
      <TableCell>
        <span className={transaction.type === 'withdrawal' ? 'text-red-600' : 'text-green-600'}>
          {transaction.type === 'withdrawal' ? '-' : '+'}${transaction.amount.toFixed(2)}
        </span>
      </TableCell>
      <TableCell>
        {transaction.address ? (
          <div className={`text-xs ${isBankDeposit(transaction) ? 'text-blue-600 font-medium' : 'font-mono break-all max-w-[200px]'}`}>
            {transaction.address}
          </div>
        ) : (
          <span className="text-muted-foreground">Task completion</span>
        )}
      </TableCell>
      <TableCell>
        <Badge className={getStatusColor(transaction.status)}>
          <div className="flex items-center gap-1">
            <StatusIcon className="h-4 w-4" />
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
      <TableCell>
        {transaction.txHash && !isBankDeposit(transaction) ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => openInMempool(transaction.txHash!, transaction.network || 'mainnet')}
            className="flex items-center gap-1"
          >
            <ExternalLink className="h-3 w-3" />
            View
          </Button>
        ) : isBankDeposit(transaction) ? (
          <span className="text-blue-600 text-sm">Bank Transfer</span>
        ) : (
          <span className="text-muted-foreground text-sm">-</span>
        )}
      </TableCell>
    </TableRow>
  );
};

export default TransactionRow;
