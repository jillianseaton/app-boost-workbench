
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import SecureBankTransferDashboard from '@/components/SecureBankTransferDashboard';
import LoginSignup from '@/components/LoginSignup';

const SecureBankTransferPage: React.FC = () => {
  const { user, loading } = useAuth();
  const [currentBalance] = React.useState(1250.75); // Mock balance for demo

  const handleDepositSuccess = (amount: number) => {
    console.log(`Deposit of $${amount} processed successfully`);
    // In a real app, this would update the user's balance
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Secure Bank Transfer Dashboard
            </h1>
            <p className="text-gray-600">
              Please sign in to access your secure bank transfer dashboard
            </p>
          </div>
          <LoginSignup onLogin={() => {}} />
        </div>
      </div>
    );
  }

  const userEmail = user.email || '';
  const userId = user.id || '';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Secure Bank Transfer Dashboard
          </h1>
          <p className="text-gray-600">
            Manage your bank accounts and process secure transfers with complete audit trails
          </p>
        </div>
        
        <SecureBankTransferDashboard
          currentBalance={currentBalance}
          onDepositSuccess={handleDepositSuccess}
          userEmail={userEmail}
          userId={userId}
        />
      </div>
    </div>
  );
};

export default SecureBankTransferPage;
