
import React from 'react';
import LovablePayoutIntegration from '@/components/LovablePayoutIntegration';

const PayoutIntegrationPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Lovable to Stripe Payout Integration
          </h1>
          <p className="text-gray-600">
            Transfer your earnings directly to your Stripe-connected bank account
          </p>
        </div>
        
        <LovablePayoutIntegration />
      </div>
    </div>
  );
};

export default PayoutIntegrationPage;
