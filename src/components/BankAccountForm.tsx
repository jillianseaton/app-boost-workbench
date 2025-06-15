
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shield, Lock, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useSecureBankAccount } from '@/hooks/useSecureBankAccount';

interface BankAccountFormData {
  accountHolderName: string;
  routingNumber: string;
  accountNumber: string;
  confirmAccountNumber: string;
  accountType: 'checking' | 'savings';
}

interface BankAccountFormProps {
  onAccountCreated: () => void;
}

const BankAccountForm: React.FC<BankAccountFormProps> = ({ onAccountCreated }) => {
  const [showForm, setShowForm] = useState(false);
  const { loading, createBankAccount } = useSecureBankAccount();

  const form = useForm<BankAccountFormData>({
    defaultValues: {
      accountHolderName: '',
      routingNumber: '',
      accountNumber: '',
      confirmAccountNumber: '',
      accountType: 'checking',
    },
  });

  const validateRoutingNumber = (value: string) => {
    if (value.length !== 9) return 'Routing number must be 9 digits';
    if (!/^\d+$/.test(value)) return 'Routing number must contain only numbers';
    return true;
  };

  const validateAccountNumber = (value: string) => {
    if (value.length < 4 || value.length > 17) return 'Account number must be 4-17 digits';
    if (!/^\d+$/.test(value)) return 'Account number must contain only numbers';
    return true;
  };

  const onSubmit = async (data: BankAccountFormData) => {
    if (data.accountNumber !== data.confirmAccountNumber) {
      form.setError('confirmAccountNumber', {
        message: 'Account numbers do not match',
      });
      return;
    }

    try {
      await createBankAccount({
        accountHolderName: data.accountHolderName,
        routingNumber: data.routingNumber,
        accountNumber: data.accountNumber,
        accountType: data.accountType,
      });

      form.reset();
      setShowForm(false);
      onAccountCreated();
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  if (!showForm) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-green-500" />
            Add Secure Bank Account
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">
              Securely connect your bank account for verified deposits
            </p>
            <Button onClick={() => setShowForm(true)} className="w-full">
              <Lock className="h-4 w-4 mr-2" />
              Connect Bank Account
            </Button>
          </div>
          
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-800 mb-2">Security Features:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Bank details secured by Stripe encryption</li>
              <li>• Micro-deposit verification required</li>
              <li>• Full PCI compliance maintained</li>
              <li>• Account numbers never stored in full</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-green-500" />
          Secure Bank Account Setup
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="accountHolderName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account Holder Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Full name as it appears on your account"
                      {...field}
                      disabled={loading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="routingNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Routing Number</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="9-digit routing number"
                      maxLength={9}
                      {...field}
                      disabled={loading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
              rules={{
                required: 'Routing number is required',
                validate: validateRoutingNumber,
              }}
            />

            <FormField
              control={form.control}
              name="accountNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account Number</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Bank account number"
                      {...field}
                      disabled={loading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
              rules={{
                required: 'Account number is required',
                validate: validateAccountNumber,
              }}
            />

            <FormField
              control={form.control}
              name="confirmAccountNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Account Number</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Re-enter account number"
                      {...field}
                      disabled={loading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
              rules={{
                required: 'Please confirm your account number',
              }}
            />

            <FormField
              control={form.control}
              name="accountType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={loading}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select account type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="checking">Checking</SelectItem>
                      <SelectItem value="savings">Savings</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowForm(false)}
                disabled={loading}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Shield className="h-4 w-4 mr-2" />
                    Create Account
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>

        <div className="mt-4 p-3 bg-gray-50 rounded-md">
          <p className="text-xs text-gray-600">
            <Lock className="h-3 w-3 inline mr-1" />
            Your bank information is encrypted and securely processed by Stripe. 
            We never store your full account details.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default BankAccountForm;
