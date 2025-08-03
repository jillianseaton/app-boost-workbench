
import React from 'react';
import StripePayoutButton from '@/components/StripePayoutButton';
import StripeAppPayoutCard from '@/components/StripeAppPayoutCard';

const PaymentPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Payment & Payout Services</h1>
          <p className="text-gray-600">Manage your earnings and withdraw funds using Stripe</p>
        </div>

        {/* Express Payout Button */}
        <StripePayoutButton 
          title="Express Account Payout"
          description="Direct payout to your Stripe Express account"
          method="standard"
          className="w-full"
        />

        {/* App Payout Card */}
        <StripeAppPayoutCard />
      </div>
    </div>
  );
};

export default PaymentPage;
