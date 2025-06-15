
import React from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

interface DepositConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  amount: number;
  currentBalance: number;
  onConfirm: () => void;
}

const DepositConfirmationDialog: React.FC<DepositConfirmationDialogProps> = ({
  open,
  onOpenChange,
  amount,
  currentBalance,
  onConfirm,
}) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
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
          <AlertDialogAction onClick={onConfirm}>
            Confirm Deposit
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DepositConfirmationDialog;
