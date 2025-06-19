import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard } from 'lucide-react';
import { useStripeConnect } from '@/hooks/useStripeConnect';
import { stripeConnectService } from '@/services/stripeConnectService';
import { useToast } from '@/hooks/use-toast';
import AccountCreationStep from './stripe-connect/AccountCreationStep';
import OnboardingFlow from './stripe-connect/OnboardingFlow';
import PayoutsSection from './stripe-connect/PayoutsSection';
import DevelopmentInfo from './stripe-connect/DevelopmentInfo';
import DocumentationNote from './stripe-connect/DocumentationNote';
import ExpressDashboardAccess from './stripe-connect/ExpressDashboardAccess';

const StripeConnect: React.FC = () => {
  const [accountCreatePending, setAccountCreatePending] = useState(false);
  const [onboardingExited, setOnboardingExited] = useState(false);
  const [error, setError] = useState(false);
  const [connectedAccountId, setConnectedAccountId] = useState<string>();
  const [showPayouts, setShowPayouts] = useState(false);
  const stripeConnectInstance = useStripeConnect(connectedAccountId);
  const { toast } = useToast();

  const handleCreateAccount = async () => {
    setAccountCreatePending(true);
    setError(false);
    
    try {
      const result = await stripeConnectService.createAccount();
      
      if (result.account) {
        setConnectedAccountId(result.account);
        toast({
          title: "Account Created",
          description: "Your Stripe Connect account has been created successfully with Express dashboard access.",
        });
      } else {
        setError(true);
        toast({
          title: "Account Creation Failed",
          description: result.error || "Failed to create Stripe account",
          variant: "destructive",
        });
      }
    } catch (err) {
      setError(true);
      toast({
        title: "Error",
        description: "An unexpected error occurred during account creation",
        variant: "destructive",
      });
    } finally {
      setAccountCreatePending(false);
    }
  };

  const handleOnboardingExit = () => {
    setOnboardingExited(true);
    setShowPayouts(true);
    toast({
      title: "Onboarding Complete",
      description: "Your account is now ready for payments and payouts!",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="container mx-auto max-w-4xl space-y-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-primary mb-2">Stripe Connect Onboarding</h1>
          <p className="text-muted-foreground">QuickStart integration with Express dashboard</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Express Account Setup
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!connectedAccountId && (
              <AccountCreationStep
                onCreateAccount={handleCreateAccount}
                isLoading={accountCreatePending}
                hasError={error}
              />
            )}

            <OnboardingFlow
              stripeConnectInstance={stripeConnectInstance}
              onboardingExited={onboardingExited}
              onOnboardingExit={handleOnboardingExit}
            />

            <DevelopmentInfo
              connectedAccountId={connectedAccountId}
              accountCreatePending={accountCreatePending}
              onboardingExited={onboardingExited}
            />

            <DocumentationNote />
          </CardContent>
        </Card>

        <ExpressDashboardAccess
          connectedAccountId={connectedAccountId}
          onboardingCompleted={onboardingExited}
        />

        <PayoutsSection
          stripeConnectInstance={stripeConnectInstance}
          showPayouts={showPayouts && onboardingExited}
        />
      </div>
    </div>
  );
};

export default StripeConnect;
