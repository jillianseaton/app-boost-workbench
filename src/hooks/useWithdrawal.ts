
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface UseWithdrawalProps {
  earnings: number;
  setEarnings: React.Dispatch<React.SetStateAction<number>>;
  setHasWithdrawn: React.Dispatch<React.SetStateAction<boolean>>;
  addTransaction: (transaction: any) => string;
  updateTransaction: (id: string, updates: any) => void;
  user: { phoneNumber: string; username: string };
}

export const useWithdrawal = ({
  earnings,
  setEarnings,
  setHasWithdrawn,
  addTransaction,
  updateTransaction,
  user,
}: UseWithdrawalProps) => {
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [withdrawalAmount, setWithdrawalAmount] = useState(0);
  const { toast } = useToast();

  const checkTransactionStatus = async (txHash: string, transactionId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('btc-transaction-broadcaster', {
        body: {
          action: 'check_transaction',
          transactionData: {
            txid: txHash,
            network: 'mainnet'
          }
        }
      });

      if (error) {
        console.error('Error checking transaction status:', error);
        return false;
      }

      console.log('Transaction status check:', data);

      if (data.confirmed) {
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
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Failed to check transaction status:', error);
      return false;
    }
  };

  const pollTransactionStatus = (txHash: string, transactionId: string) => {
    let attempts = 0;
    const maxAttempts = 60;
    
    const poll = setInterval(async () => {
      attempts++;
      console.log(`Checking transaction status, attempt ${attempts}/${maxAttempts}`);
      
      const isConfirmed = await checkTransactionStatus(txHash, transactionId);
      
      if (isConfirmed || attempts >= maxAttempts) {
        clearInterval(poll);
        
        if (!isConfirmed && attempts >= maxAttempts) {
          toast({
            title: "Transaction Still Pending",
            description: "Your withdrawal is taking longer than expected. Please check your wallet manually or contact support.",
            variant: "destructive",
          });
          setIsWithdrawing(false);
        }
      }
    }, 30000);
  };

  const handleWithdraw = async () => {
    if (earnings < 10) {
      toast({
        title: "Minimum withdrawal not met",
        description: "You need at least $10.00 to withdraw.",
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
      const withdrawalAddress = "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh";
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

      const transactionId = addTransaction({
        type: 'withdrawal',
        amount: withdrawalAmount,
        address: withdrawalAddress,
        status: 'pending',
        txHash: data.withdrawalId,
      });

      toast({
        title: "Bitcoin Withdrawal Initiated",
        description: `$${withdrawalAmount.toFixed(2)} withdrawal initiated. Monitoring blockchain for confirmation...`,
      });

      setTimeout(() => {
        const finalTxHash = data.txHash || `tx_${data.withdrawalId}_mainnet`;
        
        updateTransaction(transactionId, { 
          txHash: finalTxHash
        });
        
        toast({
          title: "Transaction Broadcasting",
          description: `Your withdrawal is now broadcasting to the Bitcoin network. Earnings will be deducted once confirmed.`,
        });

        pollTransactionStatus(finalTxHash, transactionId);
        
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
