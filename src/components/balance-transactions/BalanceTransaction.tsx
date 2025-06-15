
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  ArrowDown, 
  ArrowUp, 
  CreditCard, 
  RefreshCw, 
  DollarSign, 
  ArrowRight,
  ExternalLink 
} from 'lucide-react';
import { BalanceTransaction as BalanceTransactionType } from '@/types/balanceTransaction';

interface BalanceTransactionProps {
  transaction: BalanceTransactionType;
  onViewDetails?: (transaction: BalanceTransactionType) => void;
}

const BalanceTransaction: React.FC<BalanceTransactionProps> = ({ 
  transaction, 
  onViewDetails 
}) => {
  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'charge':
      case 'payment':
        return CreditCard;
      case 'refund':
        return RefreshCw;
      case 'transfer':
        return ArrowRight;
      case 'payout':
        return DollarSign;
      default:
        return transaction.amount < 0 ? ArrowDown : ArrowUp;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_transit':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatAmount = (amount: number, currency: string) => {
    const value = Math.abs(amount) / 100;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(value);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const TransactionIcon = getTransactionIcon(transaction.type);
  const isOutgoing = transaction.amount < 0;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${isOutgoing ? 'bg-red-100' : 'bg-green-100'}`}>
              <TransactionIcon className={`h-4 w-4 ${isOutgoing ? 'text-red-600' : 'text-green-600'}`} />
            </div>
            
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-medium capitalize">{transaction.type.replace('_', ' ')}</h3>
                <Badge className={getStatusColor(transaction.status)}>
                  {transaction.status.replace('_', ' ')}
                </Badge>
              </div>
              
              <div className="text-sm text-muted-foreground">
                {transaction.description || transaction.reporting_category}
              </div>
              
              <div className="text-xs text-muted-foreground">
                Created: {formatDate(transaction.created)}
                {transaction.available_on !== transaction.created && (
                  <span className="ml-2">
                    Available: {formatDate(transaction.available_on)}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className={`text-lg font-semibold ${isOutgoing ? 'text-red-600' : 'text-green-600'}`}>
              {isOutgoing ? '-' : '+'}
              {formatAmount(transaction.amount, transaction.currency)}
            </div>
            
            {transaction.fee > 0 && (
              <div className="text-sm text-muted-foreground">
                Fee: {formatAmount(transaction.fee, transaction.currency)}
              </div>
            )}
            
            <div className="text-sm font-medium text-gray-900">
              Net: {formatAmount(transaction.net, transaction.currency)}
            </div>
            
            {onViewDetails && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onViewDetails(transaction)}
                className="mt-2"
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                Details
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BalanceTransaction;
