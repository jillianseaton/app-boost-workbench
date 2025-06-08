
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface WithdrawalSectionProps {
  earnings: number;
  hasWithdrawn: boolean;
  onWithdraw: () => void;
}

const WithdrawalSection: React.FC<WithdrawalSectionProps> = ({ 
  earnings, 
  hasWithdrawn, 
  onWithdraw 
}) => {
  if (earnings < 10 || hasWithdrawn) {
    return null;
  }

  return (
    <Card>
      <CardContent className="p-6 text-center space-y-4">
        <h3 className="text-lg font-semibold">Ready to withdraw?</h3>
        <Button onClick={onWithdraw} size="lg" variant="default">
          Withdraw ${earnings.toFixed(2)} to Bitcoin Wallet
        </Button>
        <p className="text-sm text-muted-foreground">
          Daily withdrawal required. Account will reset after withdrawal.
        </p>
      </CardContent>
    </Card>
  );
};

export default WithdrawalSection;
