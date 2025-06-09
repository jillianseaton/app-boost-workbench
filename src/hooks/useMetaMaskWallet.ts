
import { useState, useCallback, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

declare global {
  interface Window {
    ethereum?: any;
  }
}

export interface MetaMaskWallet {
  address: string;
  balance: string;
  chainId: string;
  isConnected: boolean;
}

export const useMetaMaskWallet = () => {
  const [wallet, setWallet] = useState<MetaMaskWallet | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const { toast } = useToast();

  const checkMetaMaskInstalled = () => {
    return typeof window.ethereum !== 'undefined';
  };

  const connectWallet = useCallback(async () => {
    if (!checkMetaMaskInstalled()) {
      toast({
        title: "MetaMask Not Found",
        description: "Please install MetaMask browser extension to continue.",
        variant: "destructive",
      });
      return;
    }

    setIsConnecting(true);
    try {
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      
      if (accounts.length > 0) {
        const address = accounts[0];
        const balance = await window.ethereum.request({
          method: 'eth_getBalance',
          params: [address, 'latest']
        });
        
        const chainId = await window.ethereum.request({
          method: 'eth_chainId'
        });

        const walletData = {
          address,
          balance: (parseInt(balance, 16) / Math.pow(10, 18)).toFixed(4),
          chainId,
          isConnected: true
        };

        setWallet(walletData);
        
        toast({
          title: "MetaMask Connected",
          description: `Connected to ${address.substring(0, 6)}...${address.substring(address.length - 4)}`,
        });
      }
    } catch (error: any) {
      console.error('MetaMask connection error:', error);
      toast({
        title: "Connection Failed",
        description: error.message || "Failed to connect to MetaMask",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  }, [toast]);

  const disconnectWallet = useCallback(() => {
    setWallet(null);
    toast({
      title: "Wallet Disconnected",
      description: "MetaMask wallet has been disconnected",
    });
  }, [toast]);

  const switchNetwork = useCallback(async (chainId: string) => {
    if (!wallet) return;

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId }],
      });
      
      setWallet(prev => prev ? { ...prev, chainId } : null);
      
      toast({
        title: "Network Switched",
        description: `Switched to chain ${chainId}`,
      });
    } catch (error: any) {
      toast({
        title: "Network Switch Failed",
        description: error.message || "Failed to switch network",
        variant: "destructive",
      });
    }
  }, [wallet, toast]);

  useEffect(() => {
    if (checkMetaMaskInstalled() && window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          setWallet(null);
        } else {
          connectWallet();
        }
      };

      const handleChainChanged = (chainId: string) => {
        setWallet(prev => prev ? { ...prev, chainId } : null);
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, [connectWallet]);

  return {
    wallet,
    isConnecting,
    connectWallet,
    disconnectWallet,
    switchNetwork,
    isMetaMaskInstalled: checkMetaMaskInstalled()
  };
};
