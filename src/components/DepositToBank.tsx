
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Banknote, Clock, Loader2 } from 'lucide-react';
import { useBankDeposit } from '@/hooks/useBankDeposit';
import DepositForm from './DepositForm';
import DepositConfirmationDialog from './DepositConfirmationDialog';

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
  const {
    depositAmount,
    setDepositAmount,
    loading,
    showConfirmation,
    setShowConfirmation,
    amount,
    isValidAmount,
    getErrorMessage,
    handleDepositConfirm,
  } = useBankDeposit({ currentBalance, onDepositSuccess, userEmail, userId });

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

        <DepositForm
          depositAmount={depositAmount}
          onDepositAmountChange={setDepositAmount}
          currentBalance={currentBalance}
          amount={amount}
          isValidAmount={isValidAmount}
          getErrorMessage={getErrorMessage}
        />

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

        <DepositConfirmationDialog
          open={showConfirmation}
          onOpenChange={setShowConfirmation}
          amount={amount}
          currentBalance={currentBalance}
          onConfirm={handleDepositConfirm}
        />

        <div className="text-xs text-center text-muted-foreground">
          Secure transfers powered by Stripe. Your bank account must be verified before deposits can be processed.
        </div>
      </CardContent>
    </Card>
  );
};

export default DepositToBank;
