
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
    options: { from: string; value?: string; gas?: number } = { from: '' }
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

    return contract.events[eventName](options, callback);
  }

  // Switch network
  async switchNetwork(networkId: string): Promise<void> {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      try {
        await (window as any).ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: this.web3?.utils.toHex(networkId) }],
        });
        this.currentNetwork = networkId;
      } catch (error) {
        console.error('Failed to switch network:', error);
        throw error;
      }
    }
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
