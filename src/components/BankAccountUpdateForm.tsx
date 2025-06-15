
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AlertTriangle, Edit, Loader2, Lock } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useUpdateBankAccount } from '@/hooks/useUpdateBankAccount';
import { BankAccount } from '@/services/secureBankService';

interface UpdateFormData {
  routingNumber: string;
  accountNumber: string;
  confirmAccountNumber: string;
  updateReason: string;
}

interface BankAccountUpdateFormProps {
  bankAccount: BankAccount;
  onUpdateComplete: () => void;
}

const BankAccountUpdateForm: React.FC<BankAccountUpdateFormProps> = ({ 
  bankAccount, 
  onUpdateComplete 
}) => {
  const [showForm, setShowForm] = useState(false);
  const { loading, updateBankAccount } = useUpdateBankAccount();

  const form = useForm<UpdateFormData>({
    defaultValues: {
      routingNumber: '',
      accountNumber: '',
      confirmAccountNumber: '',
      updateReason: '',
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

  const onSubmit = async (data: UpdateFormData) => {
    if (data.accountNumber !== data.confirmAccountNumber) {
      form.setError('confirmAccountNumber', {
        message: 'Account numbers do not match',
      });
      return;
    }

    if (!data.updateReason.trim()) {
      form.setError('updateReason', {
        message: 'Please provide a reason for this update',
      });
      return;
    }

    try {
      await updateBankAccount({
        bankAccountId: bankAccount.id,
        routingNumber: data.routingNumber,
        accountNumber: data.accountNumber,
        updateReason: data.updateReason,
      });

      form.reset();
      setShowForm(false);
      onUpdateComplete();
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  if (!showForm) {
    return (
      <Card className="border-orange-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-800">
            <Edit className="h-5 w-5" />
            Update Bank Account
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-orange-800 mb-2">Important Notice</h4>
                <ul className="text-sm text-orange-700 space-y-1">
                  <li>• Updating will require new micro-deposit verification</li>
                  <li>• Current verification status will be reset</li>
                  <li>• Previous account information will be archived</li>
                  <li>• This action cannot be undone</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="text-center">
            <p className="text-muted-foreground mb-4">
              Current Account: {bankAccount.bank_name} • ****{bankAccount.account_number_last4}
            </p>
            <Button onClick={() => setShowForm(true)} variant="outline" className="w-full">
              <Edit className="h-4 w-4 mr-2" />
              Update Account Information
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-orange-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-800">
          <Edit className="h-5 w-5" />
          Update Bank Account Information
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="routingNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Routing Number</FormLabel>
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
                  <FormLabel>New Account Number</FormLabel>
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
                  <FormLabel>Confirm New Account Number</FormLabel>
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
              name="updateReason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason for Update</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Please explain why you're updating your bank account information..."
                      {...field}
                      disabled={loading}
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
              rules={{
                required: 'Please provide a reason for this update',
                minLength: {
                  value: 10,
                  message: 'Please provide a more detailed reason (at least 10 characters)',
                },
              }}
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
              <Button type="submit" disabled={loading} className="flex-1" variant="destructive">
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Edit className="h-4 w-4 mr-2" />
                    Update Account
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
            Previous account details will be archived for security purposes.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default BankAccountUpdateForm;
