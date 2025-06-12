
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, CreditCard, ExternalLink } from 'lucide-react';
import { useStripeConnect } from '@/hooks/useStripeConnect';
import { stripeConnectService } from '@/services/stripeConnectService';
import { useToast } from '@/hooks/use-toast';
import {
  ConnectAccountOnboarding,
  ConnectComponentsProvider,
} from '@stripe/react-connect-js';

const StripeConnect: React.FC = () => {
  const [accountCreatePending, setAccountCreatePending] = useState(false);
  const [onboardingExited, setOnboardingExited] = useState(false);
  const [error, setError] = useState(false);
  const [connectedAccountId, setConnectedAccountId] = useState<string>();
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
          description: "Your Stripe Connect account has been created successfully.",
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
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setAccountCreatePending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="container mx-auto max-w-4xl space-y-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-primary mb-2">Stripe Connect Onboarding</h1>
          <p className="text-muted-foreground">Set up your account to start accepting payments</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Account Setup Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!connectedAccountId && (
              <div className="text-center space-y-4">
                <h3 className="text-xl font-semibold">Get ready to start earning</h3>
                <p className="text-muted-foreground">
                  Create your Stripe Connect account to begin accepting payments and receiving payouts.
                </p>
                
                {!accountCreatePending ? (
                  <Button 
                    onClick={handleCreateAccount}
                    size="lg"
                    className="w-full max-w-sm"
                  >
                    Create Stripe Account
                  </Button>
                ) : (
                  <Button disabled size="lg" className="w-full max-w-sm">
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating Account...
                  </Button>
                )}
              </div>
            )}

            {connectedAccountId && !stripeConnectInstance && (
              <div className="text-center space-y-4">
                <h3 className="text-xl font-semibold">Complete your account setup</h3>
                <p className="text-muted-foreground">
                  Loading onboarding form to complete your account information...
                </p>
                <div className="flex justify-center">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              </div>
            )}

            {stripeConnectInstance && (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-center">Complete Your Onboarding</h3>
                <ConnectComponentsProvider connectInstance={stripeConnectInstance}>
                  <ConnectAccountOnboarding
                    onExit={() => {
                      setOnboardingExited(true);
                      toast({
                        title: "Onboarding Complete",
                        description: "You can now start accepting payments!",
                      });
                    }}
                  />
                </ConnectComponentsProvider>
              </div>
            )}

            {error && (
              <div className="text-center p-4 bg-destructive/10 border border-destructive/20 rounded-md">
                <p className="text-destructive font-medium">Something went wrong!</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Please try again or contact support if the issue persists.
                </p>
              </div>
            )}

            {(connectedAccountId || accountCreatePending || onboardingExited) && (
              <div className="space-y-3 p-4 bg-muted rounded-md">
                <h4 className="font-semibold text-sm">Development Information</h4>
                {connectedAccountId && (
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">Account ID:</Badge>
                    <code className="text-xs bg-background px-2 py-1 rounded font-mono">
                      {connectedAccountId}
                    </code>
                  </div>
                )}
                {accountCreatePending && (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Creating connected account...</span>
                  </div>
                )}
                {onboardingExited && (
                  <Badge variant="default" className="bg-green-500 hover:bg-green-600">
                    Onboarding Completed
                  </Badge>
                )}
              </div>
            )}

            <div className="p-4 bg-blue-50 rounded-md border border-blue-200">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> This is a Connect onboarding implementation using Stripe's embedded components.{' '}
                <a 
                  href="https://docs.stripe.com/connect/onboarding/quickstart?connect-onboarding-surface=embedded" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 underline hover:no-underline"
                >
                  View documentation
                  <ExternalLink className="h-3 w-3" />
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StripeConnect;
