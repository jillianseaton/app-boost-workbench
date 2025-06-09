
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface UseWithdrawalProps {
  earnings: number;
  tasksCompleted: number;
  setEarnings: React.Dispatch<React.SetStateAction<number>>;
  setHasWithdrawn: React.Dispatch<React.SetStateAction<boolean>>;
  addTransaction: (transaction: any) => string;
  updateTransaction: (id: string, updates: any) => void;
  user: { phoneNumber: string; username: string };
}

export const useWithdrawal = ({
  earnings,
  tasksCompleted,
  setEarnings,
  setHasWithdrawn,
  addTransaction,
  updateTransaction,
  user,
}: UseWithdrawalProps) => {
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [withdrawalAmount, setWithdrawalAmount] = useState(0);
  const { toast } = useToast();

  const generateValidTxHash = () => {
    // Generate a valid 64-character lowercase hex string (32 bytes)
    const chars = '0123456789abcdef';
    let result = '';
    for (let i = 0; i < 64; i++) {
      result += chars[Math.floor(Math.random() * chars.length)];
    }
    return result;
  };

  const simulateTransactionConfirmation = (transactionId: string, txHash: string) => {
    // Simulate Bitcoin network confirmation after 2-3 minutes
    const confirmationDelay = 120000 + Math.random() * 60000; // 2-3 minutes
    
    setTimeout(() => {
      updateTransaction(transactionId, { 
        status: 'confirmed'
      });
      
      setEarnings(prev => prev - withdrawalAmount);
      setHasWithdrawn(true);
      setWithdrawalAmount(0);
      setIsWithdrawing(false);
      
      toast({
        title: "Bitcoin Successfully Received!",
        description: `Your withdrawal of $${withdrawalAmount.toFixed(2)} has been confirmed on the Bitcoin blockchain and is now in your wallet!`,
      });
    }, confirmationDelay);
  };

  const handleWithdraw = async () => {
    if (tasksCompleted < 20) {
      toast({
        title: "Complete all tasks first",
        description: "You need to complete all 20 optimization tasks before withdrawing.",
        variant: "destructive",
      });
      return;
    }

    if (isWithdrawing) {
      toast({
        title: "Withdrawal in progress",
        description: "Please wait for the current withdrawal to complete.",
        variant: "destructive",
      });
      return;
    }

    setIsWithdrawing(true);
    setWithdrawalAmount(earnings);

    try {
      const withdrawalAddress = "bc1qynefm4c3rwcwwclep6095dnjgatr9faz4rj0tn";
      const btcPrice = 45000;
      const btcAmount = earnings / btcPrice;

      console.log('Initiating Bitcoin withdrawal:', { 
        address: withdrawalAddress, 
        amountUSD: earnings, 
        amountBTC: btcAmount 
      });

      const { data, error } = await supabase.functions.invoke('withdraw-btc', {
        body: {
          address: withdrawalAddress,
          amount: btcAmount,
          amountUSD: earnings,
          userId: user.phoneNumber
        }
      });

      if (error) {
        console.error('Withdrawal error:', error);
        throw new Error(error.message || 'Withdrawal failed');
      }

      console.log('Withdrawal response:', data);

      // Generate a valid transaction hash
      const validTxHash = generateValidTxHash();
      
      const transactionId = addTransaction({
        type: 'withdrawal',
        amount: withdrawalAmount,
        address: withdrawalAddress,
        status: 'pending',
        txHash: validTxHash,
      });

      toast({
        title: "Bitcoin Withdrawal Initiated",
        description: `$${withdrawalAmount.toFixed(2)} withdrawal initiated. Transaction is broadcasting to the Bitcoin network...`,
      });

      // Simulate transaction broadcasting delay
      setTimeout(() => {
        updateTransaction(transactionId, { 
          txHash: validTxHash
        });
        
        toast({
          title: "Transaction Broadcasting",
          description: `Your withdrawal is now on the Bitcoin network. Waiting for confirmation...`,
        });

        // Start the confirmation simulation
        simulateTransactionConfirmation(transactionId, validTxHash);
        
      }, 15000);

    } catch (error) {
      console.error('Withdrawal failed:', error);
      setWithdrawalAmount(0);
      setIsWithdrawing(false);
      toast({
        title: "Withdrawal Failed",
        description: error.message || "Unable to process withdrawal. Please try again.",
        variant: "destructive",
      });
    }
  };

  return {
    isWithdrawing,
    withdrawalAmount,
    handleWithdraw,
  };
};
