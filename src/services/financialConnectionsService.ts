
import { supabase } from '@/integrations/supabase/client';

export interface FinancialAccount {
  id: string;
  object: string;
  balance: {
    current: number;
    available?: number;
    limit?: number;
  };
  balance_refresh?: {
    status: string;
    last_attempted_at?: number;
    next_refresh_available_at?: number;
  };
  category: string;
  created: number;
  display_name: string;
  institution_name: string;
  last4?: string;
  ownership?: string;
  ownership_type?: string;
  permissions?: string[];
  status: string;
  subcategory: string;
  supported_payment_method_types: string[];
}

export interface AccountsListResponse {
  success: boolean;
  data?: {
    object: string;
    data: FinancialAccount[];
    has_more: boolean;
    url: string;
  };
  error?: string;
  timestamp: string;
}

export interface TransactionData {
  id: string;
  account: string;
  amount: number;
  currency: string;
  description: string;
  status: string;
  status_transitions: {
    posted_at?: number;
    authorized_at?: number;
  };
  updated: number;
}

export interface TransactionsListResponse {
  success: boolean;
  data?: {
    object: string;
    data: TransactionData[];
    has_more: boolean;
    url: string;
  };
  error?: string;
  timestamp: string;
}

export interface BalanceRefreshRequest {
  accountId: string;
}

export interface BalanceRefreshResponse {
  success: boolean;
  data?: {
    status: string;
    last_attempted_at: number;
    next_refresh_available_at?: number;
  };
  error?: string;
  timestamp: string;
}

class FinancialConnectionsService {
  async getConnectedAccounts(): Promise<AccountsListResponse> {
    try {
      console.log('Fetching connected financial accounts');
      
      const { data, error } = await supabase.functions.invoke('get-financial-accounts');

      if (error) {
        throw new Error(error.message || 'Failed to fetch connected accounts');
      }

      return data;
    } catch (error) {
      console.error('Financial Connections Service Error:', error);
      throw error;
    }
  }

  async getAccountTransactions(accountId: string, limit: number = 100): Promise<TransactionsListResponse> {
    try {
      console.log('Fetching account transactions:', accountId);
      
      const { data, error } = await supabase.functions.invoke('get-account-transactions', {
        body: { accountId, limit },
      });

      if (error) {
        throw new Error(error.message || 'Failed to fetch account transactions');
      }

      return data;
    } catch (error) {
      console.error('Account Transactions Error:', error);
      throw error;
    }
  }

  async refreshAccountBalance(accountId: string): Promise<BalanceRefreshResponse> {
    try {
      console.log('Refreshing account balance:', accountId);
      
      const { data, error } = await supabase.functions.invoke('refresh-account-balance', {
        body: { accountId },
      });

      if (error) {
        throw new Error(error.message || 'Failed to refresh account balance');
      }

      return data;
    } catch (error) {
      console.error('Balance Refresh Error:', error);
      throw error;
    }
  }

  async getAccountOwnership(accountId: string) {
    try {
      console.log('Fetching account ownership:', accountId);
      
      const { data, error } = await supabase.functions.invoke('get-account-ownership', {
        body: { accountId },
      });

      if (error) {
        throw new Error(error.message || 'Failed to fetch account ownership');
      }

      return data;
    } catch (error) {
      console.error('Account Ownership Error:', error);
      throw error;
    }
  }
}

export const financialConnectionsService = new FinancialConnectionsService();
