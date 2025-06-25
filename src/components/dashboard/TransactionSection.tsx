
import React from 'react';
import TransactionHistory from '@/components/TransactionHistory';
import { Transaction } from '@/utils/transactionUtils';

interface TransactionSectionProps {
  transactions: Transaction[];
}

const TransactionSection: React.FC<TransactionSectionProps> = ({ transactions }) => {
  return (
    <TransactionHistory transactions={transactions} />
  );
};

export default TransactionSection;
