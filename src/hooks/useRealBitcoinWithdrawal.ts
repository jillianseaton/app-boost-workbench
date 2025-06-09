
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { WalletInfo, MultisigWallet } from './useWalletManager';

interface UseRealBitcoinWithdrawalProps {
  earnings: number;
  tasksCompleted: number;
  selectedWallet: WalletInfo | MultisigWallet | null;
  setEarnings: React.Dispatch<React.SetStateAction<number>>;
  setHasWithdrawn: React.Dispatch<React.SetStateAction<boolean>>;
  addTransaction: (transaction: any) => string;
  updateTransaction: (id: string, updates: any) => void;
  user: { phoneNumber: string; username: string };
}

export const useRealBitcoinWithdrawal = ({
  earnings,
  tasksCompleted,
  selectedWallet,
  setEarnings,
  setHasWithdrawn,
  addTransaction,
  updateTransaction,
  user,
}: UseRealBitcoinWithdrawalProps) => {
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [withdrawalAmount, setWithdrawalAmount] = useState(0);
  const { toast } = useToast();

  const pollTransactionStatus = (txHash: string, transactionId: string) => {
    let attempts = 0;
    const maxAttempts = 120; // 60 minutes max polling
    
    const poll = setInterval(async () => {
      attempts++;
      console.log(`Checking Bitcoin transaction status, attempt ${attempts}/${maxAttempts}`);
      
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

        console.log('Bitcoin transaction status:', data);

        if (data.confirmed) {
          clearInterval(poll);
          
          updateTransaction(transactionId, { 
            status: 'confirmed',
            confirmations: data.confirmations,
            blockHeight: data.blockHeight,
            blockTime: data.blockTime
          });
          
          setEarnings(prev => prev - withdrawalAmount);
          setHasWithdrawn(true);
          setWithdrawalAmount(0);
          setIsWithdrawing(false);
          
          toast({
            title: "Bitcoin Transaction Confirmed!",
            description: `Your withdrawal of $${withdrawalAmount.toFixed(2)} has been confirmed on Bitcoin block ${data.blockHeight}`,
          });
        } else if (attempts >= maxAttempts) {
          clearInterval(poll);
          updateTransaction(transactionId, { 
            status: 'timeout',
            note: 'Transaction confirmation timeout - check blockchain explorer'
          });
          
          toast({
            title: "Transaction Still Pending",
            description: "Transaction is taking longer than expected. Check blockchain explorer for updates.",
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

  const handleRealBitcoinWithdrawal = async () => {
    if (tasksCompleted < 20) {
      toast({
        title: "Complete all tasks first",
        description: "You need to complete all 20 optimization tasks before withdrawing.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedWallet) {
      toast({
        title: "No Wallet Selected",
        description: "Please select a Bitcoin wallet for withdrawal.",
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

    // Security confirmation for real Bitcoin transaction
    const confirmed = window.confirm(
      `⚠️ REAL BITCOIN TRANSACTION WARNING ⚠️\n\n` +
      `You are about to send REAL BITCOIN worth $${earnings.toFixed(2)} to:\n` +
      `${selectedWallet.address}\n\n` +
      `This transaction is IRREVERSIBLE and will cost real money in fees.\n` +
      `Are you absolutely sure you want to proceed?`
    );

    if (!confirmed) {
      return;
    }

    setIsWithdrawing(true);
    setWithdrawalAmount(earnings);

    try {
      const btcPrice = 45000; // This should come from a real price API in production
      const btcAmount = earnings / btcPrice;
      const amountSats = Math.floor(btcAmount * 100000000);

      console.log('Creating REAL Bitcoin transaction:', { 
        address: selectedWallet.address, 
        amountUSD: earnings, 
        amountBTC: btcAmount,
        amountSats,
        walletType: selectedWallet.walletType
      });

      // Create and broadcast real Bitcoin transaction
      const { data, error } = await supabase.functions.invoke('btc-transaction-broadcaster', {
        body: {
          action: 'create_and_broadcast',
          transactionData: {
            recipientAddress: selectedWallet.address,
            amountSats: amountSats,
            network: 'mainnet',
            feeRate: 'medium',
            walletType: selectedWallet.walletType,
            isMultisig: selectedWallet.walletType === 'multisig'
          }
        }
      });

      if (error) {
        console.error('Real Bitcoin transaction error:', error);
        throw new Error(error.message || 'Bitcoin transaction failed');
      }

      console.log('Real Bitcoin transaction created and broadcast:', data);

      const transactionId = addTransaction({
        type: 'withdrawal',
        amount: withdrawalAmount,
        address: selectedWallet.address,
        status: 'pending',
        txHash: data.txid,
        explorerUrl: data.explorerUrl,
        network: 'mainnet',
        fee: data.fee,
        walletType: selectedWallet.walletType,
        amountSats: amountSats,
        timestamp: new Date().toISOString()
      });

      updateTransaction(transactionId, { 
        txHash: data.txid,
        explorerUrl: data.explorerUrl,
        fee: data.fee,
        status: 'pending',
        broadcastResults: data.broadcastResults
      });
      
      toast({
        title: "Real Bitcoin Transaction Broadcast!",
        description: `Your $${withdrawalAmount.toFixed(2)} withdrawal has been broadcast to Bitcoin mainnet. TXID: ${data.txid.substring(0, 16)}...`,
      });

      // Start monitoring for real confirmation
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
    handleRealBitcoinWithdrawal,
  };
};
