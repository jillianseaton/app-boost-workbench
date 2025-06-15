
import { useState, useCallback } from 'react';
import { secureBankService, BankAccountCreationRequest, BankAccountVerificationRequest, SecureDepositRequest } from '@/services/secureBankService';
import { useToast } from '@/hooks/use-toast';

export const useSecureBankAccount = () => {
  const [loading, setLoading] = useState(false);
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [depositLoading, setDepositLoading] = useState(false);
  const { toast } = useToast();

  const createBankAccount = useCallback(async (request: BankAccountCreationRequest) => {
    setLoading(true);
    try {
      console.log('Creating secure bank account:', request);
      
      const result = await secureBankService.createBankAccount(request);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to create bank account');
      }
      
      toast({
        title: "Bank Account Created",
        description: "Your bank account has been created. Micro-deposit verification will begin shortly.",
      });
      
      return result.data;
    } catch (error) {
      console.error('Bank account creation error:', error);
      
      toast({
        title: "Account Creation Failed",
        description: error instanceof Error ? error.message : "Failed to create bank account",
        variant: "destructive",
      });
      
      throw error;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const verifyBankAccount = useCallback(async (request: BankAccountVerificationRequest) => {
    setVerificationLoading(true);
    try {
      console.log('Verifying bank account micro-deposits');
      
      const result = await secureBankService.verifyBankAccount(request);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to verify bank account');
      }
      
      const isVerified = result.data.verificationStatus === 'verified';
      
      toast({
        title: isVerified ? "Account Verified" : "Verification Failed",
        description: result.data.message,
        variant: isVerified ? "default" : "destructive",
      });
      
      return result.data;
    } catch (error) {
      console.error('Bank account verification error:', error);
      
      toast({
        title: "Verification Failed",
        description: error instanceof Error ? error.message : "Failed to verify bank account",
        variant: "destructive",
      });
      
      throw error;
    } finally {
      setVerificationLoading(false);
    }
  }, [toast]);

  const processSecureDeposit = useCallback(async (request: SecureDepositRequest) => {
    setDepositLoading(true);
    try {
      console.log('Processing secure deposit to verified account');
      
      const result = await secureBankService.processSecureDeposit(request);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to process secure deposit');
      }
      
      toast({
        title: "Secure Deposit Initiated",
        description: `$${request.amount.toFixed(2)} will be transferred to your verified bank account within 1-2 business days.`,
      });
      
      return result.data;
    } catch (error) {
      console.error('Secure deposit error:', error);
      
      toast({
        title: "Deposit Failed",
        description: error instanceof Error ? error.message : "Failed to process secure deposit",
        variant: "destructive",
      });
      
      throw error;
    } finally {
      setDepositLoading(false);
    }
  }, [toast]);

  return {
    loading,
    verificationLoading,
    depositLoading,
    createBankAccount,
    verifyBankAccount,
    processSecureDeposit,
  };
};
