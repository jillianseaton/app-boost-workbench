
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, AlertCircle, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useSecureBankAccount } from '@/hooks/useSecureBankAccount';
import { BankAccount } from '@/services/secureBankService';

interface VerificationFormData {
  amount1: string;
  amount2: string;
}

interface BankAccountVerificationProps {
  bankAccount: BankAccount;
  onVerificationComplete: () => void;
}

const BankAccountVerification: React.FC<BankAccountVerificationProps> = ({
  bankAccount,
  onVerificationComplete,
}) => {
  const [showVerificationForm, setShowVerificationForm] = useState(false);
  const { verificationLoading, verifyBankAccount } = useSecureBankAccount();

  const form = useForm<VerificationFormData>({
    defaultValues: {
      amount1: '',
      amount2: '',
    },
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'verifying':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
        return 'bg-green-100 text-green-800';
      case 'verifying':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusMessage = (status: string) => {
    switch (status) {
      case 'verified':
        return 'Your bank account is verified and ready for secure deposits';
      case 'verifying':
        return 'Micro-deposits have been sent to your account. Enter the amounts below to verify.';
      case 'failed':
        return 'Verification failed. Please check the amounts and try again.';
      default:
        return 'Verification pending';
    }
  };

  const onSubmit = async (data: VerificationFormData) => {
    const amount1 = Math.round(parseFloat(data.amount1) * 100); // Convert to cents
    const amount2 = Math.round(parseFloat(data.amount2) * 100); // Convert to cents

    if (isNaN(amount1) || isNaN(amount2)) {
      form.setError('amount1', { message: 'Please enter valid amounts' });
      return;
    }

    if (amount1 < 1 || amount1 > 99 || amount2 < 1 || amount2 > 99) {
      form.setError('amount1', { message: 'Amounts must be between $0.01 and $0.99' });
      return;
    }

    try {
      await verifyBankAccount({
        bankAccountId: bankAccount.id,
        amounts: [amount1, amount2],
      });

      form.reset();
      setShowVerificationForm(false);
      onVerificationComplete();
    } catch (error) {
      console.error('Verification error:', error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Bank Account Verification</span>
          <Badge className={getStatusColor(bankAccount.verification_status)}>
            {getStatusIcon(bankAccount.verification_status)}
            <span className="ml-1 capitalize">{bankAccount.verification_status}</span>
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-muted rounded-lg">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Account Holder</p>
              <p className="font-medium">{bankAccount.account_holder_name}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Bank</p>
              <p className="font-medium">{bankAccount.bank_name}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Account</p>
              <p className="font-medium">****{bankAccount.account_number_last4}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Routing</p>
              <p className="font-medium">****{bankAccount.routing_number_last4}</p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800">
            {getStatusMessage(bankAccount.verification_status)}
          </p>
        </div>

        {bankAccount.verification_status === 'verifying' && !showVerificationForm && (
          <Button 
            onClick={() => setShowVerificationForm(true)}
            className="w-full"
            variant="outline"
          >
            Enter Micro-Deposit Amounts
          </Button>
        )}

        {showVerificationForm && bankAccount.verification_status === 'verifying' && (
          <div className="space-y-4">
            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <p className="text-sm text-yellow-800 mb-2">
                <strong>Micro-Deposit Verification</strong>
              </p>
              <p className="text-sm text-yellow-700">
                We've sent two small deposits (less than $1.00 each) to your bank account. 
                These typically appear within 1-2 business days. Enter the exact amounts below.
              </p>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="amount1"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Amount</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">$</span>
                            <Input
                              placeholder="0.XX"
                              className="pl-8"
                              {...field}
                              disabled={verificationLoading}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                    rules={{
                      required: 'Amount is required',
                      pattern: {
                        value: /^\d+\.\d{2}$/,
                        message: 'Enter amount as X.XX (e.g., 0.23)',
                      },
                    }}
                  />

                  <FormField
                    control={form.control}
                    name="amount2"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Second Amount</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">$</span>
                            <Input
                              placeholder="0.XX"
                              className="pl-8"
                              {...field}
                              disabled={verificationLoading}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                    rules={{
                      required: 'Amount is required',
                      pattern: {
                        value: /^\d+\.\d{2}$/,
                        message: 'Enter amount as X.XX (e.g., 0.45)',
                      },
                    }}
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowVerificationForm(false)}
                    disabled={verificationLoading}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={verificationLoading} className="flex-1">
                    {verificationLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      'Verify Account'
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        )}

        {bankAccount.verification_status === 'verified' && (
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="font-semibold text-green-800">Account Verified</span>
            </div>
            <p className="text-sm text-green-700">
              Your bank account is verified and ready for secure deposits. 
              Verified on: {new Date(bankAccount.verified_at!).toLocaleDateString()}
            </p>
          </div>
        )}

        {bankAccount.verification_status === 'failed' && (
          <div className="p-4 bg-red-50 rounded-lg border border-red-200">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <span className="font-semibold text-red-800">Verification Failed</span>
            </div>
            <p className="text-sm text-red-700 mb-3">
              The micro-deposit amounts you entered were incorrect. Please check your bank statement and try again.
            </p>
            <Button 
              onClick={() => setShowVerificationForm(true)}
              variant="outline"
              size="sm"
            >
              Try Again
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BankAccountVerification;
