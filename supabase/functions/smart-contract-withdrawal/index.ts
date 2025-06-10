
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SmartContractWithdrawalRequest {
  userId: string;
  userAddress: string;
  amountUSD: number;
  amountETH: number;
  transactionId: string;
  gasEstimate: {
    gasPrice: string;
    gasLimit: string;
    totalCost: string;
  };
}

const WITHDRAWAL_CONTRACT_ADDRESS = Deno.env.get('WITHDRAWAL_CONTRACT_ADDRESS') || '';
const WITHDRAWAL_CONTRACT_ABI = [
  "function requestWithdrawal(address user, uint256 amount, string memory transactionId) external",
  "function executeWithdrawal(bytes32 withdrawalId) external",
  "function getContractBalance() external view returns (uint256)",
  "event WithdrawalRequested(bytes32 indexed withdrawalId, address indexed user, uint256 amount, string transactionId)",
  "event WithdrawalCompleted(bytes32 indexed withdrawalId, address indexed user, uint256 amount)"
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      userId,
      userAddress,
      amountUSD,
      amountETH,
      transactionId,
      gasEstimate
    }: SmartContractWithdrawalRequest = await req.json();
    
    console.log('Processing smart contract withdrawal:', {
      userId,
      userAddress,
      amountUSD,
      amountETH,
      transactionId
    });

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Validate withdrawal request
    const validation = await validateSmartContractWithdrawal(userId, amountUSD, userAddress);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    // Initialize Web3 provider and contract
    const { ethers } = await import("https://esm.sh/ethers@6.7.1");
    const provider = new ethers.JsonRpcProvider(Deno.env.get('ETHEREUM_RPC_URL'));
    const wallet = new ethers.Wallet(Deno.env.get('HOT_WALLET_PRIVATE_KEY') || '', provider);
    const contract = new ethers.Contract(WITHDRAWAL_CONTRACT_ADDRESS, WITHDRAWAL_CONTRACT_ABI, wallet);

    // Check contract balance
    const contractBalance = await contract.getContractBalance();
    const requiredAmount = ethers.parseEther(amountETH.toString());
    
    if (contractBalance < requiredAmount) {
      throw new Error('Insufficient contract balance for withdrawal');
    }

    // Create withdrawal request transaction
    const tx = await contract.requestWithdrawal(
      userAddress,
      requiredAmount,
      transactionId,
      {
        gasPrice: BigInt(gasEstimate.gasPrice),
        gasLimit: BigInt(gasEstimate.gasLimit)
      }
    );

    console.log('Withdrawal request transaction sent:', tx.hash);

    // Wait for transaction confirmation
    const receipt = await tx.wait();
    
    // Extract withdrawal ID from logs
    let withdrawalId = '';
    for (const log of receipt.logs) {
      try {
        const parsed = contract.interface.parseLog(log);
        if (parsed?.name === 'WithdrawalRequested') {
          withdrawalId = parsed.args.withdrawalId;
          break;
        }
      } catch (error) {
        // Skip unparseable logs
      }
    }

    if (!withdrawalId) {
      throw new Error('Failed to extract withdrawal ID from transaction');
    }

    // Store withdrawal request in database
    await supabase
      .from('smart_contract_withdrawals')
      .insert({
        withdrawal_id: withdrawalId,
        user_id: userId,
        transaction_id: transactionId,
        user_address: userAddress,
        amount_usd: amountUSD,
        amount_eth: amountETH,
        request_tx_hash: tx.hash,
        gas_used: receipt.gasUsed.toString(),
        gas_fee_eth: ethers.formatEther(receipt.gasUsed * receipt.gasPrice),
        status: 'pending_execution',
        created_at: new Date().toISOString()
      });

    // Schedule automatic execution after confirmation
    EdgeRuntime.waitUntil(scheduleWithdrawalExecution(withdrawalId, contract, transactionId));

    return new Response(JSON.stringify({
      success: true,
      withdrawalId,
      contractAddress: WITHDRAWAL_CONTRACT_ADDRESS,
      requestTxHash: tx.hash,
      gasUsed: receipt.gasUsed.toString(),
      actualGasFee: ethers.formatEther(receipt.gasUsed * receipt.gasPrice),
      estimatedExecution: '2-5 minutes'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Smart contract withdrawal error:', error);
    
    return new Response(JSON.stringify({
      error: error.message,
      success: false
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function validateSmartContractWithdrawal(userId: string, amountUSD: number, userAddress: string) {
  // Validate Ethereum address format
  if (!/^0x[a-fA-F0-9]{40}$/.test(userAddress)) {
    return { valid: false, error: 'Invalid Ethereum address format' };
  }

  // Check minimum withdrawal amount
  if (amountUSD < 10) {
    return { valid: false, error: 'Minimum withdrawal amount is $10' };
  }

  // Check maximum withdrawal amount
  if (amountUSD > 10000) {
    return { valid: false, error: 'Maximum withdrawal amount is $10,000' };
  }

  return { valid: true };
}

async function scheduleWithdrawalExecution(withdrawalId: string, contract: any, transactionId: string) {
  // Wait 2 minutes for request confirmation, then execute
  await new Promise(resolve => setTimeout(resolve, 120000));

  try {
    console.log('Executing withdrawal:', withdrawalId);
    
    const executeTx = await contract.executeWithdrawal(withdrawalId);
    const executeReceipt = await executeTx.wait();
    
    console.log('Withdrawal executed:', executeTx.hash);

    // Update database with execution details
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    await supabase
      .from('smart_contract_withdrawals')
      .update({
        status: 'executed',
        execution_tx_hash: executeTx.hash,
        execution_gas_used: executeReceipt.gasUsed.toString(),
        execution_gas_fee: ethers.formatEther(executeReceipt.gasUsed * executeReceipt.gasPrice),
        executed_at: new Date().toISOString()
      })
      .eq('withdrawal_id', withdrawalId);

  } catch (error) {
    console.error('Error executing withdrawal:', error);
    
    // Update status to failed
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    await supabase
      .from('smart_contract_withdrawals')
      .update({
        status: 'failed',
        error_message: error.message
      })
      .eq('withdrawal_id', withdrawalId);
  }
}
