
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CreditCard, Send, Settings, Loader2, Smartphone, RefreshCw, CheckCircle } from 'lucide-react';
import { useStripeCheckout } from '@/hooks/useStripeCheckout';
import { stripeService } from '@/services/stripeService';
import { useToast } from '@/hooks/use-toast';
import { useCashAppPayout } from '@/hooks/useCashAppPayout';
import { useCashAppStatus } from '@/hooks/useCashAppStatus';
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
  const [showCashAppSetup, setShowCashAppSetup] = useState(false);
  
  const { loading, createPayout } = useStripeCheckout();
  const { loading: cashAppLoading, createCashAppPayout, setupCashAppAccount, setupLoading, connectAccountId } = useCashAppPayout();
  const { status: cashAppStatus, loading: statusLoading, refreshStatus } = useCashAppStatus(userId);
  const { toast } = useToast();

  // Persistent storage keys
  const CASHAPP_TAG_KEY = `cashapp_tag_${userId}`;

  // Load persisted Cash App tag on component mount
  useEffect(() => {
    if (userId) {
      const savedCashAppTag = localStorage.getItem(CASHAPP_TAG_KEY);
      if (savedCashAppTag) {
        console.log('Loading saved Cash App tag for user:', userId);
        setCashAppTag(savedCashAppTag);
      }
    }
  }, [userId]);

  // Check for onboarding completion from URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const cashAppSetupStatus = urlParams.get('cashapp_setup');
    const accountId = urlParams.get('account');
    
    if (cashAppSetupStatus === 'success' && accountId && userId) {
      console.log('Cash App setup completed successfully via URL:', accountId);
      
      // Trigger status refresh with the new account ID
      refreshStatus(accountId);
      
      // Clean up URL parameters after a short delay
      setTimeout(() => {
        const newUrl = window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);
      }, 1000);
      
      toast({
        title: "Cash App Setup Complete",
        description: "Checking your account status...",
      });
    }
  }, [userId, refreshStatus, toast]);

  // Check hook state for connectAccountId and trigger status refresh
  useEffect(() => {
    if (connectAccountId && userId) {
      console.log('Cash App setup completed successfully via hook:', connectAccountId);
      refreshStatus(connectAccountId);
    }
  }, [connectAccountId, userId, refreshStatus]);

  // Persist cashAppTag when it changes
  useEffect(() => {
    if (cashAppTag && userId) {
      localStorage.setItem(CASHAPP_TAG_KEY, cashAppTag);
    }
  }, [cashAppTag, userId]);

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
    if (!cashAppStatus.onboarded || !cashAppStatus.payoutsEnabled) {
      console.log('Cash App setup not complete or payouts not enabled, redirecting to setup');
      setShowCashAppSetup(true);
      return;
    }

    if (!cashAppTag.trim()) {
      toast({
        title: "Cash App Tag Required",
        description: "Please enter your Cash App tag to proceed with withdrawal.",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('Processing Cash App payout:', { 
        amount: earnings, 
        cashAppTag, 
        onboarded: cashAppStatus.onboarded,
        payoutsEnabled: cashAppStatus.payoutsEnabled 
      });
      
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
      
      await createPayout({
        amount: 0.50,
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
    } catch (error) {
      console.error('Cash App setup initiation failed:', error);
    }
  };

  const handleCashAppSetupComplete = (connectAccountId: string) => {
    console.log('Cash App setup completed:', connectAccountId);
    setShowCashAppSetup(false);
    
    // Trigger status refresh after setup completion
    refreshStatus(connectAccountId);
    
    toast({
      title: "Cash App Setup Complete",
      description: "Checking your account status...",
    });
  };

  const handleStatusRefresh = () => {
    console.log('Manual status refresh requested');
    refreshStatus(cashAppStatus.connectAccountId);
  };

  const handleStatusUpdate = () => {
    console.log('Status update triggered from CashAppSetup');
    refreshStatus(cashAppStatus.connectAccountId);
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
          onStatusUpdate={handleStatusUpdate}
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

  const cashAppReady = cashAppStatus.onboarded && cashAppStatus.payoutsEnabled;

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
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                {statusLoading ? (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Checking...
                  </>
                ) : cashAppReady ? (
                  <>
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    Ready
                  </>
                ) : (
                  'Setup Required'
                )}
              </span>
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
            <div className={`p-3 rounded-md ${cashAppReady ? 'bg-green-50' : 'bg-yellow-50'}`}>
              <div className="flex items-center justify-between">
                <p className={`text-sm ${cashAppReady ? 'text-green-800' : 'text-yellow-800'}`}>
                  <strong>Cash App Status:</strong> {cashAppReady 
                    ? 'Ready for instant payouts!' 
                    : 'Setup required or pending verification.'
                  }
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleStatusRefresh}
                  disabled={statusLoading}
                  className="h-8 w-8 p-0"
                >
                  <RefreshCw className={`h-4 w-4 ${statusLoading ? 'animate-spin' : ''}`} />
                </Button>
              </div>
              {cashAppStatus.requiresAction && (
                <p className="text-xs text-yellow-700 mt-1">
                  Additional verification may be required. Please complete your onboarding.
                </p>
              )}
            </div>
            
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
              
              {!cashAppReady && (
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
              disabled={cashAppLoading || !cashAppReady || !cashAppTag.trim()}
              className="w-full"
              variant="default"
            >
              {cashAppLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing Payout...
                </>
              ) : !cashAppReady ? (
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
            <span>Status: {withdrawalMethod === 'cashapp' 
              ? (statusLoading ? 'Checking...' : (cashAppReady ? 'Ready' : 'Setup Required'))
              : 'Available'
            }</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WithdrawalSection;
