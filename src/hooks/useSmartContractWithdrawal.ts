
import { useState } from 'react';
import { ethers } from 'ethers';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const WITHDRAWAL_CONTRACT_ADDRESS = '0x...'; // Will be set after deployment
const WITHDRAWAL_CONTRACT_ABI = [
  "function requestWithdrawal(address user, uint256 amount, string memory transactionId) external",
  "function executeWithdrawal(bytes32 withdrawalId) external",
  "function getContractBalance() external view returns (uint256)",
  "event WithdrawalRequested(bytes32 indexed withdrawalId, address indexed user, uint256 amount, string transactionId)",
  "event WithdrawalCompleted(bytes32 indexed withdrawalId, address indexed user, uint256 amount)"
];

interface UseSmartContractWithdrawalProps {
  earnings: number;
  tasksCompleted: number;
  setEarnings: React.Dispatch<React.SetStateAction<number>>;
  setHasWithdrawn: React.Dispatch<React.SetStateAction<boolean>>;
  addTransaction: (transaction: any) => string;
  updateTransaction: (id: string, updates: any) => void;
  user: { phoneNumber: string; username: string };
}

export const useSmartContractWithdrawal = ({
  earnings,
  tasksCompleted,
  setEarnings,
  setHasWithdrawn,
  addTransaction,
  updateTransaction,
  user,
}: UseSmartContractWithdrawalProps) => {
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [gasEstimate, setGasEstimate] = useState<{
    gasPrice: bigint;
    gasLimit: bigint;
    totalCost: bigint;
  } | null>(null);
  const { toast } = useToast();

  const estimateGasFees = async (userAddress: string, amountETH: number) => {
    try {
      if (!window.ethereum) {
        throw new Error('MetaMask not found');
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(WITHDRAWAL_CONTRACT_ADDRESS, WITHDRAWAL_CONTRACT_ABI, signer);

      // Get current gas price
      const feeData = await provider.getFeeData();
      const gasPrice = feeData.gasPrice || BigInt(20000000000); // 20 Gwei fallback

      // Estimate gas limit for withdrawal request
      const amountWei = ethers.parseEther(amountETH.toString());
      const transactionId = `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const gasLimit = await contract.requestWithdrawal.estimateGas(
        userAddress,
        amountWei,
        transactionId
      );

      const totalCost = gasPrice * gasLimit;

      const estimate = {
        gasPrice,
        gasLimit,
        totalCost
      };

      setGasEstimate(estimate);
      return estimate;

    } catch (error) {
      console.error('Gas estimation error:', error);
      // Fallback gas estimation
      const fallbackEstimate = {
        gasPrice: BigInt(20000000000), // 20 Gwei
        gasLimit: BigInt(100000), // 100k gas
        totalCost: BigInt(2000000000000000) // 0.002 ETH
      };
      setGasEstimate(fallbackEstimate);
      return fallbackEstimate;
    }
  };

  const handleSmartContractWithdrawal = async () => {
    if (tasksCompleted < 20) {
      toast({
        title: "Complete all tasks first",
        description: "You need to complete all 20 optimization tasks before withdrawing.",
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

    try {
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      
      if (accounts.length === 0) {
        throw new Error('No MetaMask account connected');
      }

      const userAddress = accounts[0];
      const ethPrice = await getCurrentETHPrice();
      const ethAmount = earnings / ethPrice;

      // Estimate gas fees
      const gasEstimate = await estimateGasFees(userAddress, ethAmount);
      const gasFeeETH = Number(ethers.formatEther(gasEstimate.totalCost));

      console.log('Smart contract withdrawal:', {
        userAddress,
        amountUSD: earnings,
        amountETH: ethAmount,
        gasFeeETH
      });

      // Get current user
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      // Create pending transaction record
      const transactionId = addTransaction({
        type: 'withdrawal',
        amount: earnings,
        address: userAddress,
        status: 'pending',
        network: 'ethereum',
        currency: 'ETH',
        gasEstimate: gasFeeETH,
        method: 'smart_contract'
      });

      // Call the smart contract withdrawal edge function
      const { data, error } = await supabase.functions.invoke('smart-contract-withdrawal', {
        body: {
          userId: currentUser.id,
          userAddress,
          amountUSD: earnings,
          amountETH: ethAmount,
          transactionId,
          gasEstimate: {
            gasPrice: gasEstimate.gasPrice.toString(),
            gasLimit: gasEstimate.gasLimit.toString(),
            totalCost: gasEstimate.totalCost.toString()
          }
        }
      });

      if (error) {
        throw error;
      }

      if (!data.success) {
        throw new Error(data.error || 'Smart contract withdrawal failed');
      }

      // Update transaction with smart contract data
      updateTransaction(transactionId, {
        status: 'pending_execution',
        contractAddress: data.contractAddress,
        withdrawalId: data.withdrawalId,
        requestTxHash: data.requestTxHash,
        gasUsed: data.gasUsed,
        gasFeeETH: data.actualGasFee
      });

      toast({
        title: "Withdrawal Requested!",
        description: `Smart contract withdrawal of ${ethAmount.toFixed(6)} ETH has been requested. Execution pending...`,
      });

      // Update user balance immediately
      setEarnings(prev => prev - earnings);
      setHasWithdrawn(true);

      // Monitor for execution
      monitorWithdrawalExecution(data.withdrawalId, transactionId);

    } catch (error: any) {
      console.error('Smart contract withdrawal failed:', error);
      
      toast({
        title: "Withdrawal Failed",
        description: error.message || "Unable to process smart contract withdrawal. Please try again.",
        variant: "destructive",
      });
      
    } finally {
      setIsWithdrawing(false);
    }
  };

  const monitorWithdrawalExecution = async (withdrawalId: string, transactionId: string) => {
    // Monitor smart contract events for withdrawal execution
    const maxAttempts = 30; // 15 minutes max
    let attempts = 0;

    const checkExecution = async () => {
      try {
        const { data } = await supabase.functions.invoke('check-withdrawal-status', {
          body: { withdrawalId }
        });

        if (data?.executed) {
          updateTransaction(transactionId, {
            status: 'confirmed',
            executionTxHash: data.executionTxHash,
            finalGasFee: data.finalGasFee
          });

          toast({
            title: "Withdrawal Executed!",
            description: `Smart contract withdrawal has been executed successfully.`,
          });
          return;
        }

        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(checkExecution, 30000); // Check every 30 seconds
        }
      } catch (error) {
        console.error('Error checking withdrawal status:', error);
      }
    };

    setTimeout(checkExecution, 30000); // Start checking after 30 seconds
  };

  const getCurrentETHPrice = async (): Promise<number> => {
    try {
      const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd');
      const data = await response.json();
      return data.ethereum.usd;
    } catch (error) {
      console.error('Error fetching ETH price:', error);
      return 3000; // Fallback price
    }
  };

  return {
    isWithdrawing,
    gasEstimate,
    handleSmartContractWithdrawal,
    estimateGasFees,
  };
};
