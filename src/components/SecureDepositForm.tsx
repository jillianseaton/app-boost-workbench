
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Shield, Lock, Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useSecureBankAccount } from '@/hooks/useSecureBankAccount';
import { BankAccount } from '@/services/secureBankService';

interface SecureDepositFormData {
  amount: string;
  selectedAccountId: string;
}

interface SecureDepositFormProps {
  currentBalance: number;
  verifiedAccounts: BankAccount[];
  userEmail: string;
  userId: string;
  onDepositSuccess: (amount: number) => void;
}

const SecureDepositForm: React.FC<SecureDepositFormProps> = ({
  currentBalance,
  verifiedAccounts,
  userEmail,
  userId,
  onDepositSuccess,
}) => {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const { depositLoading, processSecureDeposit } = useSecureBankAccount();

  const form = useForm<SecureDepositFormData>({
    defaultValues: {
      amount: '',
      selectedAccountId: verifiedAccounts[0]?.id || '',
    },
  });

  const watchedAmount = form.watch('amount');
  const amount = parseFloat(watchedAmount) || 0;
  const selectedAccountId = form.watch('selectedAccountId');
  const selectedAccount = verifiedAccounts.find(acc => acc.id === selectedAccountId);

  const isValidAmount = amount >= 10 && amount <= currentBalance && amount <= 5000;

  const getErrorMessage = () => {
    if (!amount) return '';
    if (amount < 10) return 'Minimum deposit amount is $10.00';
    if (amount > currentBalance) return 'Insufficient balance';
    if (amount > 5000) return 'Maximum deposit amount is $5,000.00';
    return '';
  };

  const handleSecureDeposit = async () => {
    if (!selectedAccount || !isValidAmount) return;

    try {
      await processSecureDeposit({
        amount: amount,
        bankAccountId: selectedAccount.id,
        userBalance: currentBalance,
      });

      form.reset();
      setShowConfirmation(false);
      onDepositSuccess(amount);
    } catch (error) {
      console.error('Secure deposit error:', error);
    }
  };

  if (verifiedAccounts.length === 0) {
    return (
      <Card>
        <CardContent className="text-center p-8">
          <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No verified accounts available for secure deposits</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-green-500" />
          Secure Deposit to Verified Bank Account
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center">
          <div className="text-sm text-muted-foreground mb-2">
            Available EarnFlow Balance
          </div>
          <div className="text-2xl font-bold text-green-600">
            ${currentBalance.toFixed(2)}
          </div>
        </div>

        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-green-800">Verified Account Security</span>
          </div>
          <ul className="text-sm text-green-700 space-y-1">
            <li>• Only verified bank accounts can receive deposits</li>
            <li>• Micro-deposit verification completed</li>
            <li>• Secure transfer via Stripe infrastructure</li>
            <li>• Full audit trail maintained</li>
          </ul>
        </div>

        <Form {...form}>
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="selectedAccountId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select Verified Bank Account</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose your verified account" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {verifiedAccounts.map((account) => (
                        <SelectItem key={account.id} value={account.id}>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span>
                              {account.bank_name} ****{account.account_number_last4}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Deposit Amount</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">$</span>
                      <Input
                        type="number"
                        placeholder="10.00"
                        className="pl-8"
                        step="0.01"
                        min="10"
                        max={Math.min(currentBalance, 5000)}
                        {...field}
                        disabled={depositLoading}
                      />
                    </div>
                  </FormControl>
                  {getErrorMessage() && (
                    <p className="text-sm text-destructive">{getErrorMessage()}</p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedAccount && (
              <div className="p-3 bg-blue-50 rounded-md">
                <p className="text-sm font-medium text-blue-800">Selected Account Details:</p>
                <p className="text-sm text-blue-700">
                  {selectedAccount.account_holder_name} • {selectedAccount.bank_name}
                </p>
                <p className="text-sm text-blue-700">
                  Account ****{selectedAccount.account_number_last4} • Verified ✓
                </p>
              </div>
            )}

            <div className="p-3 bg-yellow-50 rounded-md">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-800">Processing Information</span>
              </div>
              <p className="text-sm text-yellow-700">
                Secure deposits to verified accounts typically arrive within 1-2 business days.
                Processing fees may apply as per your Stripe agreement.
              </p>
            </div>

            <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
              <AlertDialogTrigger asChild>
                <Button 
                  disabled={!isValidAmount || !selectedAccount || depositLoading}
                  className="w-full"
                  size="lg"
                >
                  {depositLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing Secure Deposit...
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4 mr-2" />
                      Initiate Secure Deposit ${amount.toFixed(2)}
                    </>
                  )}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-green-500" />
                    Confirm Secure Deposit
                  </AlertDialogTitle>
                  <AlertDialogDescription className="space-y-3">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Deposit Amount:</span>
                          <span className="font-semibold">${amount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>To Account:</span>
                          <span>{selectedAccount?.bank_name} ****{selectedAccount?.account_number_last4}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Account Holder:</span>
                          <span>{selectedAccount?.account_holder_name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Verification Status:</span>
                          <span className="text-green-600">✓ Verified</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Estimated Arrival:</span>
                          <span>1-2 business days</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Remaining Balance:</span>
                          <span>${(currentBalance - amount).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      This secure deposit will be processed immediately to your verified bank account. 
                      The transaction is irreversible once confirmed.
                    </p>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={depositLoading}>Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleSecureDeposit}
                    disabled={depositLoading}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {depositLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Lock className="h-4 w-4 mr-2" />
                        Confirm Secure Deposit
                      </>
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </Form>

        <div className="text-xs text-center text-muted-foreground">
          <Lock className="h-3 w-3 inline mr-1" />
          All deposits are secured with bank-grade encryption and require verified account confirmation
        </div>
      </CardContent>
    </Card>
  );
};

export default SecureDepositForm;
