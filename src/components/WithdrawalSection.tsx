
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useStripeCheckout } from '@/hooks/useStripeCheckout';
import { useToast } from '@/hooks/use-toast';
import { useCashAppPayout } from '@/hooks/useCashAppPayout';
import { useCashAppStatus } from '@/hooks/useCashAppStatus';
import CashAppSetup from './CashAppSetup';
import CashAppPayoutLink from './CashAppPayoutLink';
import WithdrawalMethodSelector from './withdrawal/WithdrawalMethodSelector';
import BankTransferSection from './withdrawal/BankTransferSection';
import CashAppPaySection from './withdrawal/CashAppPaySection';
import WithdrawalStatusFooter from './withdrawal/WithdrawalStatusFooter';

interface WithdrawalSectionProps {
  earnings: number;
  hasWithdrawn: boolean;
  onWithdraw: () => void;
  userEmail?: string;
  userId?: string;
}

type WithdrawalMethod = 'bank' | 'cashapp' | 'payout-link';

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

        <WithdrawalMethodSelector
          withdrawalMethod={withdrawalMethod}
          onMethodChange={setWithdrawalMethod}
          cashAppReady={cashAppReady}
          statusLoading={statusLoading}
        />

        {withdrawalMethod === 'bank' && (
          <BankTransferSection
            earnings={earnings}
            loading={loading}
            currencyType={currencyType}
            onWithdraw={handleBankWithdraw}
            onSetup={handleBankSetup}
          />
        )}

        {withdrawalMethod === 'cashapp' && (
          <CashAppPaySection
            earnings={earnings}
            cashAppTag={cashAppTag}
            onCashAppTagChange={setCashAppTag}
            cashAppStatus={cashAppStatus}
            cashAppLoading={cashAppLoading}
            setupLoading={setupLoading}
            statusLoading={statusLoading}
            cashAppReady={cashAppReady}
            onWithdraw={handleCashAppWithdraw}
            onSetupStart={handleCashAppSetupStart}
            onStatusRefresh={handleStatusRefresh}
          />
        )}

        {withdrawalMethod === 'payout-link' && (
          <div className="space-y-3">
            <CashAppPayoutLink
              userEmail={userEmail}
              userId={userId}
            />
          </div>
        )}

        {/* Secure Withdrawals Note */}
        <div className="p-3 bg-gray-50 rounded-md">
          <p className="text-sm text-gray-800">
            <strong>Secure Withdrawals:</strong> All withdrawals are processed through Stripe's secure payment system. 
            Money will be deposited directly to your selected account.
          </p>
        </div>

        <WithdrawalStatusFooter
          withdrawalMethod={withdrawalMethod}
          cashAppReady={cashAppReady}
          statusLoading={statusLoading}
        />
      </CardContent>
    </Card>
  );
};

export default WithdrawalSection;
