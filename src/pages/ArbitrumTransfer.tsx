
import React from 'react';
import { ArbitrumTransferForm } from '@/components/ArbitrumTransferForm';

const ArbitrumTransfer: React.FC = () => {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">Arbitrum Transfer</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Send ETH or ERC-20 tokens on the Arbitrum network using your hot wallet. 
          Transactions are faster and cheaper than Ethereum mainnet.
        </p>
      </div>
      
      <ArbitrumTransferForm />
      
      <div className="mt-8 text-center">
        <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
          <span className="text-blue-600">🔵</span>
          <span>Powered by Arbitrum One Network</span>
        </div>
      </div>
    </div>
  );
};

export default ArbitrumTransfer;
