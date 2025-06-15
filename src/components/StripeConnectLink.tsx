
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, CreditCard, ExternalLink, CheckCircle, AlertCircle } from 'lucide-react';
import { stripeConnectLinkService } from '@/services/stripeConnectLinkService';
import { useToast } from '@/hooks/use-toast';

const StripeConnectLink: React.FC = () => {
  const [accountCreatePending, setAccountCreatePending] = useState(false);
  const [linkCreatePending, setLinkCreatePending] = useState(false);
  const [connectedAccountId, setConnectedAccountId] = useState<string>();
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [error, setError] = useState<string>();
  const { toast } = useToast();

  // Check URL parameters for return from Stripe onboarding
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get('success');
    const refresh = urlParams.get('refresh');
    const accountId = urlParams.get('account');

    if (success === 'true' && accountId) {
      setConnectedAccountId(accountId);
      setOnboardingComplete(true);
      toast({
        title: "Onboarding Successful",
        description: "Your Stripe account has been set up successfully!",
      });
      
      // Clean up URL parameters
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (refresh === 'true' && accountId) {
      setConnectedAccountId(accountId);
      toast({
        title: "Please Complete Onboarding",
        description: "Please complete the onboarding process to activate your account.",
        variant: "destructive",
      });
      
      // Clean up URL parameters
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [toast]);

  const handleCreateAccount = async () => {
    setAccountCreatePending(true);
    setError(undefined);
    
    try {
      const result = await stripeConnectLinkService.createConnectAccount();
      
      if (result.account) {
        setConnectedAccountId(result.account);
        toast({
          title: "Account Created",
          description: "Your Stripe Connect account has been created successfully.",
        });
      } else {
        throw new Error(result.error || 'Failed to create Stripe account');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      toast({
        title: "Account Creation Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setAccountCreatePending(false);
    }
  };

  const handleCreateAccountLink = async () => {
    if (!connectedAccountId) return;

    setLinkCreatePending(true);
    setError(undefined);
    
    try {
      const result = await stripeConnectLinkService.createAccountLink(connectedAccountId);
      
      if (result.url) {
        // Open the account link in a new tab
        window.open(result.url, '_blank');
        toast({
          title: "Onboarding Link Created",
          description: "Please complete the onboarding process in the new tab.",
        });
      } else {
        throw new Error(result.error || 'Failed to create account link');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      toast({
        title: "Link Creation Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLinkCreatePending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="container mx-auto max-w-4xl space-y-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-primary mb-2">Stripe Connect Account Links</h1>
          <p className="text-muted-foreground">Set up your account using Stripe's hosted onboarding</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Account Setup with Links
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            
            {/* Step 1: Create Account */}
            {!connectedAccountId && (
              <div className="text-center space-y-4">
                <h3 className="text-xl font-semibold">Step 1: Create Your Stripe Account</h3>
                <p className="text-muted-foreground">
                  First, we'll create a Stripe Connect account for you.
                </p>
                
                <Button 
                  onClick={handleCreateAccount}
                  disabled={accountCreatePending}
                  size="lg"
                  className="w-full max-w-sm"
                >
                  {accountCreatePending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    'Create Stripe Account'
                  )}
                </Button>
              </div>
            )}

            {/* Step 2: Complete Onboarding */}
            {connectedAccountId && !onboardingComplete && (
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-green-600 font-medium">Account Created</span>
                </div>
                
                <h3 className="text-xl font-semibold">Step 2: Complete Onboarding</h3>
                <p className="text-muted-foreground">
                  Now complete your account setup through Stripe's secure onboarding process.
                </p>
                
                <Button 
                  onClick={handleCreateAccountLink}
                  disabled={linkCreatePending}
                  size="lg"
                  className="w-full max-w-sm"
                >
                  {linkCreatePending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating Link...
                    </>
                  ) : (
                    <>
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Complete Onboarding
                    </>
                  )}
                </Button>
              </div>
            )}

            {/* Step 3: Onboarding Complete */}
            {onboardingComplete && (
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-green-600 font-medium text-lg">Setup Complete!</span>
                </div>
                
                <h3 className="text-xl font-semibold">Ready to Accept Payments</h3>
                <p className="text-muted-foreground">
                  Your Stripe Connect account is now set up and ready to process payments.
                </p>
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="flex items-center gap-2 p-4 bg-destructive/10 border border-destructive/20 rounded-md">
                <AlertCircle className="h-5 w-5 text-destructive" />
                <div>
                  <p className="text-destructive font-medium">Error</p>
                  <p className="text-sm text-muted-foreground">{error}</p>
                </div>
              </div>
            )}

            {/* Development Info */}
            {connectedAccountId && (
              <div className="space-y-3 p-4 bg-muted rounded-md">
                <h4 className="font-semibold text-sm">Development Information</h4>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">Account ID:</Badge>
                  <code className="text-xs bg-background px-2 py-1 rounded font-mono">
                    {connectedAccountId}
                  </code>
                </div>
                {onboardingComplete && (
                  <Badge variant="default" className="bg-green-500 hover:bg-green-600">
                    Onboarding Completed
                  </Badge>
                )}
              </div>
            )}

            <div className="p-4 bg-blue-50 rounded-md border border-blue-200">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> This implementation uses Stripe's Account Links for onboarding, which redirects users to Stripe's hosted onboarding flow.{' '}
                <a 
                  href="https://docs.stripe.com/connect/account-links" 
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

export default StripeConnectLink;
