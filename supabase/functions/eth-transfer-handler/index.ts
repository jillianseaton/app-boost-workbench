
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ETHTransferRequest {
  action: 'send_eth' | 'get_balance' | 'get_price' | 'estimate_gas' | 'validate_address';
  toAddress?: string;
  amount?: string;
  fromAddress?: string;
  gasPrice?: string;
  gasLimit?: string;
}

interface ETHPriceData {
  ethereum: {
    usd: number;
    usd_24h_change: number;
    last_updated_at: number;
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: ETHTransferRequest = await req.json();
    const { action } = body;
    
    console.log('ETH Transfer Handler - Action:', action, 'Body:', body);
    
    let result = {};
    
    switch (action) {
      case 'send_eth':
        result = await sendETH(body);
        break;
      case 'get_balance':
        result = await getETHBalance(body.fromAddress!);
        break;
      case 'get_price':
        result = await getETHPrice();
        break;
      case 'estimate_gas':
        result = await estimateGas(body);
        break;
      case 'validate_address':
        result = await validateAddress(body.toAddress!);
        break;
      default:
        throw new Error(`Unknown action: ${action}`);
    }
    
    return new Response(JSON.stringify({
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('ETH Transfer Handler Error:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function sendETH(data: ETHTransferRequest) {
  const { toAddress, amount } = data;
  
  if (!toAddress || !amount) {
    throw new Error('Missing required parameters: toAddress and amount');
  }
  
  // Validate addresses
  if (!isValidEthereumAddress(toAddress)) {
    throw new Error('Invalid recipient address');
  }
  
  // Get environment variables
  const privateKey = Deno.env.get('ETHEREUM_PRIVATE_KEY');
  const infuraProjectId = Deno.env.get('INFURA_PROJECT_ID');
  
  if (!privateKey || !infuraProjectId) {
    throw new Error('Missing required environment variables');
  }
  
  // Hot wallet security controls
  const maxTransferAmount = 0.1; // Maximum 0.1 ETH per transfer
  const amountInETH = parseFloat(amount);
  
  if (amountInETH > maxTransferAmount) {
    throw new Error(`Transfer amount exceeds maximum allowed: ${maxTransferAmount} ETH`);
  }
  
  const rpcUrl = `https://mainnet.infura.io/v3/${infuraProjectId}`;
  
  // Get current gas price
  const gasPrice = await getCurrentGasPrice(rpcUrl);
  
  // Get nonce for the hot wallet
  const hotWalletAddress = await getAddressFromPrivateKey(privateKey);
  const nonce = await getNonce(rpcUrl, hotWalletAddress);
  
  // Estimate gas limit
  const gasLimit = 21000; // Standard ETH transfer
  
  // Create transaction
  const transaction = {
    nonce: `0x${nonce.toString(16)}`,
    gasPrice: `0x${gasPrice.toString(16)}`,
    gasLimit: `0x${gasLimit.toString(16)}`,
    to: toAddress,
    value: `0x${Math.floor(amountInETH * 1e18).toString(16)}`, // Convert to Wei
    data: '0x',
  };
  
  console.log('Creating ETH transaction:', transaction);
  
  // Sign and send transaction
  const signedTx = await signTransaction(transaction, privateKey);
  const txHash = await broadcastTransaction(rpcUrl, signedTx);
  
  return {
    transactionHash: txHash,
    fromAddress: hotWalletAddress,
    toAddress,
    amount: amountInETH,
    gasPrice,
    gasLimit,
    status: 'pending',
    explorerUrl: `https://etherscan.io/tx/${txHash}`,
    estimatedConfirmation: '2-5 minutes',
  };
}

async function getETHBalance(address: string) {
  if (!isValidEthereumAddress(address)) {
    throw new Error('Invalid Ethereum address');
  }
  
  const infuraProjectId = Deno.env.get('INFURA_PROJECT_ID');
  if (!infuraProjectId) {
    throw new Error('Missing Infura project ID');
  }
  
  const rpcUrl = `https://mainnet.infura.io/v3/${infuraProjectId}`;
  
  const response = await fetch(rpcUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      method: 'eth_getBalance',
      params: [address, 'latest'],
      id: 1,
    }),
  });
  
  const data = await response.json();
  
  if (data.error) {
    throw new Error(`RPC Error: ${data.error.message}`);
  }
  
  const balanceWei = parseInt(data.result, 16);
  const balanceETH = balanceWei / 1e18;
  
  return {
    address,
    balanceWei,
    balanceETH,
    network: 'mainnet',
  };
}

async function getETHPrice() {
  const apiKey = Deno.env.get('COINGECKO_API_KEY');
  
  const url = apiKey 
    ? `https://pro-api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd&include_24hr_change=true&include_last_updated_at=true&x_cg_pro_api_key=${apiKey}`
    : 'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd&include_24hr_change=true&include_last_updated_at=true';
  
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch ETH price: ${response.statusText}`);
  }
  
  const data: ETHPriceData = await response.json();
  
  return {
    price: data.ethereum.usd,
    change24h: data.ethereum.usd_24h_change,
    lastUpdated: new Date(data.ethereum.last_updated_at * 1000).toISOString(),
    source: 'CoinGecko',
  };
}

async function estimateGas(data: ETHTransferRequest) {
  const { toAddress, amount } = data;
  
  if (!toAddress || !amount) {
    throw new Error('Missing required parameters for gas estimation');
  }
  
  const infuraProjectId = Deno.env.get('INFURA_PROJECT_ID');
  if (!infuraProjectId) {
    throw new Error('Missing Infura project ID');
  }
  
  const rpcUrl = `https://mainnet.infura.io/v3/${infuraProjectId}`;
  const gasPrice = await getCurrentGasPrice(rpcUrl);
  const gasLimit = 21000; // Standard ETH transfer
  
  const gasCostWei = gasPrice * gasLimit;
  const gasCostETH = gasCostWei / 1e18;
  
  // Get current ETH price for USD estimation
  const priceData = await getETHPrice();
  const gasCostUSD = gasCostETH * priceData.price;
  
  return {
    gasPrice,
    gasLimit,
    gasCostWei,
    gasCostETH,
    gasCostUSD,
    estimatedTime: '2-5 minutes',
  };
}

async function validateAddress(address: string) {
  const isValid = isValidEthereumAddress(address);
  
  return {
    address,
    isValid,
    format: isValid ? 'valid_ethereum_address' : 'invalid',
  };
}

// Utility functions
function isValidEthereumAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

async function getCurrentGasPrice(rpcUrl: string): Promise<number> {
  const response = await fetch(rpcUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      method: 'eth_gasPrice',
      params: [],
      id: 1,
    }),
  });
  
  const data = await response.json();
  
  if (data.error) {
    throw new Error(`Failed to get gas price: ${data.error.message}`);
  }
  
  return parseInt(data.result, 16);
}

async function getNonce(rpcUrl: string, address: string): Promise<number> {
  const response = await fetch(rpcUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      method: 'eth_getTransactionCount',
      params: [address, 'pending'],
      id: 1,
    }),
  });
  
  const data = await response.json();
  
  if (data.error) {
    throw new Error(`Failed to get nonce: ${data.error.message}`);
  }
  
  return parseInt(data.result, 16);
}

async function getAddressFromPrivateKey(privateKey: string): Promise<string> {
  // This is a simplified implementation
  // In production, use a proper Ethereum library like ethers.js
  // For now, return the hot wallet address from environment
  const hotWalletAddress = Deno.env.get('HOT_WALLET_ADDRESS');
  
  if (!hotWalletAddress) {
    throw new Error('Hot wallet address not configured');
  }
  
  return hotWalletAddress;
}

async function signTransaction(transaction: any, privateKey: string): Promise<string> {
  // This is a placeholder for transaction signing
  // In production, implement proper transaction signing with secp256k1
  console.log('Signing transaction with private key (masked):', { ...transaction });
  
  // Return a mock signed transaction for development
  return `0x${Math.random().toString(16).substring(2, 66)}`;
}

async function broadcastTransaction(rpcUrl: string, signedTx: string): Promise<string> {
  const response = await fetch(rpcUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      method: 'eth_sendRawTransaction',
      params: [signedTx],
      id: 1,
    }),
  });
  
  const data = await response.json();
  
  if (data.error) {
    throw new Error(`Failed to broadcast transaction: ${data.error.message}`);
  }
  
  return data.result;
}
