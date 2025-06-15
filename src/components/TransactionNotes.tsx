
import React from 'react';
import { Transaction } from '@/utils/transactionUtils';

interface TransactionNotesProps {
  transactions: Transaction[];
}

const TransactionNotes: React.FC<TransactionNotesProps> = ({ transactions }) => {
  const hasPendingTransactions = transactions.some(t => t.status === 'pending');

  return (
    <>
      {hasPendingTransactions && (
        <div className="mt-4 p-3 bg-blue-50 rounded-md">
          <p className="text-sm text-blue-800">
            <strong>Pending Transactions:</strong> Bitcoin mainnet transactions typically take 10-60 minutes to confirm. 
            Bank deposits take 1-2 business days to process. You can track Bitcoin transactions in real-time on mempool.space.
          </p>
        </div>
      )}
      
      <div className="mt-4 p-3 bg-gray-50 rounded-md">
        <p className="text-sm text-gray-700">
          <strong>Block Explorer:</strong> Bitcoin transactions can be viewed on{' '}
          <a 
            href="https://mempool.space" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            mempool.space
          </a>
          {' '}for detailed blockchain information. Bank deposits are processed through Stripe and will appear in your bank account within 1-2 business days.
        </p>
      </div>
    </>
  );
};

export default TransactionNotes;
