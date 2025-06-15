
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface UseBankDepositProps {
  currentBalance: number;
  onDepositSuccess: (amount: number) => void;
  userEmail: string;
  userId: string;
}

export const useBankDeposit = ({ 
  currentBalance, 
  onDepositSuccess, 
  userEmail, 
  userId 
}: UseBankDepositProps) => {
  const [depositAmount, setDepositAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const { toast } = useToast();

  const amount = parseFloat(depositAmount) || 0;
  const isValidAmount = amount >= 10 && amount <= currentBalance && amount <= 5000;

  const getErrorMessage = () => {
    if (amount < 10) return 'Minimum deposit amount is $10.00';
    if (amount > currentBalance) return 'Cannot deposit more than your current balance';
    if (amount > 5000) return 'Maximum deposit per transaction is $5,000.00';
    return '';
  };

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

  return {
    depositAmount,
    setDepositAmount,
    loading,
    showConfirmation,
    setShowConfirmation,
    amount,
    isValidAmount,
    getErrorMessage,
    handleDepositConfirm,
  };
};
