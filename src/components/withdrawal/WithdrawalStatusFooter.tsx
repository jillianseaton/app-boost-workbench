
import React from 'react';

type WithdrawalMethod = 'bank' | 'cashapp' | 'payout-link';

interface WithdrawalStatusFooterProps {
  withdrawalMethod: WithdrawalMethod;
  cashAppReady: boolean;
  statusLoading: boolean;
}

const WithdrawalStatusFooter: React.FC<WithdrawalStatusFooterProps> = ({
  withdrawalMethod,
  cashAppReady,
  statusLoading,
}) => {
  const getMethodName = () => {
    switch (withdrawalMethod) {
      case 'bank':
        return 'Bank Transfer';
      case 'cashapp':
        return 'Cash App Pay';
      case 'payout-link':
        return 'Payout Link';
      default:
        return 'Unknown';
    }
  };

  const getStatus = () => {
    if (withdrawalMethod === 'cashapp') {
      return statusLoading ? 'Checking...' : (cashAppReady ? 'Ready' : 'Setup Required');
    }
    return 'Available';
  };

  return (
    <div className="text-xs text-muted-foreground space-y-1">
      <p className="text-center">
        Secure withdrawals - Minimum withdrawal: $10.00
      </p>
      <div className="flex justify-between">
        <span>Method: {getMethodName()}</span>
        <span>Status: {getStatus()}</span>
      </div>
    </div>
  );
};

export default WithdrawalStatusFooter;
