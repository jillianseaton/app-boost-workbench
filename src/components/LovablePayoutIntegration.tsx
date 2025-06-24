
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CreditCard, DollarSign, Send, CheckCircle, Plus, Banknote } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { secureBankService } from '@/services/secureBankService';
import BankAccountForm from './BankAccountForm';

interface PayoutRequest {
  amount: number;
  currency: string;
  method: 'instant' | 'standard';
  destination: string;
}

const LovablePayoutIntegration: React.FC = () => {
  const [payoutAmount, setPayoutAmount] = useState('');
  const [payoutMethod, setPayoutMethod] = useState<'instant' | 'standard'>('standard');
  const [selectedBankAccount, setSelectedBankAccount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [payoutHistory, setPayoutHistory] = useState<any[]>([]);
  const [bankAccounts, setBankAccounts] = useState<any[]>([]);
  const [showBankAccountForm, setShowBankAccountForm] = useState(false);
  const [loadingBankAccounts, setLoadingBankAccounts] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  // Fetch user's bank accounts
  const fetchBankAccounts = async () => {
    if (!user) return;

    setLoadingBankAccounts(true);
    try {
      const accounts = await secureBankService.getUserBankAccounts();
      setBankAccounts(accounts);
      
      // Auto-select the first verified account
      const verifiedAccount = accounts.find(acc => acc.verification_status === 'verified');
      if (verifiedAccount) {
        setSelectedBankAccount(verifiedAccount.bank_account_id);
      }
    } catch (error) {
      console.error('Error fetching bank accounts:', error);
    } finally {
      setLoadingBankAccounts(false);
    }
  };

  useEffect(() => {
    fetchBankAccounts();
  }, [user]);

  const handlePayoutRequest = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to request a payout",
        variant: "destructive",
      });
      return;
    }

    const amount = parseFloat(payoutAmount);
    if (!amount || amount < 1) {
      toast({
        title: "Invalid Amount",
        description: "Minimum payout amount is $1.00",
        variant: "destructive",
      });
      return;
    }

    if (!selectedBankAccount) {
      toast({
        title: "Bank Account Required",
        description: "Please select a verified bank account for payouts",
        variant: "destructive",
      });
      return;
    }

    // Validate bank account format
    if (!selectedBankAccount.startsWith('ba_') && !selectedBankAccount.startsWith('card_')) {
      toast({
        title: "Invalid Bank Account ID",
        description: "Bank account ID must start with 'ba_' or card ID with 'card_'",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      const { data, error } = await supabase.functions.invoke('lovable-stripe-payout', {
        body: {
          amount: Math.round(amount * 100), // Convert to cents
          currency: 'usd',
          method: payoutMethod,
          destination: selectedBankAccount,
          userId: user.id,
          userEmail: user.email,
        },
      });

      if (error) throw error;

      if (data?.success) {
        toast({
          title: "Payout Initiated",
          description: `$${amount.toFixed(2)} payout request submitted successfully`,
        });
        
        setPayoutAmount('');
        
        // Refresh payout history
        fetchPayoutHistory();
      } else {
        throw new Error(data?.error || 'Payout request failed');
      }
    } catch (error) {
      console.error('Payout error:', error);
      toast({
        title: "Payout Failed",
        description: error instanceof Error ? error.message : "Failed to process payout request",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const fetchPayoutHistory = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase.functions.invoke('get-payout-history', {
        body: { userId: user.id },
      });

      if (error) throw error;
      if (data?.payouts) {
        setPayoutHistory(data.payouts);
      }
    } catch (error) {
      console.error('Error fetching payout history:', error);
    }
  };

  const handleBankAccountCreated = () => {
    setShowBankAccountForm(false);
    fetchBankAccounts();
    toast({
      title: "Bank Account Added",
      description: "Your bank account has been added and is being verified",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Completed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800"><AlertCircle className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800"><AlertCircle className="h-3 w-3 mr-1" />Failed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getAccountStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <Badge className="bg-green-100 text-green-800">Verified</Badge>;
      case 'verifying':
        return <Badge className="bg-yellow-100 text-yellow-800">Verifying</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  React.useEffect(() => {
    fetchPayoutHistory();
  }, [user]);

  if (!user) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Please sign in to access payout features</p>
        </CardContent>
      </Card>
    );
  }

  if (showBankAccountForm) {
    return (
      <div className="space-y-4">
        <BankAccountForm onAccountCreated={handleBankAccountCreated} />
        <Button
          variant="outline"
          onClick={() => setShowBankAccountForm(false)}
          className="w-full"
        >
          Back to Payouts
        </Button>
      </div>
    );
  }

  const verifiedAccounts = bankAccounts.filter(acc => acc.verification_status === 'verified');

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Lovable to Stripe Payout
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Bank Account Selection */}
          <div>
            <Label>Select Bank Account</Label>
            {loadingBankAccounts ? (
              <div className="text-sm text-muted-foreground">Loading bank accounts...</div>
            ) : verifiedAccounts.length > 0 ? (
              <select
                value={selectedBankAccount}
                onChange={(e) => setSelectedBankAccount(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="">Select a verified bank account</option>
                {verifiedAccounts.map((account) => (
                  <option key={account.id} value={account.bank_account_id}>
                    {account.bank_name} • ****{account.account_number_last4} • {getAccountStatusBadge(account.verification_status)}
                  </option>
                ))}
              </select>
            ) : (
              <div className="p-4 border border-dashed rounded-lg text-center">
                <Banknote className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-3">
                  No verified bank accounts found. Add one to enable payouts.
                </p>
                <Button
                  variant="outline"
                  onClick={() => setShowBankAccountForm(true)}
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Bank Account
                </Button>
              </div>
            )}
          </div>

          {verifiedAccounts.length > 0 && (
            <Button
              variant="outline"
              onClick={() => setShowBankAccountForm(true)}
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Another Bank Account
            </Button>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="payoutAmount">Payout Amount ($)</Label>
              <Input
                id="payoutAmount"
                type="number"
                placeholder="0.00"
                value={payoutAmount}
                onChange={(e) => setPayoutAmount(e.target.value)}
                min="1"
                step="0.01"
              />
            </div>
            <div>
              <Label htmlFor="payoutMethod">Payout Speed</Label>
              <select
                id="payoutMethod"
                value={payoutMethod}
                onChange={(e) => setPayoutMethod(e.target.value as 'instant' | 'standard')}
                className="w-full p-2 border rounded-md"
              >
                <option value="standard">Standard (1-3 business days)</option>
                <option value="instant">Instant (additional fees apply)</option>
              </select>
            </div>
          </div>

          <Button 
            onClick={handlePayoutRequest} 
            disabled={isProcessing || !payoutAmount || !selectedBankAccount || verifiedAccounts.length === 0}
            className="w-full"
          >
            {isProcessing ? (
              <>Processing...</>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Request Payout
              </>
            )}
          </Button>

          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Payouts are processed through Stripe to your verified bank account. 
              Instant payouts may have additional fees. Bank account IDs must start with 'ba_' for bank accounts 
              or 'card_' for debit cards.
            </p>
          </div>
        </CardContent>
      </Card>

      {payoutHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payout History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {payoutHistory.map((payout, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <DollarSign className="h-8 w-8 text-muted-foreground" />
                    <div>
                      <p className="font-medium">${(payout.amount / 100).toFixed(2)}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(payout.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    {getStatusBadge(payout.status)}
                    <p className="text-xs text-muted-foreground mt-1">
                      {payout.method === 'instant' ? 'Instant' : 'Standard'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default LovablePayoutIntegration;
