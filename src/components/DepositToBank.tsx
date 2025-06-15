
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Banknote, Clock, Loader2, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface DepositToBankProps {
  currentBalance: number;
  onDepositSuccess: (amount: number) => void;
  userEmail: string;
  userId: string;
}

const DepositToBank: React.FC<DepositToBankProps> = ({ 
  currentBalance, 
  onDepositSuccess, 
  userEmail, 
  userId 
}) => {
  const [depositAmount, setDepositAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const { toast } = useToast();

  const amount = parseFloat(depositAmount) || 0;
  const isValidAmount = amount >= 10 && amount <= currentBalance && amount <= 500;

  const handleDepositConfirm = async () => {
    if (!isValidAmount) return;

    setLoading(true);
    setShowConfirmation(false);

    try {
      console.log('Initiating bank deposit:', { amount, userEmail, userId, currentBalance });

      const { data, error } = await supabase.functions.invoke('create-bank-deposit', {
        body: {
          amount,
          email: userEmail,
          userId,
          userBalance: currentBalance,
        },
      });

      if (error) {
        throw new Error(error.message || 'Bank deposit failed');
      }

      if (!data.success) {
        throw new Error(data.error || 'Bank deposit request failed');
      }

      toast({
        title: "Bank Deposit Initiated",
        description: `$${amount.toFixed(2)} will be transferred to your bank account within 1-2 business days.`,
      });

      // Reset form and notify parent component
      setDepositAmount('');
      onDepositSuccess(amount);

    } catch (error) {
      console.error('Bank deposit error:', error);
      toast({
        title: "Deposit Failed",
        description: error instanceof Error ? error.message : "Failed to process bank deposit",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getErrorMessage = () => {
    if (amount < 10) return 'Minimum deposit amount is $10.00';
    if (amount > currentBalance) return 'Cannot deposit more than your current balance';
    if (amount > 500) return 'Maximum deposit per transaction is $500.00';
    return '';
  };

  // Don't show component if balance is below minimum
  if (currentBalance < 10) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Banknote className="h-5 w-5 text-blue-500" />
          Deposit to Bank Account
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <div className="text-sm text-muted-foreground mb-2">
            Available EarnFlow Balance
          </div>
          <div className="text-2xl font-bold text-green-600">
            ${currentBalance.toFixed(2)}
          </div>
        </div>

        <div className="p-3 bg-blue-50 rounded-md">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">Processing Time</span>
          </div>
          <p className="text-sm text-blue-700">
            Bank transfers typically take 1-2 business days to arrive in your account.
          </p>
        </div>

        <div className="space-y-3">
          <div>
            <Label htmlFor="depositAmount">Deposit Amount (USD)</Label>
            <Input
              id="depositAmount"
              type="number"
              placeholder="Enter amount to deposit"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              min="10"
              max={Math.min(currentBalance, 500)}
              step="0.01"
              className={!isValidAmount && amount > 0 ? 'border-red-500' : ''}
            />
            {!isValidAmount && amount > 0 && (
              <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                {getErrorMessage()}
              </p>
            )}
          </div>

          <div className="text-xs text-muted-foreground space-y-1">
            <p>• Minimum: $10.00</p>
            <p>• Maximum per transaction: $500.00</p>
            <p>• Maximum per day: $2,000.00</p>
            <p>• Funds will be deducted from your EarnFlow balance immediately</p>
          </div>
        </div>

        <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
          <AlertDialogTrigger asChild>
            <Button 
              onClick={() => setShowConfirmation(true)}
              disabled={!isValidAmount || loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Banknote className="h-4 w-4 mr-2" />
                  Deposit ${amount.toFixed(2)} to Bank
                </>
              )}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Bank Deposit</AlertDialogTitle>
              <AlertDialogDescription>
                You are about to deposit <strong>${amount.toFixed(2)}</strong> from your EarnFlow balance to your connected bank account.
                <br /><br />
                This action will:
                <br />• Immediately deduct ${amount.toFixed(2)} from your EarnFlow balance
                <br />• Transfer the funds to your bank account within 1-2 business days
                <br />• Cannot be reversed once processed
                <br /><br />
                Your remaining balance will be: <strong>${(currentBalance - amount).toFixed(2)}</strong>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDepositConfirm}>
                Confirm Deposit
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <div className="text-xs text-center text-muted-foreground">
          Secure transfers powered by Stripe. Your bank account must be verified before deposits can be processed.
        </div>
      </CardContent>
    </Card>
  );
};

export default DepositToBank;
