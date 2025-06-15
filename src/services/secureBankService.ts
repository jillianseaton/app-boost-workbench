
import { supabase } from '@/integrations/supabase/client';

export interface BankAccountCreationRequest {
  accountHolderName: string;
  routingNumber: string;
  accountNumber: string;
  accountType: 'checking' | 'savings';
}

export interface BankAccountVerificationRequest {
  bankAccountId: string;
  amounts: [number, number];
}

export interface SecureDepositRequest {
  amount: number;
  bankAccountId: string;
  userBalance: number;
}

export interface BankAccount {
  id: string;
  account_holder_name: string;
  bank_name: string;
  routing_number_last4: string;
  account_number_last4: string;
  verification_status: 'pending' | 'verifying' | 'verified' | 'failed' | 'requires_action';
  verification_method: string;
  is_primary: boolean;
  created_at: string;
  verified_at?: string;
}

class SecureBankService {
  async createBankAccount(request: BankAccountCreationRequest) {
    try {
      console.log('Creating bank account via service');
      
      const { data, error } = await supabase.functions.invoke('create-bank-account', {
        body: request,
      });

      if (error) {
        throw new Error(error.message || 'Failed to create bank account');
      }

      return data;
    } catch (error) {
      console.error('Bank Account Creation Error:', error);
      throw error;
    }
  }

  async verifyBankAccount(request: BankAccountVerificationRequest) {
    try {
      console.log('Verifying bank account:', request.bankAccountId);
      
      const { data, error } = await supabase.functions.invoke('verify-bank-account', {
        body: request,
      });

      if (error) {
        throw new Error(error.message || 'Failed to verify bank account');
      }

      return data;
    } catch (error) {
      console.error('Bank Account Verification Error:', error);
      throw error;
    }
  }

  async processSecureDeposit(request: SecureDepositRequest) {
    try {
      console.log('Processing secure deposit:', request);
      
      const { data, error } = await supabase.functions.invoke('process-secure-deposit', {
        body: request,
      });

      if (error) {
        throw new Error(error.message || 'Failed to process secure deposit');
      }

      return data;
    } catch (error) {
      console.error('Secure Deposit Error:', error);
      throw error;
    }
  }

  async getUserBankAccounts(): Promise<BankAccount[]> {
    try {
      // Use direct query to the user_bank_accounts table
      const { data, error } = await supabase
        .from('user_bank_accounts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Database error:', error);
        throw new Error(error.message);
      }

      return (data || []) as BankAccount[];
    } catch (error) {
      console.error('Get Bank Accounts Error:', error);
      throw error;
    }
  }

  async getBankAccountAuditLog(bankAccountId?: string) {
    try {
      let query = supabase
        .from('bank_account_audit_log')
        .select('*')
        .order('created_at', { ascending: false });

      if (bankAccountId) {
        query = query.eq('bank_account_id', bankAccountId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Audit log error:', error);
        throw new Error(error.message);
      }

      return data || [];
    } catch (error) {
      console.error('Get Audit Log Error:', error);
      throw error;
    }
  }
}

export const secureBankService = new SecureBankService();
