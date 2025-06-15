
import { supabase } from '@/integrations/supabase/client';
import { BalanceTransaction, BalanceTransactionFilters, BalanceTransactionListResponse } from '@/types/balanceTransaction';

export interface FetchBalanceTransactionsRequest {
  limit?: number;
  starting_after?: string;
  ending_before?: string;
  filters?: BalanceTransactionFilters;
}

export interface FetchBalanceTransactionsResponse {
  success: boolean;
  data?: BalanceTransactionListResponse;
  error?: string;
  timestamp: string;
}

class BalanceTransactionService {
  async fetchBalanceTransactions(request: FetchBalanceTransactionsRequest): Promise<FetchBalanceTransactionsResponse> {
    try {
      console.log('Fetching balance transactions:', request);
      
      const { data, error } = await supabase.functions.invoke('fetch-balance-transactions', {
        body: request,
      });

      if (error) {
        throw new Error(error.message || 'Failed to fetch balance transactions');
      }

      return data;
    } catch (error) {
      console.error('Balance Transaction Service Error:', error);
      throw error;
    }
  }

  async getBalanceTransaction(transactionId: string): Promise<BalanceTransaction> {
    try {
      console.log('Fetching balance transaction:', transactionId);
      
      const { data, error } = await supabase.functions.invoke('get-balance-transaction', {
        body: { transactionId },
      });

      if (error) {
        throw new Error(error.message || 'Failed to fetch balance transaction');
      }

      return data.data;
    } catch (error) {
      console.error('Get Balance Transaction Error:', error);
      throw error;
    }
  }
}

export const balanceTransactionService = new BalanceTransactionService();
