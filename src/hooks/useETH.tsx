
import { useState, useEffect, useCallback } from 'react';
import { ethService, ETHPrice, ETHBalance, GasEstimate } from '@/services/ethService';
import { useToast } from '@/hooks/use-toast';

export const useETH = () => {
  const [ethPrice, setEthPrice] = useState<ETHPrice | null>(null);
  const [loading, setLoading] = useState(false);
  const [priceLoading, setPriceLoading] = useState(false);
  const { toast } = useToast();

  // Subscribe to real-time ETH price updates
  useEffect(() => {
    setPriceLoading(true);
    
    const unsubscribe = ethService.subscribeToPrice(
      (price) => {
        setEthPrice(price);
        setPriceLoading(false);
      },
      30000 // Update every 30 seconds
    );

    return unsubscribe;
  }, []);

  const sendETH = useCallback(async (toAddress: string, amount: string) => {
    setLoading(true);
    try {
      console.log('Initiating ETH transfer:', { toAddress, amount });
      
      const result = await ethService.sendETH(toAddress, amount);
      
      toast({
        title: "ETH Transfer Initiated",
        description: `Successfully sent ${amount} ETH to ${toAddress.slice(0, 10)}...`,
      });
      
      return result;
    } catch (error) {
      console.error('ETH transfer error:', error);
      
      toast({
        title: "Transfer Failed",
        description: error instanceof Error ? error.message : "Failed to send ETH",
        variant: "destructive",
      });
      
      throw error;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const getBalance = useCallback(async (address: string): Promise<ETHBalance> => {
    try {
      console.log('Fetching ETH balance for:', address);
      return await ethService.getBalance(address);
    } catch (error) {
      console.error('Error fetching ETH balance:', error);
      
      toast({
        title: "Balance Fetch Failed",
        description: error instanceof Error ? error.message : "Failed to get ETH balance",
        variant: "destructive",
      });
      
      throw error;
    }
  }, [toast]);

  const estimateGas = useCallback(async (toAddress: string, amount: string): Promise<GasEstimate> => {
    try {
      console.log('Estimating gas for ETH transfer:', { toAddress, amount });
      return await ethService.estimateGas(toAddress, amount);
    } catch (error) {
      console.error('Error estimating gas:', error);
      
      toast({
        title: "Gas Estimation Failed",
        description: error instanceof Error ? error.message : "Failed to estimate gas",
        variant: "destructive",
      });
      
      throw error;
    }
  }, [toast]);

  const validateAddress = useCallback(async (address: string) => {
    try {
      console.log('Validating ETH address:', address);
      return await ethService.validateAddress(address);
    } catch (error) {
      console.error('Error validating address:', error);
      
      toast({
        title: "Address Validation Failed",
        description: error instanceof Error ? error.message : "Failed to validate address",
        variant: "destructive",
      });
      
      throw error;
    }
  }, [toast]);

  const refreshPrice = useCallback(async () => {
    setPriceLoading(true);
    try {
      const price = await ethService.getPrice();
      setEthPrice(price);
    } catch (error) {
      console.error('Error refreshing ETH price:', error);
      
      toast({
        title: "Price Refresh Failed",
        description: error instanceof Error ? error.message : "Failed to refresh ETH price",
        variant: "destructive",
      });
    } finally {
      setPriceLoading(false);
    }
  }, [toast]);

  return {
    ethPrice,
    priceLoading,
    loading,
    sendETH,
    getBalance,
    estimateGas,
    validateAddress,
    refreshPrice,
  };
};
