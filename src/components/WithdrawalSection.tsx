import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CreditCard, Send, Settings, Loader2, Smartphone } from 'lucide-react';
import { useStripeCheckout } from '@/hooks/useStripeCheckout';
import { stripeService } from '@/services/stripeService';
import { useToast } from '@/hooks/use-toast';
import { useCashAppPayout } from '@/hooks/useCashAppPayout';
import CashAppSetup from './CashAppSetup';

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
  const [currencyType] = useState('USD');
  const [cashAppTag, setCashAppTag] = useState('');
  const [cashAppSetupComplete, setCashAppSetupComplete] = useState(false);
  const [showCashAppSetup, setShowCashAppSetup] = useState(false);
  
  const { loading, createPayout } = useStripeCheckout();
  const { loading: cashAppLoading, createCashAppPayout, setupCashAppAccount, setupLoading, connectAccountId } = useCashAppPayout();
  const { toast } = useToast();

  // Check if user has completed Cash App setup by looking for URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const cashAppSetupStatus = urlParams.get('cashapp_setup');
    const accountId = urlParams.get('account');
    
    if (cashAppSetupStatus === 'success' && accountId) {
      console.log('Cash App setup completed successfully:', accountId);
      setCashAppSetupComplete(true);
      
      // Clean up URL parameters
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
      
      toast({
        title: "Cash App Setup Complete",
        description: "You can now withdraw funds to your Cash App account!",
      });
    }
    
    // Also check if we have a connectAccountId from the hook
    if (connectAccountId) {
      setCashAppSetupComplete(true);
    }
  }, [connectAccountId, toast]);

  const handleBankWithdraw = async () => {
    try {
      console.log('Starting bank withdrawal for user:', userEmail);
      
      await createPayout({
        amount: earnings,
        description: `Withdraw $${earnings.toFixed(2)} to Bank Account`,
        userEmail: userEmail && userEmail.includes('@') ? userEmail : `${userEmail}@example.com`,
        userId: userId,
        method: 'bank_transfer'
      });
      
      console.log('Bank withdrawal completed successfully');
      onWithdraw();
    } catch (error) {
      console.error('Bank withdrawal failed:', error);
    }
  };

  const handleCashAppWithdraw = async () => {
    if (!cashAppSetupComplete || !cashAppTag) {
      setShowCashAppSetup(true);
      return;
    }

    try {
      console.log('Processing Cash App payout:', { amount: earnings, cashAppTag });
      
      await createCashAppPayout({
        amount: earnings,
        cashAppTag: cashAppTag,
        email: userEmail && userEmail.includes('@') ? userEmail : `${userEmail}@example.com`,
        userId: userId,
        description: `Withdraw $${earnings.toFixed(2)} to Cash App ${cashAppTag}`
      });
      
      console.log('Cash App payout completed successfully');
      onWithdraw();
    } catch (error) {
      console.error('Cash App payout failed:', error);
    }
  };

  const handleBankSetup = async () => {
    try {
      console.log('Setting up bank account for user:', userEmail);
      
      // For bank setup, we can use a small verification amount
      await createPayout({
        amount: 0.50, // Minimum verification amount
        description: 'Bank Account Setup Verification',
        userEmail: userEmail && userEmail.includes('@') ? userEmail : `${userEmail}@example.com`,
        userId: userId,
        method: 'bank_transfer'
      });
      
      console.log('Bank setup verification completed');
    } catch (error) {
      console.error('Bank setup failed:', error);
    }
  };

  const handleCashAppSetupStart = async () => {
    if (!cashAppTag.trim()) {
      toast({
        title: "Cash App Tag Required",
        description: "Please enter your Cash App tag before setting up payouts.",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('Starting Cash App setup process:', { cashAppTag, userEmail, userId });
      
      await setupCashAppAccount(userEmail, userId, cashAppTag);
      
      // The setupCashAppAccount function will handle opening the onboarding URL
      // and showing appropriate toasts
    } catch (error) {
      console.error('Cash App setup initiation failed:', error);
    }
  };

  const handleCashAppSetupComplete = (connectAccountId: string) => {
    console.log('Cash App setup completed:', connectAccountId);
    setCashAppSetupComplete(true);
    setShowCashAppSetup(false);
    toast({
      title: "Cash App Setup Complete",
      description: "You can now withdraw funds to your Cash App account!",
    });
  };

  const formatCashAppTag = (value: string) => {
    let formatted = value.replace(/^\$+/, '');
    if (formatted && !formatted.startsWith('$')) {
      formatted = '$' + formatted;
    }
    return formatted;
  };

  // Show withdrawal section if minimum threshold is met and hasn't withdrawn
  if (earnings < 10 || hasWithdrawn) {
    return null;
  }

  if (showCashAppSetup) {
    return (
      <div className="space-y-4">
        <CashAppSetup
          userEmail={userEmail}
          userId={userId}
          onSetupComplete={handleCashAppSetupComplete}
        />
        <Button
          variant="outline"
          onClick={() => setShowCashAppSetup(false)}
          className="w-full"
        >
          Back to Withdrawal Options
        </Button>
      </div>
    );
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
              <span className="text-xs">Cash App Pay</span>
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
                Your withdrawal will be processed securely through Stripe.
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-sm font-medium mb-2 block">Withdrawal Type</Label>
                <Input
                  type="text"
                  value="Bank Transfer"
                  readOnly
                  className="bg-muted text-muted-foreground"
                />
              </div>
              <div>
                <Label className="text-sm font-medium mb-2 block">Currency Type</Label>
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

        {/* Cash App Pay Section */}
        {withdrawalMethod === 'cashapp' && (
          <div className="space-y-3">
            <div className="p-3 bg-green-50 rounded-md">
              <p className="text-sm text-green-800">
                <strong>Cash App Payouts:</strong> Receive money directly to your Cash App account. 
                {!cashAppSetupComplete && ' Setup required for first-time use.'}
                {cashAppSetupComplete && ' Setup complete - ready for instant payouts!'}
              </p>
            </div>
            
            {/* Always show Cash App tag input field */}
            <div className="space-y-3">
              <div>
                <Label htmlFor="cashAppTagInput" className="text-sm font-medium mb-2 block">
                  Your Cash App Tag
                </Label>
                <Input
                  id="cashAppTagInput"
                  type="text"
                  placeholder="$username"
                  value={cashAppTag}
                  onChange={(e) => setCashAppTag(formatCashAppTag(e.target.value))}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Enter your Cash App $cashtag to enable payouts
                </p>
              </div>
              
              {!cashAppSetupComplete && (
                <Button
                  onClick={handleCashAppSetupStart}
                  variant="outline"
                  className="w-full"
                  disabled={!cashAppTag.trim() || setupLoading}
                >
                  {setupLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Setting up...
                    </>
                  ) : (
                    <>
                      <Settings className="h-4 w-4 mr-2" />
                      Setup Cash App Payouts
                    </>
                  )}
                </Button>
              )}
            </div>

            <Button 
              onClick={handleCashAppWithdraw} 
              disabled={cashAppLoading || !cashAppSetupComplete || !cashAppTag.trim()}
              className="w-full"
              variant="default"
            >
              {cashAppLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing Payout...
                </>
              ) : !cashAppSetupComplete ? (
                <>
                  <Settings className="h-4 w-4 mr-2" />
                  Complete Setup First
                </>
              ) : !cashAppTag.trim() ? (
                <>
                  <Settings className="h-4 w-4 mr-2" />
                  Enter Cash App Tag
                </>
              ) : (
                <>
                  <Smartphone className="h-4 w-4 mr-2" />
                  Send ${earnings.toFixed(2)} to Cash App
                </>
              )}
            </Button>
          </div>
        )}

        <div className="p-3 bg-gray-50 rounded-md">
          <p className="text-sm text-gray-800">
            <strong>Secure Withdrawals:</strong> All withdrawals are processed through Stripe's secure payment system. 
            Money will be deposited directly to your selected account.
          </p>
        </div>

        <div className="text-xs text-muted-foreground space-y-1">
          <p className="text-center">
            Secure withdrawals - Minimum withdrawal: $10.00
          </p>
          <div className="flex justify-between">
            <span>Method: {withdrawalMethod === 'bank' ? 'Bank Transfer' : 'Cash App Pay'}</span>
            <span>Currency: {currencyType}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WithdrawalSection;
