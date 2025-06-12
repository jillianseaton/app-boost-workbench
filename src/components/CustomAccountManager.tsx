
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Search, RefreshCw, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { stripeCustomService, AccountRequirementsResponse } from '@/services/stripeCustomService';

const CustomAccountManager: React.FC = () => {
  const [accountId, setAccountId] = useState('');
  const [loading, setLoading] = useState(false);
  const [accountData, setAccountData] = useState<AccountRequirementsResponse['data'] | null>(null);
  const { toast } = useToast();

  const getStatusIcon = (state: string) => {
    if (state === 'complete' || state === 'enabled') {
      return <CheckCircle className="h-5 w-5 text-green-600" />;
    } else if (state.includes('restricted') || state.includes('rejected')) {
      return <XCircle className="h-5 w-5 text-red-600" />;
    } else {
      return <AlertCircle className="h-5 w-5 text-yellow-600" />;
    }
  };

  const getStatusColor = (state: string) => {
    if (state === 'complete' || state === 'enabled') {
      return 'text-green-600 bg-green-50 border-green-200';
    } else if (state.includes('restricted') || state.includes('rejected')) {
      return 'text-red-600 bg-red-50 border-red-200';
    } else {
      return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    }
  };

  const handleGetAccountInfo = async () => {
    if (!accountId.trim()) {
      toast({
        title: "Account ID Required",
        description: "Please enter a valid account ID.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const result = await stripeCustomService.getAccountRequirements(accountId.trim());
      
      if (result.success && result.data) {
        setAccountData(result.data);
        toast({
          title: "Account Information Retrieved",
          description: `Account state: ${result.data.state}`,
        });
      } else {
        throw new Error(result.error || 'Failed to get account information');
      }
    } catch (error) {
      console.error('Account info error:', error);
      setAccountData(null);
      toast({
        title: "Failed to Get Account Info",
        description: error instanceof Error ? error.message : "Failed to retrieve account information",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Account Lookup
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="accountId">Stripe Account ID</Label>
            <Input
              id="accountId"
              placeholder="acct_xxxxxxxxxxxxx"
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              disabled={loading}
            />
          </div>
          <Button onClick={handleGetAccountInfo} disabled={loading || !accountId.trim()}>
            {loading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4" />
                Get Account Info
              </div>
            )}
          </Button>
        </CardContent>
      </Card>

      {accountData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Account Information
              <Button
                variant="outline"
                size="sm"
                onClick={handleGetAccountInfo}
                disabled={loading}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Account ID</Label>
                <p className="font-mono text-sm">{accountData.accountId}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                <div className={`flex items-center gap-2 mt-1 px-3 py-1 rounded border ${getStatusColor(accountData.state)}`}>
                  {getStatusIcon(accountData.state)}
                  <span className="text-sm font-medium">{accountData.state}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Charges Enabled</Label>
                <p className={`text-sm font-medium ${accountData.chargesEnabled ? 'text-green-600' : 'text-red-600'}`}>
                  {accountData.chargesEnabled ? 'Yes' : 'No'}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Payouts Enabled</Label>
                <p className={`text-sm font-medium ${accountData.payoutsEnabled ? 'text-green-600' : 'text-red-600'}`}>
                  {accountData.payoutsEnabled ? 'Yes' : 'No'}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Details Submitted</Label>
                <p className={`text-sm font-medium ${accountData.detailsSubmitted ? 'text-green-600' : 'text-yellow-600'}`}>
                  {accountData.detailsSubmitted ? 'Yes' : 'No'}
                </p>
              </div>
            </div>

            {accountData.requirements.currentlyDue.length > 0 && (
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Currently Due Requirements</Label>
                <div className="mt-2 space-y-1">
                  {accountData.requirements.currentlyDue.map((req, index) => (
                    <div key={index} className="text-sm bg-red-50 text-red-700 px-2 py-1 rounded">
                      {req}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {accountData.requirements.eventuallyDue.length > 0 && (
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Eventually Due Requirements</Label>
                <div className="mt-2 space-y-1">
                  {accountData.requirements.eventuallyDue.map((req, index) => (
                    <div key={index} className="text-sm bg-yellow-50 text-yellow-700 px-2 py-1 rounded">
                      {req}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {accountData.requirements.pastDue.length > 0 && (
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Past Due Requirements</Label>
                <div className="mt-2 space-y-1">
                  {accountData.requirements.pastDue.map((req, index) => (
                    <div key={index} className="text-sm bg-red-100 text-red-800 px-2 py-1 rounded font-medium">
                      {req}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {accountData.requirements.disabledReason && (
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Disabled Reason</Label>
                <p className="text-sm text-red-600 mt-1">{accountData.requirements.disabledReason}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CustomAccountManager;
