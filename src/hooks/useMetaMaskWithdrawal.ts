
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
      // Ensure MetaMask is connected
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      
      if (accounts.length === 0) {
        throw new Error('No MetaMask account connected');
      }

      const withdrawalAddress = accounts[0];

      // Verify we're on Ethereum mainnet
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      if (chainId !== '0x1') {
        // Request switch to Ethereum mainnet
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0x1' }],
          });
        } catch (switchError: any) {
          if (switchError.code === 4902) {
            throw new Error('Please add Ethereum Mainnet to MetaMask and try again');
          }
          throw switchError;
        }
      }

      // Get current user for authentication
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      console.log('Initiating REAL MetaMask withdrawal:', { 
        address: withdrawalAddress, 
        amountUSD: earnings,
        userId: currentUser.id,
        network: 'ethereum-mainnet'
      });

      // Create pending transaction record
      const transactionId = addTransaction({
        type: 'withdrawal',
        amount: withdrawalAmount,
        address: withdrawalAddress,
        status: 'pending',
        network: 'ethereum',
        currency: 'ETH',
        isReal: true
      });

      toast({
        title: "Processing Real Withdrawal...",
        description: "Creating Ethereum transaction. This may take a few moments.",
      });

      // Call the REAL withdrawal edge function
      const { data, error } = await supabase.functions.invoke('metamask-withdrawal', {
        body: {
          userId: currentUser.id,
          userAddress: withdrawalAddress,
          amountUSD: earnings,
          transactionId
        }
      });

      if (error) {
        console.error('Withdrawal API error:', error);
        throw new Error(error.message || 'Withdrawal service error');
      }

      if (!data.success) {
        throw new Error(data.error || 'Withdrawal failed');
      }

      console.log('Real withdrawal response:', data);

      // Update transaction with real blockchain data
      updateTransaction(transactionId, {
        status: 'broadcasted',
        txHash: data.txHash,
        explorerUrl: data.explorerUrl,
        amountETH: data.ethAmount,
        gasFeeETH: data.gasFeeETH,
        ethPrice: data.ethPrice,
        network: 'ethereum-mainnet',
        isReal: true
      });

      toast({
        title: "Real Transaction Broadcasted!",
        description: `${data.ethAmount.toFixed(6)} ETH sent to Ethereum mainnet. TX: ${data.txHash.substring(0, 10)}...`,
        duration: 10000,
      });

      // Update user balance immediately (optimistic update)
      setEarnings(prev => prev - withdrawalAmount);
      setHasWithdrawn(true);
      setWithdrawalAmount(0);

      // Monitor for confirmation and show success message
      setTimeout(() => {
        toast({
          title: "Check Transaction Status",
          description: `Track your transaction on Etherscan: ${data.explorerUrl}`,
          duration: 15000,
        });
      }, 5000);

    } catch (error: any) {
      console.error('Real MetaMask withdrawal failed:', error);
      setWithdrawalAmount(0);
      
      // Specific error handling for different scenarios
      let errorMessage = error.message || "Unable to process withdrawal. Please try again.";
      
      if (error.message?.includes('insufficient')) {
        errorMessage = "Insufficient funds in hot wallet. Please contact support.";
      } else if (error.message?.includes('Invalid Ethereum address')) {
        errorMessage = "Invalid Ethereum address. Please check your MetaMask wallet.";
      } else if (error.message?.includes('User rejected')) {
        errorMessage = "Transaction rejected by user.";
      }
      
      toast({
        title: "Real Withdrawal Failed",
        description: errorMessage,
        variant: "destructive",
        duration: 10000,
      });
      
      // Restore earnings if withdrawal failed before broadcast
      if (!error.message?.includes('broadcasted')) {
        setEarnings(prev => prev + withdrawalAmount);
        setHasWithdrawn(false);
      }
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
