
import { useState, useEffect, useCallback } from 'react';
import { web3Service, ContractConfig } from '@/services/web3Service';
import { useToast } from '@/hooks/use-toast';
import Web3 from 'web3';

export const useWeb3 = () => {
  const [web3, setWeb3] = useState<Web3 | null>(null);
  const [accounts, setAccounts] = useState<string[]>([]);
  const [networkId, setNetworkId] = useState<number | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Initialize Web3 connection
  const connectWallet = useCallback(async (rpcUrl?: string) => {
    setIsLoading(true);
    try {
      const web3Instance = await web3Service.initializeWeb3({ rpcUrl });
      setWeb3(web3Instance);

      const userAccounts = await web3Service.getAccounts();
      setAccounts(userAccounts);

      const netId = await web3Service.getNetworkId();
      setNetworkId(netId);

      const connected = await web3Service.isWalletConnected();
      setIsConnected(connected);

      toast({
        title: "Wallet Connected",
        description: `Connected to network ${netId} with ${userAccounts.length} account(s)`,
      });

      console.log('Web3 connected:', { accounts: userAccounts, networkId: netId });
    } catch (error) {
      console.error('Web3 connection error:', error);
      toast({
        title: "Connection Failed",
        description: error instanceof Error ? error.message : "Failed to connect to Web3",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Create contract instance
  const createContract = useCallback((contractConfig: ContractConfig) => {
    try {
      return web3Service.createContract(contractConfig);
    } catch (error) {
      console.error('Contract creation error:', error);
      toast({
        title: "Contract Error",
        description: error instanceof Error ? error.message : "Failed to create contract",
        variant: "destructive",
      });
      return null;
    }
  }, [toast]);

  // Get balance
  const getBalance = useCallback(async (address: string) => {
    try {
      return await web3Service.getBalance(address);
    } catch (error) {
      console.error('Balance fetch error:', error);
      toast({
        title: "Balance Error",
        description: error instanceof Error ? error.message : "Failed to get balance",
        variant: "destructive",
      });
      return '0';
    }
  }, [toast]);

  // Call contract method
  const callContractMethod = useCallback(async (
    contractAddress: string,
    methodName: string,
    params: any[] = []
  ) => {
    try {
      return await web3Service.callContractMethod(contractAddress, methodName, params);
    } catch (error) {
      console.error('Contract call error:', error);
      toast({
        title: "Contract Call Failed",
        description: error instanceof Error ? error.message : "Failed to call contract method",
        variant: "destructive",
      });
      throw error;
    }
  }, [toast]);

  // Send contract transaction
  const sendContractTransaction = useCallback(async (
    contractAddress: string,
    methodName: string,
    params: any[] = [],
    options: { from?: string; value?: string; gas?: number } = {}
  ) => {
    try {
      // Ensure 'from' is provided
      const transactionOptions = {
        from: options.from || (accounts.length > 0 ? accounts[0] : ''),
        value: options.value,
        gas: options.gas
      };

      if (!transactionOptions.from) {
        throw new Error('No account available for transaction');
      }

      return await web3Service.sendContractTransaction(contractAddress, methodName, params, transactionOptions);
    } catch (error) {
      console.error('Transaction error:', error);
      toast({
        title: "Transaction Failed",
        description: error instanceof Error ? error.message : "Failed to send transaction",
        variant: "destructive",
      });
      throw error;
    }
  }, [accounts, toast]);

  // Switch network
  const switchNetwork = useCallback(async (networkId: string) => {
    try {
      await web3Service.switchNetwork(networkId);
      toast({
        title: "Network Switched",
        description: `Switched to network ${networkId}`,
      });
    } catch (error) {
      console.error('Network switch error:', error);
      toast({
        title: "Network Switch Failed",
        description: error instanceof Error ? error.message : "Failed to switch network",
        variant: "destructive",
      });
    }
  }, [toast]);

  // Listen for account changes
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      const handleAccountsChanged = (newAccounts: string[]) => {
        setAccounts(newAccounts);
        setIsConnected(newAccounts.length > 0);
      };

      const handleChainChanged = (chainId: string) => {
        setNetworkId(parseInt(chainId, 16));
        window.location.reload(); // Reload on network change
      };

      (window as any).ethereum.on('accountsChanged', handleAccountsChanged);
      (window as any).ethereum.on('chainChanged', handleChainChanged);

      return () => {
        (window as any).ethereum.removeListener('accountsChanged', handleAccountsChanged);
        (window as any).ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, []);

  return {
    web3,
    accounts,
    networkId,
    isConnected,
    isLoading,
    connectWallet,
    createContract,
    getBalance,
    callContractMethod,
    sendContractTransaction,
    switchNetwork,
  };
};
