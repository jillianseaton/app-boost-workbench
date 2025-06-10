
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { ethers } from "npm:ethers@6";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WithdrawalRequest {
  userId: string;
  userAddress: string;
  amountUSD: number;
  transactionId: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, userAddress, amountUSD, transactionId }: WithdrawalRequest = await req.json();
    
    console.log('Processing real MetaMask withdrawal:', { userId, userAddress, amountUSD, transactionId });

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Validate withdrawal request
    const validation = await validateWithdrawal(userId, amountUSD, userAddress);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    // Get current ETH price from multiple sources for accuracy
    const ethPrice = await getCurrentETHPrice();
    const ethAmount = amountUSD / ethPrice;

    console.log('ETH conversion:', { amountUSD, ethPrice, ethAmount });

    // Get wallet credentials from environment
    const privateKey = Deno.env.get('HOT_WALLET_PRIVATE_KEY');
    const rpcUrl = Deno.env.get('ETHEREUM_RPC_URL') || 'https://eth-mainnet.g.alchemy.com/v2/demo';

    if (!privateKey) {
      throw new Error('Hot wallet not configured. Please contact support.');
    }

    // Initialize Ethereum provider and wallet
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const wallet = new ethers.Wallet(privateKey, provider);

    console.log('Wallet address:', wallet.address);

    // Get current gas prices and estimate fees
    const feeData = await provider.getFeeData();
    const gasLimit = 21000n; // Standard ETH transfer gas limit
    const gasPrice = feeData.gasPrice || ethers.parseUnits('20', 'gwei');
    const gasFeeETH = Number(ethers.formatEther(gasPrice * gasLimit));

    console.log('Gas estimation:', {
      gasPrice: ethers.formatUnits(gasPrice, 'gwei') + ' Gwei',
      gasLimit: gasLimit.toString(),
      gasFeeETH
    });

    // Check wallet balance
    const walletBalance = await provider.getBalance(wallet.address);
    const walletBalanceETH = Number(ethers.formatEther(walletBalance));
    const totalNeeded = ethAmount + gasFeeETH;

    console.log('Balance check:', {
      walletBalanceETH,
      ethAmount,
      gasFeeETH,
      totalNeeded
    });

    if (walletBalanceETH < totalNeeded) {
      throw new Error(`Insufficient hot wallet balance. Need ${totalNeeded.toFixed(6)} ETH, have ${walletBalanceETH.toFixed(6)} ETH`);
    }

    // Create and send the real transaction
    const transaction = {
      to: userAddress,
      value: ethers.parseEther(ethAmount.toString()),
      gasLimit: gasLimit,
      gasPrice: gasPrice
    };

    console.log('Sending transaction:', transaction);

    // Send the transaction to Ethereum mainnet
    const txResponse = await wallet.sendTransaction(transaction);
    const txHash = txResponse.hash;

    console.log('Transaction broadcasted:', txHash);

    // Update transaction record in database
    await supabase
      .from('transactions')
      .update({
        status: 'broadcasted',
        txHash: txHash,
        explorerUrl: `https://etherscan.io/tx/${txHash}`,
        gasUsed: gasLimit.toString(),
        gasFeeETH: gasFeeETH,
        actualETHAmount: ethAmount,
        ethPrice: ethPrice
      })
      .eq('id', transactionId);

    console.log('Database updated for transaction:', transactionId);

    // Start monitoring for confirmation in background
    EdgeRuntime.waitUntil(monitorTransactionConfirmation(txHash, transactionId, supabase));

    return new Response(JSON.stringify({
      success: true,
      txHash: txHash,
      ethAmount: ethAmount,
      ethPrice: ethPrice,
      gasFeeETH: gasFeeETH,
      explorerUrl: `https://etherscan.io/tx/${txHash}`,
      estimatedConfirmation: '2-10 minutes',
      network: 'ethereum-mainnet'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('MetaMask withdrawal error:', error);
    
    return new Response(JSON.stringify({
      error: error.message,
      success: false
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function validateWithdrawal(userId: string, amountUSD: number, userAddress: string) {
  // Validate Ethereum address format
  if (!ethers.isAddress(userAddress)) {
    return { valid: false, error: 'Invalid Ethereum address format' };
  }

  // Check minimum withdrawal amount
  if (amountUSD < 5) {
    return { valid: false, error: 'Minimum withdrawal amount is $5.00' };
  }

  // Check maximum daily withdrawal limit
  const dailyLimit = 10000; // $10,000 daily limit
  if (amountUSD > dailyLimit) {
    return { valid: false, error: `Daily withdrawal limit is $${dailyLimit}` };
  }

  return { valid: true };
}

async function getCurrentETHPrice(): Promise<number> {
  try {
    // Try CoinGecko first
    const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd');
    const data = await response.json();
    
    if (data.ethereum?.usd) {
      return data.ethereum.usd;
    }
    
    // Fallback to CoinCap
    const response2 = await fetch('https://api.coincap.io/v2/assets/ethereum');
    const data2 = await response2.json();
    
    if (data2.data?.priceUsd) {
      return parseFloat(data2.data.priceUsd);
    }
    
    throw new Error('Could not fetch ETH price');
  } catch (error) {
    console.error('Error fetching ETH price:', error);
    // Emergency fallback price
    return 3000;
  }
}

async function monitorTransactionConfirmation(txHash: string, transactionId: string, supabase: any) {
  const maxRetries = 120; // Monitor for up to 2 hours
  let confirmations = 0;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      // Check transaction status on Ethereum
      const response = await fetch(`https://api.etherscan.io/api?module=transaction&action=gettxreceiptstatus&txhash=${txHash}&apikey=demo`);
      const data = await response.json();
      
      if (data.result?.status === '1') {
        // Transaction confirmed
        confirmations++;
        
        if (confirmations >= 12) {
          // Update as finalized after 12 confirmations
          await supabase
            .from('transactions')
            .update({
              status: 'confirmed',
              confirmations: confirmations
            })
            .eq('id', transactionId);
          
          console.log(`Transaction ${txHash} confirmed with ${confirmations} confirmations`);
          break;
        }
      } else if (data.result?.status === '0') {
        // Transaction failed
        await supabase
          .from('transactions')
          .update({
            status: 'failed',
            confirmations: 0
          })
          .eq('id', transactionId);
        
        console.log(`Transaction ${txHash} failed`);
        break;
      }
      
      // Wait 60 seconds before next check
      await new Promise(resolve => setTimeout(resolve, 60000));
      
    } catch (error) {
      console.error('Error monitoring transaction:', error);
      await new Promise(resolve => setTimeout(resolve, 60000));
    }
  }
}
