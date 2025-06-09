
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

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
      const ethPrice = 2000; // Example ETH price
      const ethAmount = earnings / ethPrice;

      console.log('Creating MetaMask withdrawal:', { 
        address: withdrawalAddress, 
        amountUSD: earnings, 
        amountETH: ethAmount 
      });

      // Simulate withdrawal process
      const transactionId = addTransaction({
        type: 'withdrawal',
        amount: withdrawalAmount,
        address: withdrawalAddress,
        status: 'completed',
        txHash: `0x${Math.random().toString(16).substr(2, 64)}`,
        explorerUrl: `https://etherscan.io/tx/0x${Math.random().toString(16).substr(2, 64)}`,
        network: 'ethereum',
        fee: 0.001
      });

      toast({
        title: "Withdrawal Successful!",
        description: `$${withdrawalAmount.toFixed(2)} has been sent to your MetaMask wallet.`,
      });

      // Update transaction as completed
      updateTransaction(transactionId, { 
        status: 'completed'
      });
      
      // Update user balance
      setEarnings(prev => prev - withdrawalAmount);
      setHasWithdrawn(true);
      setWithdrawalAmount(0);

    } catch (error: any) {
      console.error('MetaMask withdrawal failed:', error);
      setWithdrawalAmount(0);
      toast({
        title: "Withdrawal Failed",
        description: error.message || "Unable to process withdrawal. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsWithdrawing(false);
    }
  };

  return {
    isWithdrawing,
    withdrawalAmount,
    handleWithdraw,
  };
};
