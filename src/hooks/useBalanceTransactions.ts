
import { useState, useCallback } from 'react';
import { balanceTransactionService, FetchBalanceTransactionsRequest } from '@/services/balanceTransactionService';
import { BalanceTransaction, BalanceTransactionFilters } from '@/types/balanceTransaction';
import { useToast } from '@/hooks/use-toast';

export const useBalanceTransactions = () => {
  const [transactions, setTransactions] = useState<BalanceTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchTransactions = useCallback(async (
    options: FetchBalanceTransactionsRequest = {},
    append: boolean = false
  ) => {
    setLoading(true);
    setError(null);

    try {
      const result = await balanceTransactionService.fetchBalanceTransactions(options);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch transactions');
      }

      if (append) {
        setTransactions(prev => [...prev, ...result.data!.data]);
      } else {
        setTransactions(result.data!.data);
      }
      
      setHasMore(result.data!.has_more);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch transactions';
      setError(errorMessage);
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const loadMore = useCallback(async (filters?: BalanceTransactionFilters) => {
    if (!hasMore || loading || transactions.length === 0) return;
    
    const lastTransaction = transactions[transactions.length - 1];
    await fetchTransactions({
      starting_after: lastTransaction.id,
      filters,
    }, true);
  }, [hasMore, loading, transactions, fetchTransactions]);

  const applyFilters = useCallback(async (filters: BalanceTransactionFilters) => {
    await fetchTransactions({ filters });
  }, [fetchTransactions]);

  const refresh = useCallback(async () => {
    await fetchTransactions();
  }, [fetchTransactions]);

  return {
    transactions,
    loading,
    hasMore,
    error,
    fetchTransactions,
    loadMore,
    applyFilters,
    refresh,
  };
};
