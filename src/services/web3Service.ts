
import Web3 from 'web3';
import { Contract } from 'web3-eth-contract';
import { AbiItem } from 'web3-utils';

export interface ContractConfig {
  address: string;
  abi: AbiItem[];
  network?: string;
}

export interface Web3Config {
  rpcUrl?: string;
  networkId?: number;
  gasPrice?: string;
  gasLimit?: number;
}

class Web3Service {
  private web3: Web3 | null = null;
  private contracts: Map<string, Contract<any>> = new Map();
  private currentNetwork: string = 'mainnet';
  
  // Network configurations
  private networkConfigs = {
    ethereum: { chainId: '0x1', rpcUrl: 'https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161' },
    polygon: { chainId: '0x89', rpcUrl: 'https://polygon-rpc.com' },
    binance: { chainId: '0x38', rpcUrl: 'https://bsc-dataseed1.binance.org' },
    avalanche: { chainId: '0xa86a', rpcUrl: 'https://api.avax.network/ext/bc/C/rpc' },
    arbitrum: { chainId: '0xa4b1', rpcUrl: 'https://arb1.arbitrum.io/rpc' },
    optimism: { chainId: '0xa', rpcUrl: 'https://mainnet.optimism.io' },
  };

  // Initialize Web3 instance
  async initializeWeb3(config?: Web3Config): Promise<Web3> {
    try {
      // Try to use provider from wallet (MetaMask, etc.)
      if (typeof window !== 'undefined' && (window as any).ethereum) {
        this.web3 = new Web3((window as any).ethereum);
        console.log('Using wallet provider');
      }
      // Fall back to given provider or custom RPC
      else if (Web3.givenProvider) {
        this.web3 = new Web3(Web3.givenProvider);
        console.log('Using Web3.givenProvider');
      }
      // Use custom RPC or default to localhost
      else {
        const rpcUrl = config?.rpcUrl || "http://localhost:8545";
        this.web3 = new Web3(rpcUrl);
        console.log('Using custom RPC:', rpcUrl);
      }

      // Request account access if using wallet
      if (typeof window !== 'undefined' && (window as any).ethereum) {
        await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
      }

      return this.web3;
    } catch (error) {
      console.error('Failed to initialize Web3:', error);
      throw new Error('Failed to connect to blockchain network');
    }
  }

  // Get Web3 instance
  getWeb3(): Web3 {
    if (!this.web3) {
      throw new Error('Web3 not initialized. Call initializeWeb3() first.');
    }
    return this.web3;
  }

  // Create contract instance
  createContract(contractConfig: ContractConfig): Contract<any> {
    if (!this.web3) {
      throw new Error('Web3 not initialized');
    }

    const { address, abi } = contractConfig;
    const contract = new this.web3.eth.Contract(abi, address);
    
    // Store contract for reuse
    const contractKey = `${address}_${this.currentNetwork}`;
    this.contracts.set(contractKey, contract);
    
    console.log('Contract instance created:', { address, network: this.currentNetwork });
    return contract;
  }

  // Get existing contract instance
  getContract(address: string): Contract<any> | null {
    const contractKey = `${address}_${this.currentNetwork}`;
    return this.contracts.get(contractKey) || null;
  }

  // Get user accounts
  async getAccounts(): Promise<string[]> {
    if (!this.web3) {
      throw new Error('Web3 not initialized');
    }
    return await this.web3.eth.getAccounts();
  }

  // Get network ID
  async getNetworkId(): Promise<number> {
    if (!this.web3) {
      throw new Error('Web3 not initialized');
    }
    const networkId = await this.web3.eth.net.getId();
    return Number(networkId);
  }

  // Get balance
  async getBalance(address: string): Promise<string> {
    if (!this.web3) {
      throw new Error('Web3 not initialized');
    }
    const balance = await this.web3.eth.getBalance(address);
    return this.web3.utils.fromWei(balance, 'ether');
  }

  // Call contract method (read-only)
  async callContractMethod(
    contractAddress: string, 
    methodName: string, 
    params: any[] = []
  ): Promise<any> {
    const contract = this.getContract(contractAddress);
    if (!contract) {
      throw new Error('Contract not found. Create contract instance first.');
    }

    return await contract.methods[methodName](...params).call();
  }

  // Send contract transaction
  async sendContractTransaction(
    contractAddress: string,
    methodName: string,
    params: any[] = [],
    options: { from: string; value?: string; gas?: string } = { from: '' }
  ): Promise<any> {
    const contract = this.getContract(contractAddress);
    if (!contract) {
      throw new Error('Contract not found. Create contract instance first.');
    }

    if (!options.from) {
      const accounts = await this.getAccounts();
      if (accounts.length === 0) {
        throw new Error('No accounts available');
      }
      options.from = accounts[0];
    }

    return await contract.methods[methodName](...params).send(options);
  }

  // Listen to contract events
  subscribeToEvent(
    contractAddress: string,
    eventName: string,
    callback: (event: any) => void,
    options: any = {}
  ) {
    const contract = this.getContract(contractAddress);
    if (!contract) {
      throw new Error('Contract not found. Create contract instance first.');
    }

    const eventEmitter = contract.events[eventName](options);
    eventEmitter.on('data', callback);
    eventEmitter.on('error', console.error);
    
    return eventEmitter;
  }

  // Switch network
  async switchNetwork(networkName: string): Promise<void> {
    const networkConfig = this.networkConfigs[networkName as keyof typeof this.networkConfigs];
    if (!networkConfig) {
      throw new Error(`Unsupported network: ${networkName}`);
    }

    if (typeof window !== 'undefined' && (window as any).ethereum) {
      try {
        await (window as any).ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: networkConfig.chainId }],
        });
        this.currentNetwork = networkName;
      } catch (switchError: any) {
        // This error code indicates that the chain has not been added to MetaMask.
        if (switchError.code === 4902) {
          try {
            await this.addNetwork(networkName);
          } catch (addError) {
            console.error('Failed to add network:', addError);
            throw addError;
          }
        } else {
          console.error('Failed to switch network:', switchError);
          throw switchError;
        }
      }
    }
  }

  // Add network to wallet
  async addNetwork(networkName: string): Promise<void> {
    const networkConfig = this.networkConfigs[networkName as keyof typeof this.networkConfigs];
    if (!networkConfig) {
      throw new Error(`Unsupported network: ${networkName}`);
    }

    const networkParams = {
      chainId: networkConfig.chainId,
      chainName: this.getNetworkDisplayName(networkName),
      rpcUrls: [networkConfig.rpcUrl],
      nativeCurrency: this.getNativeCurrency(networkName),
      blockExplorerUrls: [this.getBlockExplorer(networkName)],
    };

    if (typeof window !== 'undefined' && (window as any).ethereum) {
      await (window as any).ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [networkParams],
      });
      this.currentNetwork = networkName;
    }
  }

  // Helper methods for network configuration
  private getNetworkDisplayName(networkName: string): string {
    const names = {
      ethereum: 'Ethereum Mainnet',
      polygon: 'Polygon Mainnet',
      binance: 'Binance Smart Chain',
      avalanche: 'Avalanche Network',
      arbitrum: 'Arbitrum One',
      optimism: 'Optimism',
    };
    return names[networkName as keyof typeof names] || networkName;
  }

  private getNativeCurrency(networkName: string) {
    const currencies = {
      ethereum: { name: 'Ethereum', symbol: 'ETH', decimals: 18 },
      polygon: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
      binance: { name: 'Binance Coin', symbol: 'BNB', decimals: 18 },
      avalanche: { name: 'Avalanche', symbol: 'AVAX', decimals: 18 },
      arbitrum: { name: 'Ethereum', symbol: 'ETH', decimals: 18 },
      optimism: { name: 'Ethereum', symbol: 'ETH', decimals: 18 },
    };
    return currencies[networkName as keyof typeof currencies] || { name: 'ETH', symbol: 'ETH', decimals: 18 };
  }

  private getBlockExplorer(networkName: string): string {
    const explorers = {
      ethereum: 'https://etherscan.io',
      polygon: 'https://polygonscan.com',
      binance: 'https://bscscan.com',
      avalanche: 'https://snowtrace.io',
      arbitrum: 'https://arbiscan.io',
      optimism: 'https://optimistic.etherscan.io',
    };
    return explorers[networkName as keyof typeof explorers] || 'https://etherscan.io';
  }

  // Check if wallet is connected
  async isWalletConnected(): Promise<boolean> {
    try {
      const accounts = await this.getAccounts();
      return accounts.length > 0;
    } catch {
      return false;
    }
  }
}

// Export singleton instance
export const web3Service = new Web3Service();
