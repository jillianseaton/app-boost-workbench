import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { stripeService } from '@/services/stripeService';
import { stripeExpressPayoutService } from '@/services/stripeExpressPayoutService';
import { stripeConnectService } from '@/services/stripeConnectService';
import { 
  CreditCard, 
  DollarSign, 
  Settings, 
  CheckCircle, 
  XCircle, 
  Loader2,
  AlertTriangle,
  TestTube
} from 'lucide-react';

const StripeTestingDashboard = () => {
  const [testResults, setTestResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('5.00');
  const [payoutAmount, setPayoutAmount] = useState('10.00');
  const [stripeAccountId, setStripeAccountId] = useState('');
  const { toast } = useToast();
  const { user } = useAuth();

  const addTestResult = (name: string, success: boolean, data: any = null, error: string = '') => {
    setTestResults(prev => [...prev, {
      name,
      success,
      data,
      error,
      timestamp: new Date().toISOString()
    }]);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const testPaymentIntent = async () => {
    if (!user?.email) {
      toast({
        title: "Error",
        description: "Please log in first",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const amount = Math.round(parseFloat(paymentAmount) * 100); // Convert to cents
      
      const result = await stripeService.createPaymentIntent({
        amount,
        description: `Test payment - ${paymentAmount}`,
        customerEmail: user.email
      });

      if (result.success) {
        addTestResult('Payment Intent Creation', true, {
          clientSecret: result.clientSecret ? 'Generated' : 'Missing',
          amount: amount,
          currency: 'usd'
        });
        toast({
          title: "Payment Intent Test Passed",
          description: `Successfully created payment intent for $${paymentAmount}`,
        });
      } else {
        addTestResult('Payment Intent Creation', false, null, result.error || 'Unknown error');
        toast({
          title: "Payment Intent Test Failed",
          description: result.error || 'Unknown error',
          variant: "destructive"
        });
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      addTestResult('Payment Intent Creation', false, null, errorMsg);
      toast({
        title: "Payment Intent Test Failed",
        description: errorMsg,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const testPayout = async () => {
    if (!user?.email) {
      toast({
        title: "Error",
        description: "Please log in first",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const amount = parseFloat(payoutAmount);
      
      const result = await stripeService.createPayout({
        amount,
        email: user.email,
        userId: user.id
      });

      if (result.success) {
        addTestResult('Payout Creation', true, {
          payoutId: result.data?.payoutId,
          amount: amount,
          status: result.data?.status
        });
        toast({
          title: "Payout Test Passed",
          description: `Successfully created payout for $${payoutAmount}`,
        });
      } else {
        addTestResult('Payout Creation', false, null, result.error || 'Unknown error');
        toast({
          title: "Payout Test Failed",
          description: result.error || 'Unknown error',
          variant: "destructive"
        });
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      addTestResult('Payout Creation', false, null, errorMsg);
      toast({
        title: "Payout Test Failed",
        description: errorMsg,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const testExpressPayout = async () => {
    if (!stripeAccountId.trim()) {
      toast({
        title: "Error",
        description: "Please enter a Stripe Account ID",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const amount = parseFloat(payoutAmount);
      
      const result = await stripeExpressPayoutService.createExpressPayout({
        amount,
        stripeAccountId: stripeAccountId.trim(),
        method: 'standard',
        description: `Test Express payout - $${payoutAmount}`
      });

      if (result.success) {
        addTestResult('Express Payout', true, {
          payoutId: result.data?.payoutId,
          amount: amount,
          status: result.data?.status,
          accountId: stripeAccountId
        });
        toast({
          title: "Express Payout Test Passed",
          description: `Successfully created Express payout for $${payoutAmount}`,
        });
      } else {
        addTestResult('Express Payout', false, null, result.error || 'Unknown error');
        toast({
          title: "Express Payout Test Failed",
          description: result.error || 'Unknown error',
          variant: "destructive"
        });
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      addTestResult('Express Payout', false, null, errorMsg);
      toast({
        title: "Express Payout Test Failed",
        description: errorMsg,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const testConnectAccount = async () => {
    setLoading(true);
    try {
      const result = await stripeConnectService.createAccount();

      if (result.account) {
        addTestResult('Connect Account Creation', true, {
          accountId: result.account
        });
        toast({
          title: "Connect Account Test Passed",
          description: `Successfully created Connect account: ${result.account}`,
        });
        setStripeAccountId(result.account); // Auto-fill for other tests
      } else {
        addTestResult('Connect Account Creation', false, null, result.error || 'Unknown error');
        toast({
          title: "Connect Account Test Failed",
          description: result.error || 'Unknown error',
          variant: "destructive"
        });
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      addTestResult('Connect Account Creation', false, null, errorMsg);
      toast({
        title: "Connect Account Test Failed",
        description: errorMsg,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const runAllTests = async () => {
    if (!user?.email) {
      toast({
        title: "Error",
        description: "Please log in first",
        variant: "destructive"
      });
      return;
    }

    clearResults();
    toast({
      title: "Running All Tests",
      description: "Testing all Stripe functions...",
    });

    // Run tests sequentially to avoid rate limits
    await testPaymentIntent();
    await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay
    
    await testPayout();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await testConnectAccount();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (stripeAccountId) {
      await testExpressPayout();
    }

    toast({
      title: "All Tests Complete",
      description: "Check the results below",
    });
  };

  if (!user) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="h-5 w-5" />
            Stripe Testing Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Please sign in to access the Stripe testing dashboard.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="h-5 w-5" />
            Stripe Testing Dashboard
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Test all Stripe functionality to ensure everything is working correctly
          </p>
        </CardHeader>
      </Card>

      <Tabs defaultValue="individual" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="individual">Individual Tests</TabsTrigger>
          <TabsTrigger value="batch">Batch Testing</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
        </TabsList>

        <TabsContent value="individual" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <CreditCard className="h-4 w-4" />
                  Payment Intent Test
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="payment-amount">Amount ($)</Label>
                  <Input
                    id="payment-amount"
                    type="number"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    min="0.50"
                    step="0.01"
                  />
                </div>
                <Button onClick={testPaymentIntent} disabled={loading} className="w-full">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
                  Test Payment Intent
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <DollarSign className="h-4 w-4" />
                  Payout Test
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="payout-amount">Amount ($)</Label>
                  <Input
                    id="payout-amount"
                    type="number"
                    value={payoutAmount}
                    onChange={(e) => setPayoutAmount(e.target.value)}
                    min="1.00"
                    step="0.01"
                  />
                </div>
                <Button onClick={testPayout} disabled={loading} className="w-full">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <DollarSign className="h-4 w-4" />}
                  Test Payout
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Settings className="h-4 w-4" />
                  Connect Account Test
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Creates a Stripe Connect account for testing
                </p>
                <Button onClick={testConnectAccount} disabled={loading} className="w-full">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Settings className="h-4 w-4" />}
                  Test Connect Account
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <DollarSign className="h-4 w-4" />
                  Express Payout Test
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="account-id">Stripe Account ID</Label>
                  <Input
                    id="account-id"
                    type="text"
                    value={stripeAccountId}
                    onChange={(e) => setStripeAccountId(e.target.value)}
                    placeholder="acct_..."
                  />
                </div>
                <Button onClick={testExpressPayout} disabled={loading || !stripeAccountId} className="w-full">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <DollarSign className="h-4 w-4" />}
                  Test Express Payout
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="batch">
          <Card>
            <CardHeader>
              <CardTitle>Batch Testing</CardTitle>
              <p className="text-sm text-muted-foreground">
                Run all tests sequentially to verify complete Stripe functionality
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="batch-payment-amount">Payment Amount ($)</Label>
                  <Input
                    id="batch-payment-amount"
                    type="number"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    min="0.50"
                    step="0.01"
                  />
                </div>
                <div>
                  <Label htmlFor="batch-payout-amount">Payout Amount ($)</Label>
                  <Input
                    id="batch-payout-amount"
                    type="number"
                    value={payoutAmount}
                    onChange={(e) => setPayoutAmount(e.target.value)}
                    min="1.00"
                    step="0.01"
                  />
                </div>
              </div>
              
              <div className="flex gap-4">
                <Button onClick={runAllTests} disabled={loading} className="flex-1">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <TestTube className="h-4 w-4 mr-2" />}
                  Run All Tests
                </Button>
                <Button onClick={clearResults} variant="outline">
                  Clear Results
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results">
          <Card>
            <CardHeader>
              <CardTitle>Test Results</CardTitle>
              <p className="text-sm text-muted-foreground">
                Results from Stripe functionality tests
              </p>
            </CardHeader>
            <CardContent>
              {testResults.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No test results yet. Run some tests to see results here.
                </p>
              ) : (
                <div className="space-y-3">
                  {testResults.map((result, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                      <div className="flex-shrink-0 mt-0.5">
                        {result.success ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{result.name}</h4>
                          <Badge variant={result.success ? "default" : "destructive"}>
                            {result.success ? "PASS" : "FAIL"}
                          </Badge>
                        </div>
                        {result.error && (
                          <p className="text-sm text-red-600 mb-2">{result.error}</p>
                        )}
                        {result.data && (
                          <div className="text-sm text-muted-foreground">
                            <pre className="text-xs bg-muted p-2 rounded mt-1 overflow-auto">
                              {JSON.stringify(result.data, null, 2)}
                            </pre>
                          </div>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(result.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StripeTestingDashboard;