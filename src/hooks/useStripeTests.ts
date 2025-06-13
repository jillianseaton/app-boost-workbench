
import { useState } from 'react';
import { stripeService } from '@/services/stripeService';
import { stripeAdvancedService } from '@/services/stripeAdvancedService';
import { stripeConnectService } from '@/services/stripeConnectService';
import { useToast } from '@/hooks/use-toast';
import { TestResult } from '@/components/stripe-test/TestResult';

export const useStripeTests = () => {
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);
  const { toast } = useToast();

  const getBaseUrl = () => {
    return window.location.origin;
  };

  const runTests = async () => {
    setTesting(true);
    setResults([]);
    
    const baseUrl = getBaseUrl();
    
    const tests: TestResult[] = [
      { name: 'Create Payment Intent', status: 'pending' },
      { name: 'Create Checkout Session', status: 'pending' },
      { name: 'Create Stripe Connect Account', status: 'pending' },
      { name: 'Create Account Session', status: 'pending' },
      { name: 'Create Account Link', status: 'pending' },
      { name: 'Currency Checkout', status: 'pending' },
    ];

    setResults([...tests]);

    // Test 1: Create Payment Intent
    try {
      const paymentResult = await stripeService.createPaymentIntent({
        amount: 1000,
        description: 'Test payment',
        currency: 'usd',
      });
      
      tests[0] = {
        name: 'Create Payment Intent',
        status: paymentResult.success ? 'success' : 'error',
        message: paymentResult.success ? 'Payment intent created' : paymentResult.error
      };
    } catch (error) {
      tests[0] = {
        name: 'Create Payment Intent',
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error'
      };
    }
    setResults([...tests]);

    // Test 2: Create Checkout Session
    try {
      const checkoutResult = await stripeService.createCheckoutSession({
        amount: 1000,
        description: 'Test checkout',
        successUrl: `${baseUrl}/test-success`,
        cancelUrl: `${baseUrl}/test-cancel`,
        mode: 'payment'
      });
      
      tests[1] = {
        name: 'Create Checkout Session',
        status: checkoutResult.success ? 'success' : 'error',
        message: checkoutResult.success ? 'Checkout session created' : checkoutResult.error
      };
    } catch (error) {
      tests[1] = {
        name: 'Create Checkout Session',
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error'
      };
    }
    setResults([...tests]);

    // Test 3: Create Stripe Connect Account
    try {
      const connectResult = await stripeConnectService.createAccount();
      
      tests[2] = {
        name: 'Create Stripe Connect Account',
        status: connectResult.account ? 'success' : 'error',
        message: connectResult.account ? `Account created: ${connectResult.account}` : connectResult.error
      };
    } catch (error) {
      tests[2] = {
        name: 'Create Stripe Connect Account',
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error'
      };
    }
    setResults([...tests]);

    // Test 4: Create Account Session (if we have an account)
    if (tests[2].status === 'success' && tests[2].message?.includes('acct_')) {
      const accountId = tests[2].message.split(': ')[1];
      try {
        const sessionResult = await stripeConnectService.createAccountSession(accountId);
        
        tests[3] = {
          name: 'Create Account Session',
          status: sessionResult.client_secret ? 'success' : 'error',
          message: sessionResult.client_secret ? 'Account session created' : sessionResult.error
        };
      } catch (error) {
        tests[3] = {
          name: 'Create Account Session',
          status: 'error',
          message: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    } else {
      tests[3] = {
        name: 'Create Account Session',
        status: 'error',
        message: 'Skipped - no account available'
      };
    }
    setResults([...tests]);

    // Test 5: Create Account Link (if we have an account)
    if (tests[2].status === 'success' && tests[2].message?.includes('acct_')) {
      const accountId = tests[2].message.split(': ')[1];
      try {
        const linkResult = await stripeAdvancedService.createAccountLink({
          accountId,
          refreshUrl: `${baseUrl}/test-refresh`,
          returnUrl: `${baseUrl}/test-return`,
          collectionType: 'currently_due'
        });
        
        tests[4] = {
          name: 'Create Account Link',
          status: linkResult.success ? 'success' : 'error',
          message: linkResult.success ? 'Account link created' : linkResult.error
        };
      } catch (error) {
        tests[4] = {
          name: 'Create Account Link',
          status: 'error',
          message: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    } else {
      tests[4] = {
        name: 'Create Account Link',
        status: 'error',
        message: 'Skipped - no account available'
      };
    }
    setResults([...tests]);

    // Test 6: Currency Checkout (if we have an account)
    if (tests[2].status === 'success' && tests[2].message?.includes('acct_')) {
      const accountId = tests[2].message.split(': ')[1];
      try {
        const currencyResult = await stripeAdvancedService.createCurrencyCheckout({
          accountId,
          currency: 'USD',
          amount: 1000,
          productName: 'Test Product',
          successUrl: `${baseUrl}/test-success`,
          cancelUrl: `${baseUrl}/test-cancel`
        });
        
        tests[5] = {
          name: 'Currency Checkout',
          status: currencyResult.success ? 'success' : 'error',
          message: currencyResult.success ? 'Currency checkout created' : currencyResult.error
        };
      } catch (error) {
        tests[5] = {
          name: 'Currency Checkout',
          status: 'error',
          message: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    } else {
      tests[5] = {
        name: 'Currency Checkout',
        status: 'error',
        message: 'Skipped - no account available'
      };
    }
    setResults([...tests]);

    setTesting(false);
    
    const successCount = tests.filter(t => t.status === 'success').length;
    const totalTests = tests.length;
    
    toast({
      title: "Integration Test Complete",
      description: `${successCount}/${totalTests} tests passed`,
      variant: successCount === totalTests ? "default" : "destructive",
    });
  };

  return {
    testing,
    results,
    runTests,
  };
};
