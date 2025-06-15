
import { Clock, CheckCircle, AlertCircle } from 'lucide-react';

export interface Transaction {
  id: string;
  type: 'withdrawal' | 'earning';
  amount: number;
  address?: string;
  status: 'pending' | 'confirmed' | 'failed';
  timestamp: Date;
  txHash?: string;
  network?: 'mainnet' | 'testnet';
}

export const getStatusIcon = (status: string) => {
  switch (status) {
    case 'pending':
      return Clock;
    case 'confirmed':
      return CheckCircle;
    case 'failed':
      return AlertCircle;
    default:
      return Clock;
  }
};

export const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'confirmed':
      return 'bg-green-100 text-green-800';
    case 'failed':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const generateMempoolUrl = (txHash: string, network: string = 'mainnet') => {
  const isMainnet = network === 'mainnet';
  return isMainnet 
    ? `https://mempool.space/tx/${txHash}`
    : `https://mempool.space/testnet/tx/${txHash}`;
};

export const openInMempool = (txHash: string, network: string = 'mainnet') => {
  window.open(generateMempoolUrl(txHash, network), '_blank');
};

export const isBankDeposit = (transaction: Transaction) => {
  return transaction.type === 'withdrawal' && transaction.address === 'Bank Account Transfer';
};
