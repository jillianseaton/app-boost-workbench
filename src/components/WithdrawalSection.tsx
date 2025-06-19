
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CreditCard, Send, Settings, Loader2, Smartphone } from 'lucide-react';
import { useStripeCheckout } from '@/hooks/useStripeCheckout';

interface WithdrawalSectionProps {
  earnings: number;
  hasWithdrawn: boolean;
  onWithdraw: () => void;
  userEmail?: string;
  userId?: string;
}

type WithdrawalMethod = 'bank' | 'cashapp';

const WithdrawalSection: React.FC<WithdrawalSectionProps> = ({ 
  earnings, 
  hasWithdrawn, 
  onWithdraw,
  userEmail = '',
  userId = ''
}) => {
  const [withdrawalMethod, setWithdrawalMethod] = useState<WithdrawalMethod>('bank');
  const [cashAppTag, setCashAppTag] = useState('');
  const [currencyType] = useState('USD');
  const { loading, createCheckoutSession } = useStripeCheckout();

  const handleBankSetup = async () => {
    try {
      console.log('Starting bank setup with email:', userEmail);
      
      const result = await createCheckoutSession({
        amount: 100,
        description: 'Bank Account Setup Verification',
        successUrl: `${window.location.origin}/account-setup-success`,
        cancelUrl: `${window.location.origin}/account-setup-cancelled`,
        customerEmail: userEmail && userEmail.includes('@') ? userEmail : `${userEmail}@example.com`,
        mode: 'setup'
      });
      
      console.log('Bank setup session created, redirecting...');
    } catch (error) {
      console.error('Bank setup failed:', error);
    }
  };

  const handleCashAppWithdraw = async () => {
    if (!cashAppTag.trim()) {
      alert('Please enter your Cash App $Cashtag');
      return;
    }

    if (!cashAppTag.startsWith('$')) {
      alert('Cash App tag must start with $ (e.g., $username)');
      return;
    }

    try {
      console.log('Processing Cash App withdrawal:', { cashAppTag, amount: earnings });
      
      // Simulate Cash App withdrawal processing
      setTimeout(() => {
        onWithdraw();
        alert(`Successfully initiated $${earnings.toFixed(2)} withdrawal to ${cashAppTag}. Funds typically arrive within minutes.`);
      }, 1500);
      
    } catch (error) {
      console.error('Cash App withdrawal failed:', error);
      alert('Cash App withdrawal failed. Please try again.');
    }
  };

  const handleBankWithdraw = async () => {
    try {
      console.log('Starting withdrawal with email:', userEmail);
      
      const result = await createCheckoutSession({
        amount: Math.round(earnings * 100),
        description: `Withdraw $${earnings.toFixed(2)} to Bank Account`,
        successUrl: `${window.location.origin}/withdrawal-success`,
        cancelUrl: `${window.location.origin}/withdrawal-cancelled`,
        customerEmail: userEmail && userEmail.includes('@') ? userEmail : `${userEmail}@example.com`,
        mode: 'payment'
      });
      
      console.log('Withdrawal session created, redirecting...');
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
          <h3 className="text-lg font-semibold mb-2">Withdraw Your Earnings</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Ready to withdraw ${earnings.toFixed(2)} - Choose your preferred method
          </p>
        </div>

        {/* Withdrawal Method Selection */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Select Withdrawal Method</Label>
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant={withdrawalMethod === 'bank' ? 'default' : 'outline'}
              onClick={() => setWithdrawalMethod('bank')}
              className="h-20 flex flex-col gap-1"
            >
              <CreditCard className="h-5 w-5" />
              <span className="text-xs">Bank Transfer</span>
              <span className="text-xs text-muted-foreground">1-2 days</span>
            </Button>
            <Button
              variant={withdrawalMethod === 'cashapp' ? 'default' : 'outline'}
              onClick={() => setWithdrawalMethod('cashapp')}
              className="h-20 flex flex-col gap-1"
            >
              <Smartphone className="h-5 w-5" />
              <span className="text-xs">Cash App</span>
              <span className="text-xs text-muted-foreground">Instant</span>
            </Button>
          </div>
        </div>

        {/* Bank Transfer Section */}
        {withdrawalMethod === 'bank' && (
          <div className="space-y-3">
            <div className="p-3 bg-blue-50 rounded-md">
              <p className="text-sm text-blue-800">
                <strong>Processing Time:</strong> Bank transfers typically take 1-2 business days to arrive. 
                Your withdrawal will be processed securely through Stripe Checkout.
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-2 block">Withdrawal Type</label>
                <Input
                  type="text"
                  value="Bank Transfer"
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

            <div className="flex gap-2">
              <Button 
                onClick={handleBankWithdraw} 
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
          </div>
        )}

        {/* Cash App Section */}
        {withdrawalMethod === 'cashapp' && (
          <div className="space-y-3">
            <div className="p-3 bg-green-50 rounded-md">
              <p className="text-sm text-green-800">
                <strong>Instant Transfer:</strong> Cash App withdrawals are processed instantly. 
                Enter your $Cashtag to receive funds immediately.
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="cashAppTag" className="text-sm font-medium mb-2 block">
                  Cash App $Cashtag
                </Label>
                <Input
                  id="cashAppTag"
                  type="text"
                  placeholder="$username"
                  value={cashAppTag}
                  onChange={(e) => setCashAppTag(e.target.value)}
                  className="placeholder:text-muted-foreground"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Enter your $Cashtag (e.g., $johndoe)
                </p>
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

            <Button 
              onClick={handleCashAppWithdraw} 
              disabled={loading || !cashAppTag.trim()}
              className="w-full"
              variant="default"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Smartphone className="h-4 w-4 mr-2" />
                  Withdraw ${earnings.toFixed(2)} to {cashAppTag || 'Cash App'}
                </>
              )}
            </Button>
          </div>
        )}

        <div className="p-3 bg-gray-50 rounded-md">
          <p className="text-sm text-gray-800">
            <strong>Testing Mode:</strong> Both withdrawal methods are currently in demo mode. 
            Bank transfers redirect to Stripe Checkout, Cash App withdrawals are simulated.
          </p>
        </div>

        <div className="text-xs text-muted-foreground space-y-1">
          <p className="text-center">
            Secure withdrawals - Minimum withdrawal: $10.00
          </p>
          <div className="flex justify-between">
            <span>Method: {withdrawalMethod === 'bank' ? 'Bank Transfer' : 'Cash App'}</span>
            <span>Currency: {currencyType}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WithdrawalSection;
