
import { supabase } from '@/integrations/supabase/client';

export interface ETHTransferRequest {
  action: 'send_eth' | 'get_balance' | 'get_price' | 'estimate_gas' | 'validate_address';
  toAddress?: string;
  amount?: string;
  fromAddress?: string;
}

export interface ETHTransferResponse {
  success: boolean;
  data?: any;
  error?: string;
  timestamp: string;
}

export interface ETHPrice {
  price: number;
  change24h: number;
  lastUpdated: string;
  source: string;
}

export interface ETHBalance {
  address: string;
  balanceWei: number;
  balanceETH: number;
  network: string;
}

export interface GasEstimate {
  gasPrice: number;
  gasLimit: number;
  gasCostWei: number;
  gasCostETH: number;
  gasCostUSD: number;
  estimatedTime: string;
}

class ETHService {
  private async callETHHandler(request: ETHTransferRequest): Promise<ETHTransferResponse> {
    try {
      const { data, error } = await supabase.functions.invoke('eth-transfer-handler', {
        body: request,
      });

      if (error) {
        throw new Error(error.message || 'ETH handler request failed');
      }

      return data;
    } catch (error) {
      console.error('ETH Service Error:', error);
      throw error;
    }
  }

  async sendETH(toAddress: string, amount: string) {
    console.log('Sending ETH:', { toAddress, amount });
    
    const response = await this.callETHHandler({
      action: 'send_eth',
      toAddress,
      amount,
    });

    if (!response.success) {
      throw new Error(response.error || 'ETH transfer failed');
    }

    return response.data;
  }

  async getBalance(address: string): Promise<ETHBalance> {
    console.log('Getting ETH balance for:', address);
    
    const response = await this.callETHHandler({
      action: 'get_balance',
      fromAddress: address,
    });

    if (!response.success) {
      throw new Error(response.error || 'Failed to get ETH balance');
    }

    return response.data;
  }

  async getPrice(): Promise<ETHPrice> {
    console.log('Getting ETH price...');
    
    const response = await this.callETHHandler({
      action: 'get_price',
    });

    if (!response.success) {
      throw new Error(response.error || 'Failed to get ETH price');
    }

    return response.data;
  }

  async estimateGas(toAddress: string, amount: string): Promise<GasEstimate> {
    console.log('Estimating gas for ETH transfer:', { toAddress, amount });
    
    const response = await this.callETHHandler({
      action: 'estimate_gas',
      toAddress,
      amount,
    });

    if (!response.success) {
      throw new Error(response.error || 'Failed to estimate gas');
    }

    return response.data;
  }

  async validateAddress(address: string): Promise<{ address: string; isValid: boolean; format: string }> {
    console.log('Validating ETH address:', address);
    
    const response = await this.callETHHandler({
      action: 'validate_address',
      toAddress: address,
    });

    if (!response.success) {
      throw new Error(response.error || 'Failed to validate address');
    }

    return response.data;
  }

  // Real-time price subscription (polls every 30 seconds)
  subscribeToPrice(callback: (price: ETHPrice) => void, intervalMs = 30000): () => void {
    const fetchPrice = async () => {
      try {
        const price = await this.getPrice();
        callback(price);
      } catch (error) {
        console.error('Error fetching ETH price:', error);
      }
    };

    // Fetch immediately
    fetchPrice();

    // Set up interval
    const interval = setInterval(fetchPrice, intervalMs);

    // Return cleanup function
    return () => clearInterval(interval);
  }
}

export const ethService = new ETHService();
