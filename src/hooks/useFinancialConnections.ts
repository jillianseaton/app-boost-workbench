
import { useState, useCallback } from 'react';
import { financialConnectionsService, FinancialAccount, TransactionData } from '@/services/financialConnectionsService';
import { useToast } from '@/hooks/use-toast';

export const useFinancialConnections = () => {
  const [accounts, setAccounts] = useState<FinancialAccount[]>([]);
  const [transactions, setTransactions] = useState<TransactionData[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchAccounts = useCallback(async () => {
    setLoading(true);
    try {
      const result = await financialConnectionsService.getConnectedAccounts();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch accounts');
      }
      
      setAccounts(result.data?.data || []);
      
      toast({
        title: "Accounts Updated",
        description: `Loaded ${result.data?.data.length || 0} connected accounts`,
      });
    } catch (error) {
      console.error('Fetch accounts error:', error);
      
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch accounts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const fetchTransactions = useCallback(async (accountId: string) => {
    setLoading(true);
    try {
      const result = await financialConnectionsService.getAccountTransactions(accountId);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch transactions');
      }
      
      setTransactions(result.data?.data || []);
      
      toast({
        title: "Transactions Updated",
        description: `Loaded ${result.data?.data.length || 0} transactions`,
      });
    } catch (error) {
      console.error('Fetch transactions error:', error);
      
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch transactions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const refreshBalance = useCallback(async (accountId: string) => {
    setRefreshing(accountId);
    try {
      const result = await financialConnectionsService.refreshAccountBalance(accountId);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to refresh balance');
      }
      
      // Refresh accounts to get updated balance
      await fetchAccounts();
      
      toast({
        title: "Balance Refreshed",
        description: "Account balance has been updated successfully",
      });
    } catch (error) {
      console.error('Refresh balance error:', error);
      
      toast({
        title: "Refresh Failed",
        description: error instanceof Error ? error.message : "Failed to refresh balance",
        variant: "destructive",
      });
    } finally {
      setRefreshing(null);
    }
  }, [toast, fetchAccounts]);

  return {
    accounts,
    transactions,
    loading,
    refreshing,
    fetchAccounts,
    fetchTransactions,
    refreshBalance,
  };
};
