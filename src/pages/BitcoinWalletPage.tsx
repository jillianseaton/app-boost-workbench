
import React from 'react';
import BitcoinWallet from '@/components/BitcoinWallet';

const BitcoinWalletPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 p-4">
      <div className="container mx-auto max-w-4xl space-y-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-primary mb-2">Bitcoin Testnet Wallet</h1>
          <p className="text-lg text-muted-foreground">
            Generate wallets, check balances, and send Bitcoin on testnet
          </p>
        </div>
        
        <BitcoinWallet />
      </div>
    </div>
  );
};

export default BitcoinWalletPage;
