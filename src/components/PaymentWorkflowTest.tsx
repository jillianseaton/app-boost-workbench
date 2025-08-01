import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, AlertCircle, CreditCard, RefreshCw } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { supabase } from '@/integrations/supabase/client';
import SubscriptionStatus from '@/components/SubscriptionStatus';

const PaymentWorkflowTest = () => {
  const { user, loading: authLoading, refreshSubscriptionStatus } = useAuth();
  const {
    subscribed,
    planName,
    status,
    loading: subLoading,
    error: subError,
    refreshSubscription,
    openCustomerPortal
  } = useSubscription();
  
  const [testResults, setTestResults] = useState<Array<{
    test: string;
    status: 'success' | 'error' | 'warning';
    message: string;
  }>>([]);
  const [testing, setTesting] = useState(false);

  const runPaymentWorkflowTests = async () => {
    setTesting(true);
    const results: Array<{test: string; status: 'success' | 'error' | 'warning'; message: string;}> = [];

    try {
      // Test 1: Authentication Check
      if (user) {
        results.push({
          test: 'User Authentication',
          status: 'success',
          message: `User authenticated: ${user.email}`
        });
      } else {
        results.push({
          test: 'User Authentication',
          status: 'error',
          message: 'User not authenticated'
        });
      }

      // Test 2: Edge Function - create-subscription-checkout
      if (!user) {
        results.push({
          test: 'Create Subscription Checkout',
          status: 'warning',
          message: 'Skipped - User not authenticated'
        });
      } else {
        try {
          const { data, error } = await supabase.functions.invoke('create-subscription-checkout', {
            body: { tier: 'basic' }
          });
          
          if (error) {
            // Check for common configuration issues
            if (error.message?.includes('STRIPE_SECRET_KEY')) {
              results.push({
                test: 'Create Subscription Checkout',
                status: 'warning',
                message: 'Stripe secret key not configured - this is expected in development'
              });
            } else {
              results.push({
                test: 'Create Subscription Checkout',
                status: 'error',
                message: `Edge function error: ${error.message}`
              });
            }
          } else if (data?.url) {
            results.push({
              test: 'Create Subscription Checkout',
              status: 'success',
              message: 'Checkout session created successfully'
            });
          } else {
            results.push({
              test: 'Create Subscription Checkout',
              status: 'warning',
              message: 'Function called but no URL returned'
            });
          }
        } catch (err) {
          const errorMsg = err instanceof Error ? err.message : 'Unknown error';
          if (errorMsg.includes('Failed to fetch') || errorMsg.includes('fetch')) {
            results.push({
              test: 'Create Subscription Checkout',
              status: 'warning',
              message: 'Network error - check if edge function is deployed'
            });
          } else {
            results.push({
              test: 'Create Subscription Checkout',
              status: 'error',
              message: `Function call failed: ${errorMsg}`
            });
          }
        }
      }

      // Test 3: Edge Function - check-subscription
      if (!user) {
        results.push({
          test: 'Check Subscription',
          status: 'warning',
          message: 'Skipped - User not authenticated'
        });
      } else {
        try {
          const { data, error } = await supabase.functions.invoke('check-subscription');
          
          if (error) {
            if (error.message?.includes('STRIPE_SECRET_KEY')) {
              results.push({
                test: 'Check Subscription',
                status: 'warning',
                message: 'Stripe secret key not configured - this is expected in development'
              });
            } else {
              results.push({
                test: 'Check Subscription',
                status: 'error',
                message: `Edge function error: ${error.message}`
              });
            }
          } else {
            results.push({
              test: 'Check Subscription',
              status: 'success',
              message: `Subscription status: ${data?.status || 'unknown'}`
            });
          }
        } catch (err) {
          const errorMsg = err instanceof Error ? err.message : 'Unknown error';
          if (errorMsg.includes('Failed to fetch') || errorMsg.includes('fetch')) {
            results.push({
              test: 'Check Subscription',
              status: 'warning',
              message: 'Network error - check if edge function is deployed'
            });
          } else {
            results.push({
              test: 'Check Subscription',
              status: 'error',
              message: `Function call failed: ${errorMsg}`
            });
          }
        }
      }

      // Test 4: Edge Function - customer-portal
      if (!user) {
        results.push({
          test: 'Customer Portal',
          status: 'warning',
          message: 'Skipped - User not authenticated'
        });
      } else {
        try {
          const { data, error } = await supabase.functions.invoke('customer-portal');
          
          if (error) {
            if (error.message?.includes('STRIPE_SECRET_KEY')) {
              results.push({
                test: 'Customer Portal',
                status: 'warning',
                message: 'Stripe secret key not configured - this is expected in development'
              });
            } else {
              results.push({
                test: 'Customer Portal',
                status: 'error',
                message: `Edge function error: ${error.message}`
              });
            }
          } else if (data?.url) {
            results.push({
              test: 'Customer Portal',
              status: 'success',
              message: 'Portal URL generated successfully'
            });
          } else {
            results.push({
              test: 'Customer Portal',
              status: 'warning',
              message: 'Function called but no URL returned'
            });
          }
        } catch (err) {
          const errorMsg = err instanceof Error ? err.message : 'Unknown error';
          if (errorMsg.includes('Failed to fetch') || errorMsg.includes('fetch')) {
            results.push({
              test: 'Customer Portal',
              status: 'warning',
              message: 'Network error - check if edge function is deployed'
            });
          } else {
            results.push({
              test: 'Customer Portal',
              status: 'error',
              message: `Function call failed: ${errorMsg}`
            });
          }
        }
      }

      // Test 5: Subscription Hook Status
      if (subError) {
        results.push({
          test: 'Subscription Hook',
          status: 'error',
          message: `Hook error: ${subError}`
        });
      } else {
        results.push({
          test: 'Subscription Hook',
          status: 'success',
          message: `Plan: ${planName}, Status: ${status}, Subscribed: ${subscribed}`
        });
      }

    } catch (error) {
      results.push({
        test: 'General Test Error',
        status: 'error',
        message: `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }

    setTestResults(results);
    setTesting(false);
  };

  const getStatusIcon = (status: 'success' | 'error' | 'warning') => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Workflow Test
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button 
              onClick={runPaymentWorkflowTests}
              disabled={testing || authLoading}
            >
              {testing ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Testing...
                </>
              ) : (
                'Run Payment Tests'
              )}
            </Button>
            <Button 
              onClick={refreshSubscription}
              variant="outline"
              disabled={subLoading}
            >
              {subLoading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                'Refresh Status'
              )}
            </Button>
          </div>

          {/* Test Results */}
          {testResults.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold text-sm">Test Results:</h3>
              {testResults.map((result, index) => (
                <Alert key={index} className="py-2">
                  <div className="flex items-start gap-2">
                    {getStatusIcon(result.status)}
                    <div className="flex-1">
                      <div className="font-medium text-sm">{result.test}</div>
                      <AlertDescription className="text-xs">
                        {result.message}
                      </AlertDescription>
                    </div>
                  </div>
                </Alert>
              ))}
            </div>
          )}

          {/* Current Status */}
          <div className="pt-4 border-t space-y-2">
            <h3 className="font-semibold text-sm">Current Status:</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>User: {user ? user.email : 'Not authenticated'}</div>
              <div>Loading: {authLoading || subLoading ? 'Yes' : 'No'}</div>
              <div>Subscribed: {subscribed ? 'Yes' : 'No'}</div>
              <div>Plan: {planName}</div>
              <div>Status: <Badge variant="secondary">{status}</Badge></div>
              <div>Error: {subError || 'None'}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subscription Status Component */}
      <SubscriptionStatus showManageButton={true} compact={false} />
    </div>
  );
};

export default PaymentWorkflowTest;