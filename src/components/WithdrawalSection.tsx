
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CreditCard, Send, Settings, Loader2 } from 'lucide-react';
import { useStripeCheckout } from '@/hooks/useStripeCheckout';

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
  const { loading, createCheckoutSession } = useStripeCheckout();

  const handleBankSetup = async () => {
    try {
      console.log('Starting bank setup with email:', userEmail);
      
      // Create a checkout session for bank account setup (minimal amount)
      const result = await createCheckoutSession({
        amount: 100, // $1.00 verification charge
        description: 'Bank Account Setup Verification',
        successUrl: `${window.location.origin}/account-setup-success`,
        cancelUrl: `${window.location.origin}/account-setup-cancelled`,
        customerEmail: userEmail && userEmail.includes('@') ? userEmail : `${userEmail}@example.com`, // Ensure valid email format
        mode: 'setup'
      });
      
      console.log('Bank setup session created, redirecting...');
    } catch (error) {
      console.error('Bank setup failed:', error);
    }
  };

  const handleWithdraw = async () => {
    try {
      console.log('Starting withdrawal with email:', userEmail);
      
      // Create checkout session for the actual withdrawal
      const result = await createCheckoutSession({
        amount: Math.round(earnings * 100), // Convert to cents
        description: `Withdraw $${earnings.toFixed(2)} to Bank Account`,
        successUrl: `${window.location.origin}/withdrawal-success`,
        cancelUrl: `${window.location.origin}/withdrawal-cancelled`,
        customerEmail: userEmail && userEmail.includes('@') ? userEmail : `${userEmail}@example.com`, // Ensure valid email format
        mode: 'payment'
      });
      
      console.log('Withdrawal session created, redirecting...');
      
      // Call the parent onWithdraw to update the dashboard state
      onWithdraw();
    } catch (error) {
      console.error('Withdrawal failed:', error);
    }
  };

  // Show withdrawal section if minimum threshold is met and hasn't withdrawn
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
              Your withdrawal will be processed securely through Stripe Checkout.
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

          <div className="p-3 bg-green-50 rounded-md">
            <p className="text-sm text-green-800">
              <strong>Testing Mode:</strong> Buttons will redirect to Stripe Checkout. If the page doesn't redirect, check if popups are blocked in your browser.
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button 
            onClick={handleWithdraw} 
            disabled={loading}
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
            onClick={handleBankSetup}
            variant="outline"
            className="flex-1"
            disabled={loading}
          >
            {loading ? (
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
          <p className="text-center">Secure withdrawals powered by Stripe Checkout. Minimum withdrawal: $10.00</p>
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
