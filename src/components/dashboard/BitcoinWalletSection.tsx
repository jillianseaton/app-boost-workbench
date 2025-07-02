
import React, { useState } from 'react';
import BitcoinWalletGeneration from '@/components/bitcoin/BitcoinWalletGeneration';
import BitcoinBalance from '@/components/bitcoin/BitcoinBalance';
import EarningsConverter from '@/components/bitcoin/EarningsConverter';
import BitcoinWithdrawal from '@/components/bitcoin/BitcoinWithdrawal';

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
      <BitcoinWalletGeneration 
        wallet={wallet} 
        onWalletGenerated={handleWalletGenerated} 
      />
      
      <EarningsConverter wallet={wallet} />
      
      <BitcoinBalance 
        wallet={wallet} 
        balance={balance} 
        onBalanceUpdated={handleBalanceUpdated} 
      />

      <BitcoinWithdrawal 
        wallet={wallet} 
        balance={balance} 
        onBalanceUpdate={handleBalanceUpdate} 
      />
    </div>
  );
};

export default BitcoinWalletSection;
