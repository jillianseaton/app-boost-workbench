
import { useState, useCallback } from 'react';
import { secureBankService, BankAccountUpdateRequest } from '@/services/secureBankService';
import { useToast } from '@/hooks/use-toast';

export const useUpdateBankAccount = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const updateBankAccount = useCallback(async (request: BankAccountUpdateRequest) => {
    setLoading(true);
    try {
      console.log('Updating bank account:', request);
      
      const result = await secureBankService.updateBankAccount(request);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to update bank account');
      }
      
      toast({
        title: "Bank Account Updated",
        description: "Your bank account has been updated. New micro-deposit verification will begin shortly.",
      });
      
      return result.data;
    } catch (error) {
      console.error('Bank account update error:', error);
      
      toast({
        title: "Update Failed",
        description: error instanceof Error ? error.message : "Failed to update bank account",
        variant: "destructive",
      });
      
      throw error;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  return {
    loading,
    updateBankAccount,
  };
};
