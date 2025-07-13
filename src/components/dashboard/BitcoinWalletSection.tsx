
import React, { useState } from 'react';
import BitcoinWalletGeneration from '@/components/bitcoin/BitcoinWalletGeneration';
import BitcoinBalance from '@/components/bitcoin/BitcoinBalance';
import EarningsPayoutConverter from '@/components/bitcoin/EarningsPayoutConverter';
import BitcoinWithdrawal from '@/components/bitcoin/BitcoinWithdrawal';
import BitcoinDebugger from '@/components/bitcoin/BitcoinDebugger';
import PoolWalletInfo from '@/components/bitcoin/PoolWalletInfo';
import BitcoinTransactionTracker from '@/components/bitcoin/BitcoinTransactionTracker';
import BlockchainExplorer from '@/components/bitcoin/BlockchainExplorer';

interface WalletData {
  address: string;
  privateKey: string;
  network: string;
}

interface BalanceData {
  balanceSats: number;
  balanceBTC: number;
  address: string;
  transactions: number;
}

const BitcoinWalletSection: React.FC = () => {
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [balance, setBalance] = useState<BalanceData | null>(null);

  const handleWalletGenerated = (walletData: WalletData) => {
    setWallet(walletData);
    setBalance(null); // Reset balance when new wallet is generated
  };

  const handleBalanceUpdated = (balanceData: BalanceData) => {
    setBalance(balanceData);
  };

  const handleBalanceUpdate = () => {
    // This function can be used to trigger balance refresh
    setBalance(null);
  };

  return (
    <div className="space-y-6">
      <PoolWalletInfo />
      
      <BitcoinWalletGeneration 
        wallet={wallet} 
        onWalletGenerated={handleWalletGenerated} 
      />
      
      <EarningsPayoutConverter 
        wallet={wallet} 
        onBalanceUpdate={handleBalanceUpdate} 
      />
      
      <BitcoinBalance 
        wallet={wallet} 
        balance={balance} 
        onBalanceUpdated={handleBalanceUpdated} 
      />

      <BitcoinDebugger wallet={wallet} />

      <BitcoinWithdrawal 
        wallet={wallet} 
        balance={balance} 
        onBalanceUpdate={handleBalanceUpdate} 
      />

      <BlockchainExplorer address="bc1qynefm4c3rwcwwclep6095dnjgatr9faz4rj0tn" />

      <BitcoinTransactionTracker />
    </div>
  );
};

export default BitcoinWalletSection;
