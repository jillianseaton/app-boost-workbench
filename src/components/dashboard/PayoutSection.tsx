
import React from 'react';
import BitcoinWalletSection from './BitcoinWalletSection';

interface PayoutSectionProps {
  userId: string;
}

const PayoutSection: React.FC<PayoutSectionProps> = ({ userId }) => {
  return (
    <div className="space-y-6">
      {/* Bitcoin Wallet Integration */}
      <BitcoinWalletSection />
    </div>
  );
};

export default PayoutSection;
