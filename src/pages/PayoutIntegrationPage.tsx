
import React from 'react';
import CommissionDashboard from '@/components/CommissionDashboard';
import { useAuth } from '@/hooks/useAuth';

const PayoutIntegrationPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Commission Payout Dashboard
          </h1>
          <p className="text-gray-600">
            View your earnings and request payouts from your commission balance
          </p>
        </div>
        
        {user ? (
          <CommissionDashboard userId={user.id} />
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-600">Please sign in to view your payout dashboard.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PayoutIntegrationPage;
