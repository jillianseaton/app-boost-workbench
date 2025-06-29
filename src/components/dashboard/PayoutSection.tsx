
import React from 'react';
import PayoutStatusChecker from '@/components/PayoutStatusChecker';
import CommissionDashboard from '@/components/CommissionDashboard';
import StripePaymentCollection from '@/components/StripePaymentCollection';
import TestCommissionAdder from '@/components/TestCommissionAdder';
import BitcoinWalletSection from './BitcoinWalletSection';

interface PayoutSectionProps {
  userId: string;
}

const PayoutSection: React.FC<PayoutSectionProps> = ({ userId }) => {
  return (
    <div className="space-y-6">
      {/* Test Commission Adder - for testing the payout system */}
      <TestCommissionAdder />

      {/* Commission Dashboard - Main authentic payout system */}
      <CommissionDashboard userId={userId} />

      {/* Bitcoin Wallet Integration */}
      <BitcoinWalletSection />

      {/* Payout Status Checker */}
      <PayoutStatusChecker />

      {/* Stripe Payment Collection */}
      <StripePaymentCollection />
    </div>
  );
};

export default PayoutSection;
