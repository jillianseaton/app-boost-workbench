
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface UseMetaMaskWithdrawalProps {
  earnings: number;
  tasksCompleted: number;
  setEarnings: React.Dispatch<React.SetStateAction<number>>;
  setHasWithdrawn: React.Dispatch<React.SetStateAction<boolean>>;
  addTransaction: (transaction: any) => string;
  updateTransaction: (id: string, updates: any) => void;
  user: { phoneNumber: string; username: string };
}

export const useMetaMaskWithdrawal = ({
  earnings,
  tasksCompleted,
  setEarnings,
  setHasWithdrawn,
  addTransaction,
  updateTransaction,
  user,
}: UseMetaMaskWithdrawalProps) => {
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [withdrawalAmount, setWithdrawalAmount] = useState(0);
  const { toast } = useToast();

  const handleMetaMaskWithdrawal = async () => {
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

    if (!window.ethereum) {
      toast({
        title: "MetaMask Required",
        description: "Please install and connect MetaMask to withdraw funds.",
        variant: "destructive",
      });
      return;
    }

    setIsWithdrawing(true);
    setWithdrawalAmount(earnings);

    try {
      // Get connected account
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      
      if (accounts.length === 0) {
        throw new Error('No MetaMask account connected');
      }

      const withdrawalAddress = accounts[0];

      // Get current user
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      console.log('Initiating real MetaMask withdrawal:', { 
        address: withdrawalAddress, 
        amountUSD: earnings,
        userId: currentUser.id
      });

      // Create pending transaction record
      const transactionId = addTransaction({
        type: 'withdrawal',
        amount: withdrawalAmount,
        address: withdrawalAddress,
        status: 'pending',
        network: 'ethereum',
        currency: 'ETH'
      });

      // Call the real withdrawal edge function
      const { data, error } = await supabase.functions.invoke('metamask-withdrawal', {
        body: {
          userId: currentUser.id,
          userAddress: withdrawalAddress,
          amountUSD: earnings,
          transactionId
        }
      });

      if (error) {
        throw error;
      }

      if (!data.success) {
        throw new Error(data.error || 'Withdrawal failed');
      }

      // Update transaction with real blockchain data
      updateTransaction(transactionId, {
        status: 'broadcasted',
        txHash: data.txHash,
        explorerUrl: data.explorerUrl,
        amountETH: data.ethAmount,
        gasFeeETH: data.gasFeeETH,
        ethPrice: data.ethPrice
      });

      toast({
        title: "Withdrawal Broadcasted!",
        description: `$${withdrawalAmount.toFixed(2)} (${data.ethAmount.toFixed(6)} ETH) has been sent to the blockchain. Confirmation pending...`,
      });

      // Update user balance immediately
      setEarnings(prev => prev - withdrawalAmount);
      setHasWithdrawn(true);
      setWithdrawalAmount(0);

      // Monitor for confirmation
      setTimeout(async () => {
        try {
          // Check if transaction is confirmed
          const response = await fetch(`https://api.etherscan.io/api?module=transaction&action=gettxreceiptstatus&txhash=${data.txHash}&apikey=demo`);
          const txData = await response.json();
          
          if (txData.result?.status === '1') {
            updateTransaction(transactionId, { status: 'confirmed' });
            toast({
              title: "Withdrawal Confirmed!",
              description: `Transaction confirmed on Ethereum blockchain.`,
            });
          }
        } catch (error) {
          console.error('Error checking confirmation:', error);
        }
      }, 120000); // Check after 2 minutes

    } catch (error: any) {
      console.error('MetaMask withdrawal failed:', error);
      setWithdrawalAmount(0);
      setIsWithdrawing(false);
      
      toast({
        title: "Withdrawal Failed",
        description: error.message || "Unable to process withdrawal. Please try again.",
        variant: "destructive",
      });
      
      // Restore earnings if withdrawal failed
      setEarnings(prev => prev + withdrawalAmount);
      setHasWithdrawn(false);
    } finally {
      setIsWithdrawing(false);
    }
  };

  return {
    isWithdrawing,
    withdrawalAmount,
    handleMetaMaskWithdrawal,
  };
};
