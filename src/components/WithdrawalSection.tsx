
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CreditCard, Send, Settings, Loader2 } from 'lucide-react';
import { useStripe } from '@/hooks/useStripe';

interface WithdrawalSectionProps {
  earnings: number;
  hasWithdrawn: boolean;
  onWithdraw: () => void;
  userEmail?: string;
  userId?: string;
}

const WithdrawalSection: React.FC<WithdrawalSectionProps> = ({ 
  earnings, 
  hasWithdrawn, 
  onWithdraw,
  userEmail = '',
  userId = ''
}) => {
  const [withdrawType] = useState('Bank Transfer');
  const [currencyType] = useState('USD');
  const { loading, accountSetupLoading, createPayout, setupAccount } = useStripe();

  const handleWithdraw = async () => {
    if (earnings < 10) {
      return;
    }
    
    try {
      await createPayout({
        amount: earnings,
        email: userEmail,
        userId: userId,
      });
      
      // Call the parent onWithdraw to update the dashboard state
      onWithdraw();
    } catch (error) {
      console.error('Withdrawal failed:', error);
    }
  };

  const handleAccountSetup = async () => {
    try {
      const result = await setupAccount(userEmail, userId, window.location.origin);
      if (result?.onboardingUrl) {
        // Open Stripe onboarding in new tab
        window.open(result.onboardingUrl, '_blank');
      }
    } catch (error) {
      console.error('Account setup failed:', error);
    }
  };

  // Only show withdrawal section if minimum threshold is met and hasn't withdrawn
  if (earnings < 10 || hasWithdrawn) {
    return null;
  }

  return (
    <Card>
      <CardContent className="p-6 space-y-4">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <CreditCard className="h-5 w-5 text-blue-500" />
            <h3 className="text-lg font-semibold">Bank Account Withdrawal</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Ready to withdraw ${earnings.toFixed(2)} to your bank account
          </p>
          <div className="p-3 bg-blue-50 rounded-md mb-4">
            <p className="text-sm text-blue-800">
              <strong>Processing Time:</strong> Bank transfers typically take 1-2 business days to arrive. 
              Your withdrawal will be processed securely through Stripe.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium mb-2 block">Withdrawal Type</label>
              <Input
                type="text"
                value={withdrawType}
                readOnly
                className="bg-muted text-muted-foreground"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Currency Type</label>
              <Input
                type="text"
                value={currencyType}
                readOnly
                className="bg-muted text-muted-foreground"
              />
            </div>
          </div>

          <div className="p-3 bg-yellow-50 rounded-md">
            <p className="text-sm text-yellow-800">
              <strong>First-time setup required:</strong> Click "Setup Bank Account" to connect your bank account for withdrawals.
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button 
            onClick={handleWithdraw} 
            disabled={!userEmail || earnings < 10 || loading}
            className="flex-1"
            variant="default"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Withdraw ${earnings.toFixed(2)}
              </>
            )}
          </Button>
          <Button 
            onClick={handleAccountSetup}
            variant="outline"
            className="flex-1"
            disabled={!userEmail || accountSetupLoading}
          >
            {accountSetupLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Setting up...
              </>
            ) : (
              <>
                <Settings className="h-4 w-4 mr-2" />
                Setup Bank Account
              </>
            )}
          </Button>
        </div>

        <div className="text-xs text-muted-foreground space-y-1">
          <p className="text-center">Secure withdrawals powered by Stripe. Minimum withdrawal: $10.00</p>
          <div className="flex justify-between">
            <span>Method: {withdrawType}</span>
            <span>Currency: {currencyType}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WithdrawalSection;
