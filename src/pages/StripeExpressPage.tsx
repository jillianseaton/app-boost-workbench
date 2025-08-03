import React, { useState } from 'react';
import { ArrowLeft, CreditCard, DollarSign, Settings, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { stripeExpressPayoutService } from '@/services/stripeExpressPayoutService';
import { stripeConnectService } from '@/services/stripeConnectService';

const StripeExpressPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState('10.00');
  const [stripeAccountId, setStripeAccountId] = useState('');
  const [payoutMethod, setPayoutMethod] = useState('standard');
  const [description, setDescription] = useState('');
  const [testResults, setTestResults] = useState<any[]>([]);

  const addTestResult = (name: string, success: boolean, data: any = null, error: string = '') => {
    setTestResults(prev => [...prev, {
      name,
      success,
      data,
      error,
      timestamp: new Date().toISOString()
    }]);
  };

  const createExpressAccount = async () => {
    setLoading(true);
    try {
      const result = await stripeConnectService.createAccount();

      if (result.account) {
        addTestResult('Express Account Creation', true, {
          accountId: result.account
        });
        toast({
          title: "Express Account Created",
          description: `Successfully created Express account: ${result.account}`,
        });
        setStripeAccountId(result.account);
      } else {
        addTestResult('Express Account Creation', false, null, result.error || 'Unknown error');
        toast({
          title: "Account Creation Failed",
          description: result.error || 'Unknown error',
          variant: "destructive"
        });
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      addTestResult('Express Account Creation', false, null, errorMsg);
      toast({
        title: "Account Creation Failed",
        description: errorMsg,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createExpressPayout = async () => {
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
        method: payoutMethod as 'standard' | 'instant',
        description: description || `Express payout - $${payoutAmount}`
      });

      if (result.success) {
        addTestResult('Express Payout', true, {
          payoutId: result.data?.payoutId,
          amount: amount,
          status: result.data?.status,
          accountId: stripeAccountId
        });
        toast({
          title: "Express Payout Successful",
          description: `Successfully created Express payout for $${payoutAmount}`,
        });
        
        // Reset form
        setPayoutAmount('10.00');
        setDescription('');
      } else {
        addTestResult('Express Payout', false, null, result.error || 'Unknown error');
        toast({
          title: "Express Payout Failed",
          description: result.error || 'Unknown error',
          variant: "destructive"
        });
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      addTestResult('Express Payout', false, null, errorMsg);
      toast({
        title: "Express Payout Failed",
        description: errorMsg,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
        <div className="container mx-auto max-w-4xl space-y-6">
          <div className="flex items-center gap-4">
            <Button onClick={() => navigate('/')} variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h1 className="text-3xl font-bold text-primary">Stripe Express</h1>
          </div>
          
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Authentication Required
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Please sign in to access Stripe Express functionality.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="container mx-auto max-w-4xl space-y-6">
        <div className="flex items-center gap-4">
          <Button onClick={() => navigate('/')} variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-primary">Stripe Express</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Stripe Express Dashboard
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Manage Express accounts and process instant payouts
            </p>
          </CardHeader>
        </Card>

        <Tabs defaultValue="accounts" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="accounts">Express Accounts</TabsTrigger>
            <TabsTrigger value="payouts">Express Payouts</TabsTrigger>
            <TabsTrigger value="results">Results</TabsTrigger>
          </TabsList>

          <TabsContent value="accounts" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Create Express Account
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Create a new Stripe Express account for faster onboarding
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-account">Current Account ID</Label>
                  <Input
                    id="current-account"
                    type="text"
                    value={stripeAccountId}
                    onChange={(e) => setStripeAccountId(e.target.value)}
                    placeholder="acct_... (will be auto-filled after creation)"
                    readOnly={!!stripeAccountId}
                  />
                </div>
                
                <Button 
                  onClick={createExpressAccount} 
                  disabled={loading} 
                  className="w-full"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Settings className="h-4 w-4 mr-2" />}
                  Create Express Account
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payouts" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Express Payout
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Process instant payouts to Express accounts
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="payout-method">Payout Speed</Label>
                    <select
                      id="payout-method"
                      value={payoutMethod}
                      onChange={(e) => setPayoutMethod(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="standard">Standard (2-3 business days)</option>
                      <option value="instant">Instant (additional fees apply)</option>
                    </select>
                  </div>
                  
                  <div>
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Input
                      id="description"
                      type="text"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Payout description"
                    />
                  </div>
                </div>

                <Button 
                  onClick={createExpressPayout} 
                  disabled={loading || !stripeAccountId || !payoutAmount} 
                  className="w-full"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <DollarSign className="h-4 w-4 mr-2" />}
                  Process Express Payout
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="results">
            <Card>
              <CardHeader>
                <CardTitle>Operation Results</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Results from Express account and payout operations
                </p>
              </CardHeader>
              <CardContent>
                {testResults.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No operations performed yet. Create accounts or process payouts to see results here.
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
                              {result.success ? "SUCCESS" : "FAILED"}
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
                          <p className="text-xs text-muted-foreground mt-2">
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
    </div>
  );
};

export default StripeExpressPage;