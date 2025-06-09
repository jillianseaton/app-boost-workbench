
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { ethers } from "npm:ethers@6";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TransferRequest {
  to: string;
  amount: string;
  tokenAddress?: string;
}

// ERC-20 ABI for transfer function
const ERC20_ABI = [
  "function transfer(address to, uint256 amount) returns (bool)",
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)"
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, amount, tokenAddress }: TransferRequest = await req.json();
    
    console.log('Processing transfer request:', { to, amount, tokenAddress });

    // Validate input
    if (!to || !amount) {
      throw new Error('Missing required parameters: to and amount');
    }

    if (!ethers.isAddress(to)) {
      throw new Error('Invalid recipient address');
    }

    // Get secrets
    const privateKey = Deno.env.get('HOT_WALLET_PRIVATE_KEY');
    const hotWalletAddress = Deno.env.get('HOT_WALLET_ADDRESS');
    const rpcUrl = Deno.env.get('INFURA_RPC_URL');

    if (!privateKey || !hotWalletAddress || !rpcUrl) {
      throw new Error('Missing required environment variables');
    }

    // Initialize provider and wallet
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const wallet = new ethers.Wallet(privateKey, provider);

    console.log('Wallet connected:', wallet.address);

    let txHash: string;

    if (tokenAddress) {
      // ERC-20 token transfer
      console.log('Performing ERC-20 token transfer');
      
      if (!ethers.isAddress(tokenAddress)) {
        throw new Error('Invalid token contract address');
      }

      const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, wallet);
      
      // Get token decimals
      const decimals = await tokenContract.decimals();
      console.log('Token decimals:', decimals);
      
      // Convert amount to proper decimal format
      const tokenAmount = ethers.parseUnits(amount, decimals);
      
      // Check token balance
      const balance = await tokenContract.balanceOf(wallet.address);
      console.log('Token balance:', ethers.formatUnits(balance, decimals));
      
      if (balance < tokenAmount) {
        throw new Error('Insufficient token balance');
      }

      // Execute token transfer
      const tx = await tokenContract.transfer(to, tokenAmount);
      txHash = tx.hash;
      
      console.log('ERC-20 transfer transaction sent:', txHash);

    } else {
      // ETH transfer
      console.log('Performing ETH transfer');
      
      const ethAmount = ethers.parseEther(amount);
      
      // Check ETH balance
      const balance = await wallet.provider.getBalance(wallet.address);
      console.log('ETH balance:', ethers.formatEther(balance));
      
      if (balance < ethAmount) {
        throw new Error('Insufficient ETH balance');
      }

      // Execute ETH transfer
      const tx = await wallet.sendTransaction({
        to: to,
        value: ethAmount
      });
      txHash = tx.hash;
      
      console.log('ETH transfer transaction sent:', txHash);
    }

    // Wait for transaction to be mined (optional)
    const receipt = await wallet.provider.waitForTransaction(txHash, 1);
    console.log('Transaction confirmed in block:', receipt?.blockNumber);

    return new Response(JSON.stringify({
      success: true,
      txHash,
      blockNumber: receipt?.blockNumber,
      explorerUrl: `https://etherscan.io/tx/${txHash}`,
      message: tokenAddress ? 'ERC-20 token transfer successful' : 'ETH transfer successful'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Transfer error:', error);
    
    return new Response(JSON.stringify({
      error: error.message,
      success: false
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
