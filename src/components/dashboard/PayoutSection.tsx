
import React from 'react';
import PayoutStatusChecker from '@/components/PayoutStatusChecker';
import StripeTransferButton from '@/components/StripeTransferButton';
import CommissionDashboard from '@/components/CommissionDashboard';
import StripePaymentCollection from '@/components/StripePaymentCollection';
import LovablePayoutIntegration from '@/components/LovablePayoutIntegration';
import StripePaymentButton from '@/components/StripePaymentButton';
import StripePayoutButton from '@/components/StripePayoutButton';

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

      {/* Stripe Payment and Payout Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StripePaymentButton 
          title="Accept Payments With This Link"
          description="Start accepting secure payments instantly with Stripe"
        />
        <StripePayoutButton
          title="Quick Payout"
          description="Process your payout quickly and securely with Stripe"
        />
      </div>
    </div>
  );
};

export default PayoutSection;
