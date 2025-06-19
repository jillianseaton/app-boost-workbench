
import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  CreditCard, 
  RefreshCw, 
  DollarSign,
  TrendingUp,
  Activity,
  Eye,
  Loader2
} from 'lucide-react';
import { useFinancialConnections } from '@/hooks/useFinancialConnections';
import { FinancialAccount } from '@/services/financialConnectionsService';

const FinancialConnectionsDashboard: React.FC = () => {
  const {
    accounts,
    transactions,
    loading,
    refreshing,
    fetchAccounts,
    fetchTransactions,
    refreshBalance,
  } = useFinancialConnections();

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount / 100);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      case 'disconnected':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const AccountCard: React.FC<{ account: FinancialAccount }> = ({ account }) => (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            {account.institution_name}
          </CardTitle>
          <Badge className={getStatusColor(account.status)}>
            {account.status}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">{account.display_name}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Current Balance</span>
            <span className="text-lg font-bold text-green-600">
              {formatCurrency(account.balance.current)}
            </span>
          </div>
          
          {account.balance.available !== undefined && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Available</span>
              <span className="text-sm">
                {formatCurrency(account.balance.available)}
              </span>
            </div>
          )}
          
          {account.last4 && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Account</span>
              <span className="text-sm font-mono">****{account.last4}</span>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refreshBalance(account.id)}
            disabled={refreshing === account.id}
            className="flex-1"
          >
            {refreshing === account.id ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Refreshing...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </>
            )}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchTransactions(account.id)}
            className="flex-1"
          >
            <Eye className="h-4 w-4 mr-2" />
            View Transactions
          </Button>
        </div>

        <div className="text-xs text-muted-foreground space-y-1">
          <div>Category: {account.category} • {account.subcategory}</div>
          {account.permissions && (
            <div>Permissions: {account.permissions.join(', ')}</div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const totalBalance = accounts.reduce((sum, account) => sum + account.balance.current, 0);
  const activeAccounts = accounts.filter(account => account.status === 'active').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Financial Connections</h2>
          <p className="text-muted-foreground">
            Real-time financial data from your connected accounts
          </p>
        </div>
        <Button onClick={fetchAccounts} disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Loading...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh All
            </>
          )}
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Balance</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(totalBalance)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Accounts</p>
                <p className="text-2xl font-bold text-blue-600">{activeAccounts}</p>
              </div>
              <CreditCard className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Accounts</p>
                <p className="text-2xl font-bold text-purple-600">{accounts.length}</p>
              </div>
              <Activity className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Accounts Grid */}
      {loading && accounts.length === 0 ? (
        <div className="text-center py-8">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading connected accounts...</p>
        </div>
      ) : accounts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {accounts.map((account) => (
            <AccountCard key={account.id} account={account} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Connected Accounts</h3>
            <p className="text-muted-foreground">
              Connect your financial accounts to view real-time balance and transaction data.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Recent Transactions */}
      {transactions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Recent Transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {transactions.slice(0, 10).map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 bg-muted rounded-md">
                  <div>
                    <div className="font-medium">{transaction.description}</div>
                    <div className="text-sm text-muted-foreground">
                      {transaction.status} • {new Date(transaction.updated * 1000).toLocaleDateString()}
                    </div>
                  </div>
                  <div className={`font-bold ${transaction.amount < 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {transaction.amount < 0 ? '-' : '+'}
                    {formatCurrency(Math.abs(transaction.amount), transaction.currency)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FinancialConnectionsDashboard;
