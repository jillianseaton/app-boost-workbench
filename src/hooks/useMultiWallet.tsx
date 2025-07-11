import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import Web3 from 'web3';

export interface ConnectedWallet {
  id: string;
  address: string;
  balance: string;
  network: string;
  networkId: number | null;
  web3Instance: Web3 | null;
  provider: string;
  connected: boolean;
}

export const useMultiWallet = () => {
  const [connectedWallets, setConnectedWallets] = useState<ConnectedWallet[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const generateWalletId = (address: string, network: string) => {
    return `${address}-${network}`;
  };

  const connectWallet = useCallback(async (
    provider: string,
    network: string,
    rpcUrl?: string,
    customAddress?: string
  ) => {
    setIsLoading(true);
    
    try {
      let address: string;
      let balance = '0.0000';
      let web3Instance: Web3 | null = null;
      let networkId: number | null = null;

      if (provider === 'custom' && customAddress) {
        // Custom address connection (read-only)
        address = customAddress;
        balance = '0.0000'; // Read-only, can't fetch balance without RPC
      } else if (provider === 'metamask' || provider === 'web3') {
        // Real Web3 connection
        if (typeof window !== 'undefined' && (window as any).ethereum) {
          web3Instance = new Web3((window as any).ethereum);
          
          // Request account access
          await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
          
          const accounts = await web3Instance.eth.getAccounts();
          if (accounts.length === 0) {
            throw new Error('No accounts available');
          }
          
          address = accounts[0];
          networkId = Number(await web3Instance.eth.getChainId());
          
          // Get balance
          const balanceWei = await web3Instance.eth.getBalance(address);
          balance = web3Instance.utils.fromWei(balanceWei, 'ether');
        } else {
          throw new Error('MetaMask or Web3 provider not available');
        }
      } else {
        // Mock connection for other providers
        address = `0x${Math.random().toString(16).substr(2, 40)}`;
        balance = (Math.random() * 10).toFixed(4);
        
        // Create a mock Web3 instance for RPC if provided
        if (rpcUrl) {
          web3Instance = new Web3(rpcUrl);
          try {
            networkId = Number(await web3Instance.eth.getChainId());
          } catch (error) {
            console.warn('Failed to get network ID from RPC:', error);
          }
        }
      }

      const walletId = generateWalletId(address, network);
      
      // Check if wallet is already connected
      const existingWallet = connectedWallets.find(w => w.id === walletId);
      if (existingWallet) {
        toast({
          title: "Already Connected",
          description: `This wallet is already connected to ${network}`,
          variant: "destructive",
        });
        return null;
      }

      const newWallet: ConnectedWallet = {
        id: walletId,
        address,
        balance,
        network,
        networkId,
        web3Instance,
        provider,
        connected: true,
      };

      setConnectedWallets(prev => [...prev, newWallet]);
      
      toast({
        title: "Wallet Connected",
        description: `Connected ${address.slice(0, 10)}... to ${network}`,
      });

      return newWallet;
    } catch (error) {
      console.error('Wallet connection failed:', error);
      toast({
        title: "Connection Failed",
        description: error instanceof Error ? error.message : "Failed to connect wallet",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [connectedWallets, toast]);

  const disconnectWallet = useCallback((walletId: string) => {
    setConnectedWallets(prev => prev.filter(wallet => wallet.id !== walletId));
    
    toast({
      title: "Wallet Disconnected",
      description: "Wallet has been disconnected",
    });
  }, [toast]);

  const getWalletByAddress = useCallback((address: string) => {
    return connectedWallets.find(wallet => wallet.address.toLowerCase() === address.toLowerCase());
  }, [connectedWallets]);

  const getWalletsByNetwork = useCallback((network: string) => {
    return connectedWallets.filter(wallet => wallet.network === network);
  }, [connectedWallets]);

  const updateWalletBalance = useCallback(async (walletId: string) => {
    const wallet = connectedWallets.find(w => w.id === walletId);
    if (!wallet || !wallet.web3Instance) return;

    try {
      const balanceWei = await wallet.web3Instance.eth.getBalance(wallet.address);
      const balance = wallet.web3Instance.utils.fromWei(balanceWei, 'ether');
      
      setConnectedWallets(prev => 
        prev.map(w => w.id === walletId ? { ...w, balance } : w)
      );
    } catch (error) {
      console.error('Failed to update balance:', error);
    }
  }, [connectedWallets]);

  const switchWalletNetwork = useCallback(async (walletId: string, newNetwork: string) => {
    const wallet = connectedWallets.find(w => w.id === walletId);
    if (!wallet || !wallet.web3Instance) return;

    try {
      // This would require implementing network switching logic
      // For now, we'll update the network name locally
      setConnectedWallets(prev => 
        prev.map(w => w.id === walletId ? { ...w, network: newNetwork } : w)
      );
      
      toast({
        title: "Network Updated",
        description: `Wallet network updated to ${newNetwork}`,
      });
    } catch (error) {
      console.error('Failed to switch network:', error);
      toast({
        title: "Network Switch Failed",
        description: "Failed to update wallet network",
        variant: "destructive",
      });
    }
  }, [connectedWallets, toast]);

  return {
    connectedWallets,
    isLoading,
    connectWallet,
    disconnectWallet,
    getWalletByAddress,
    getWalletsByNetwork,
    updateWalletBalance,
    switchWalletNetwork,
  };
};