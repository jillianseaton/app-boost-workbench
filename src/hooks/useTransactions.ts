
import { useState } from 'react';

interface Transaction {
  id: string;
  type: 'withdrawal' | 'earning';
  amount: number;
  address?: string;
  status: 'pending' | 'confirmed' | 'failed';
  timestamp: Date;
  txHash?: string;
}

export const useTransactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const addTransaction = (transaction: Omit<Transaction, 'id' | 'timestamp'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
    };
    setTransactions(prev => [newTransaction, ...prev]);
    return newTransaction.id;
  };

  const updateTransaction = (id: string, updates: Partial<Transaction>) => {
    setTransactions(prev => 
      prev.map(tx => tx.id === id ? { ...tx, ...updates } : tx)
    );
  };

  return {
    transactions,
    addTransaction,
    updateTransaction,
  };
};
