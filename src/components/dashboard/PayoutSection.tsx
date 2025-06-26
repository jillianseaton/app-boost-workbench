
import React from 'react';
import PayoutStatusChecker from '@/components/PayoutStatusChecker';
import StripeTransferButton from '@/components/StripeTransferButton';
import CommissionDashboard from '@/components/CommissionDashboard';
import StripePaymentCollection from '@/components/StripePaymentCollection';
import LovablePayoutIntegration from '@/components/LovablePayoutIntegration';

interface PayoutSectionProps {
  userId: string;
}

const PayoutSection: React.FC<PayoutSectionProps> = ({ userId }) => {
  return (
    <div className="space-y-6">
      {/* Payout Status Checker */}
      <PayoutStatusChecker />

      {/* Stripe Transfer Component */}
      <StripeTransferButton />

      {/* Commission Dashboard */}
      <CommissionDashboard userId={userId} />

      {/* Stripe Payment Collection */}
      <StripePaymentCollection />

      {/* Lovable to Stripe Payout Integration */}
      <LovablePayoutIntegration />
    </div>
  );
};

export default PayoutSection;
