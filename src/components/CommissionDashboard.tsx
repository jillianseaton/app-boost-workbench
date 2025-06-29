
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DollarSign, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import { useCommissions } from '@/hooks/useCommissions';
import { formatDistanceToNow } from 'date-fns';
import PayoutButton from './PayoutButton';

interface CommissionDashboardProps {
  userId: string;
}

const CommissionDashboard: React.FC<CommissionDashboardProps> = ({ userId }) => {
  const { 
    commissions, 
    summary, 
    loading,
    refreshCommissions
  } = useCommissions(userId);

  const formatCurrency = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  const getSourceBadge = (source: string) => {
    const sourceColors: { [key: string]: string } = {
      'task_completion': 'bg-blue-100 text-blue-800',
      'affiliate_sale': 'bg-green-100 text-green-800',
      'referral_bonus': 'bg-purple-100 text-purple-800',
      'ad_revenue': 'bg-orange-100 text-orange-800'
    };
    
    return sourceColors[source] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unpaid Earnings</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {formatCurrency(summary.total_unpaid_cents)}
            </div>
            <p className="text-xs text-muted-foreground">
              {summary.unpaid_count} transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Paid Out</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(summary.total_paid_cents)}
            </div>
            <p className="text-xs text-muted-foreground">
              {summary.paid_count} transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(summary.total_unpaid_cents + summary.total_paid_cents)}
            </div>
            <p className="text-xs text-muted-foreground">
              All time
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Payout</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <PayoutButton />
          </CardContent>
        </Card>
      </div>

      {/* Commission History - Smaller Section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Commission History</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {commissions.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground text-sm">
              No commissions recorded yet
            </div>
          ) : (
            <div className="max-h-64 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="h-8 text-xs">Amount</TableHead>
                    <TableHead className="h-8 text-xs">Description</TableHead>
                    <TableHead className="h-8 text-xs">Source</TableHead>
                    <TableHead className="h-8 text-xs">Status</TableHead>
                    <TableHead className="h-8 text-xs">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {commissions.map((commission) => (
                    <TableRow key={commission.id} className="h-10">
                      <TableCell className="font-medium text-sm py-1">
                        {formatCurrency(commission.amount_earned_cents)}
                      </TableCell>
                      <TableCell className="text-sm py-1 max-w-32 truncate">
                        {commission.description || 'No description'}
                      </TableCell>
                      <TableCell className="py-1">
                        <Badge className={`${getSourceBadge(commission.source)} text-xs px-1 py-0`}>
                          {commission.source.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-1">
                        {commission.paid_out ? (
                          <Badge className="bg-green-100 text-green-800 text-xs px-1 py-0">
                            Paid
                          </Badge>
                        ) : (
                          <Badge className="bg-yellow-100 text-yellow-800 text-xs px-1 py-0">
                            Pending
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-xs py-1">
                        {formatDistanceToNow(new Date(commission.created_at), { addSuffix: true })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CommissionDashboard;
