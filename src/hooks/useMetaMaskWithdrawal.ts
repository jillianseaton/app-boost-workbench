
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

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
      const ethPrice = 2000; // This should come from a real price API in production
      const ethAmount = earnings / ethPrice;

      console.log('Creating MetaMask withdrawal:', { 
        address: withdrawalAddress, 
        amountUSD: earnings, 
        amountETH: ethAmount 
      });

      // Simulate sending ETH to the connected wallet
      // In a real implementation, this would involve a smart contract or backend service
      const transactionHash = `0x${Math.random().toString(16).substr(2, 64)}`;
      
      const transactionId = addTransaction({
        type: 'withdrawal',
        amount: withdrawalAmount,
        address: withdrawalAddress,
        status: 'pending',
        txHash: transactionHash,
        explorerUrl: `https://etherscan.io/tx/${transactionHash}`,
        network: 'ethereum',
        fee: 0.001,
        currency: 'ETH',
        amountETH: ethAmount
      });

      // Simulate transaction processing
      setTimeout(() => {
        updateTransaction(transactionId, { 
          status: 'confirmed'
        });
        
        toast({
          title: "Withdrawal Confirmed!",
          description: `$${withdrawalAmount.toFixed(2)} (${ethAmount.toFixed(4)} ETH) has been sent to your MetaMask wallet.`,
        });
        
        // Update user balance
        setEarnings(prev => prev - withdrawalAmount);
        setHasWithdrawn(true);
        setWithdrawalAmount(0);
        setIsWithdrawing(false);
      }, 3000);

      toast({
        title: "Withdrawal Initiated",
        description: `Processing withdrawal of $${withdrawalAmount.toFixed(2)} to MetaMask...`,
      });

    } catch (error: any) {
      console.error('MetaMask withdrawal failed:', error);
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
    handleMetaMaskWithdrawal,
  };
};
