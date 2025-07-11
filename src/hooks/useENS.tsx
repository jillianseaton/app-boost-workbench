import { useState, useEffect, useCallback } from 'react';
import { useWeb3 } from './useWeb3';

interface ENSData {
  name: string | null;
  avatar: string | null;
  isLoading: boolean;
}

export const useENS = () => {
  const { web3, networkId } = useWeb3();
  const [ensCache, setEnsCache] = useState<Map<string, ENSData>>(new Map());

  // Check if we're on Ethereum mainnet (ENS is only on mainnet)
  const isMainnet = networkId === 1;

  const resolveENS = useCallback(async (address: string): Promise<ENSData> => {
    if (!address || !web3 || !isMainnet) {
      return { name: null, avatar: null, isLoading: false };
    }

    // Check cache first
    const cached = ensCache.get(address.toLowerCase());
    if (cached && !cached.isLoading) {
      return cached;
    }

    // Set loading state
    const loadingData: ENSData = { name: null, avatar: null, isLoading: true };
    setEnsCache(prev => new Map(prev.set(address.toLowerCase(), loadingData)));

    try {
      // Get ENS name from address
      const ensName = await web3.eth.ens.getName(address);
      
      let avatar = null;
      if (ensName) {
        try {
          // Try to get avatar from ENS text record
          avatar = await web3.eth.ens.getText(ensName, 'avatar');
        } catch (error) {
          // Avatar resolution failed, but that's okay
          console.debug('Avatar resolution failed for', ensName);
        }
      }

      const result: ENSData = {
        name: ensName || null,
        avatar: avatar || null,
        isLoading: false,
      };

      setEnsCache(prev => new Map(prev.set(address.toLowerCase(), result)));
      return result;
    } catch (error) {
      // ENS resolution failed
      const result: ENSData = { name: null, avatar: null, isLoading: false };
      setEnsCache(prev => new Map(prev.set(address.toLowerCase(), result)));
      return result;
    }
  }, [web3, isMainnet, ensCache]);

  const getDisplayName = useCallback((address: string): string => {
    if (!address) return '';
    
    const cached = ensCache.get(address.toLowerCase());
    if (cached?.name) {
      return cached.name;
    }
    
    // Return shortened address as fallback
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }, [ensCache]);

  const resolveAddress = useCallback(async (ensName: string): Promise<string | null> => {
    if (!ensName || !web3 || !isMainnet) {
      return null;
    }

    try {
      const address = await web3.eth.ens.getAddress(ensName);
      return typeof address === 'string' ? address : null;
    } catch (error) {
      console.error('ENS address resolution failed:', error);
      return null;
    }
  }, [web3, isMainnet]);

  return {
    resolveENS,
    getDisplayName,
    resolveAddress,
    isMainnet,
    ensCache: ensCache,
  };
};