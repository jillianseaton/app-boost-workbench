
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

  const pollTransactionStatus = (txHash: string, transactionId: string) => {
    let attempts = 0;
    const maxAttempts = 60; // 30 minutes max polling
    
    const poll = setInterval(async () => {
      attempts++;
      console.log(`Checking real Bitcoin transaction status, attempt ${attempts}/${maxAttempts}`);
      
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
          return;
        }

        console.log('Real Bitcoin transaction status:', data);

        if (data.confirmed) {
          clearInterval(poll);
          
          updateTransaction(transactionId, { 
            status: 'confirmed',
            confirmations: data.confirmations,
            blockHeight: data.blockHeight
          });
          
          setEarnings(prev => prev - withdrawalAmount);
          setHasWithdrawn(true);
          setWithdrawalAmount(0);
          setIsWithdrawing(false);
          
          toast({
            title: "Bitcoin Transaction Confirmed!",
            description: `Your withdrawal of $${withdrawalAmount.toFixed(2)} has been confirmed on the Bitcoin blockchain! Block height: ${data.blockHeight}`,
          });
        } else if (attempts >= maxAttempts) {
          clearInterval(poll);
          toast({
            title: "Transaction Still Pending",
            description: "Your Bitcoin transaction is taking longer than expected. Check the blockchain explorer for updates.",
            variant: "destructive",
          });
          setIsWithdrawing(false);
        }
      } catch (error) {
        console.error('Failed to check transaction status:', error);
        if (attempts >= maxAttempts) {
          clearInterval(poll);
          setIsWithdrawing(false);
        }
      }
    }, 30000); // Check every 30 seconds
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

      console.log('Creating real Bitcoin transaction:', { 
        address: withdrawalAddress, 
        amountUSD: earnings, 
        amountBTC: btcAmount 
      });

      // Create and broadcast real Bitcoin transaction
      const { data, error } = await supabase.functions.invoke('btc-transaction-broadcaster', {
        body: {
          action: 'create_and_broadcast',
          transactionData: {
            privateKeyWIF: process.env.BITCOIN_PRIVATE_KEY_WIF || 'L1aW4aubDFB7yfras2S1mN3bqg9nwySY8nkoLmJebSLD5BWv3ENZ', // Demo key - replace with real key
            recipientAddress: withdrawalAddress,
            amountSats: Math.floor(btcAmount * 100000000), // Convert BTC to satoshis
            network: 'mainnet',
            feeRate: 'medium'
          }
        }
      });

      if (error) {
        console.error('Real Bitcoin transaction error:', error);
        throw new Error(error.message || 'Bitcoin transaction failed');
      }

      console.log('Real Bitcoin transaction created:', data);

      const transactionId = addTransaction({
        type: 'withdrawal',
        amount: withdrawalAmount,
        address: withdrawalAddress,
        status: 'pending',
        txHash: data.txid,
        explorerUrl: data.explorerUrl,
        network: 'mainnet',
        fee: data.fee
      });

      toast({
        title: "Real Bitcoin Transaction Created!",
        description: `Your $${withdrawalAmount.toFixed(2)} withdrawal has been broadcast to the Bitcoin network. TXID: ${data.txid}`,
      });

      // Update transaction with real data
      updateTransaction(transactionId, { 
        txHash: data.txid,
        explorerUrl: data.explorerUrl,
        fee: data.fee,
        status: 'pending'
      });
      
      toast({
        title: "Bitcoin Transaction Broadcasting",
        description: `Your real Bitcoin transaction is now on the network. Waiting for confirmation...`,
      });

      // Start polling for real confirmation
      pollTransactionStatus(data.txid, transactionId);

    } catch (error) {
      console.error('Real Bitcoin withdrawal failed:', error);
      setWithdrawalAmount(0);
      setIsWithdrawing(false);
      toast({
        title: "Bitcoin Transaction Failed",
        description: error.message || "Unable to create Bitcoin transaction. Please try again.",
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
