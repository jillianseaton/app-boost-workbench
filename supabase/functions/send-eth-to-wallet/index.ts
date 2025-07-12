import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Platform wallet private key (stored in Supabase secrets)
const platformPrivateKey = Deno.env.get('ETH_PRIVATE_KEY');
const infuraProjectId = Deno.env.get('INFURA_PROJECT_ID');

interface TransferRequest {
  toAddress: string;
  amountEth: string;
  userId: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!platformPrivateKey || !infuraProjectId) {
      console.error('Missing required environment variables');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { toAddress, amountEth, userId }: TransferRequest = await req.json();

    // Validate request
    if (!toAddress || !amountEth || !userId || userId !== user.id) {
      return new Response(
        JSON.stringify({ error: 'Invalid request parameters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate Ethereum address format
    if (!/^0x[a-fA-F0-9]{40}$/.test(toAddress)) {
      return new Response(
        JSON.stringify({ error: 'Invalid Ethereum address' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Convert amount to Wei
    const amountWei = (parseFloat(amountEth) * 1e18).toString();
    
    if (parseFloat(amountEth) <= 0) {
      return new Response(
        JSON.stringify({ error: 'Amount must be greater than 0' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing ETH transfer: ${amountEth} ETH to ${toAddress} for user ${userId}`);

    // Prepare transaction using Web3
    const Web3 = (await import('https://esm.sh/web3@4.16.0')).default;
    const web3 = new Web3(`https://mainnet.infura.io/v3/${infuraProjectId}`);
    
    // Create account from private key
    const account = web3.eth.accounts.privateKeyToAccount(platformPrivateKey);
    web3.eth.accounts.wallet.add(account);

    // Get current gas price and nonce
    const [gasPrice, nonce, balance] = await Promise.all([
      web3.eth.getGasPrice(),
      web3.eth.getTransactionCount(account.address),
      web3.eth.getBalance(account.address)
    ]);

    console.log(`Platform wallet balance: ${web3.utils.fromWei(balance, 'ether')} ETH`);

    // Check if platform wallet has sufficient balance
    const totalCost = BigInt(amountWei) + (BigInt(gasPrice) * BigInt(21000)); // 21000 is standard gas limit for ETH transfer
    if (BigInt(balance) < totalCost) {
      return new Response(
        JSON.stringify({ 
          error: 'Insufficient platform wallet balance',
          details: {
            required: web3.utils.fromWei(totalCost.toString(), 'ether'),
            available: web3.utils.fromWei(balance, 'ether')
          }
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create transaction
    const transaction = {
      from: account.address,
      to: toAddress,
      value: amountWei,
      gas: 21000,
      gasPrice: gasPrice,
      nonce: nonce,
    };

    console.log('Sending transaction:', transaction);

    // Sign and send transaction
    const signedTx = await web3.eth.accounts.signTransaction(transaction, platformPrivateKey);
    const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction!);

    console.log('Transaction successful:', receipt.transactionHash);

    // Record the transaction in the database
    const { error: dbError } = await supabase
      .from('bitcoin_transactions') // Reusing this table for ETH transactions
      .insert({
        user_id: userId,
        transaction_id: receipt.transactionHash,
        address: toAddress,
        amount_satoshis: Math.round(parseFloat(amountEth) * 1e8), // Store as satoshi equivalent
        amount_btc: parseFloat(amountEth), // Store ETH amount in BTC field
        status: 'confirmed',
        confirmations: 1,
        block_height: Number(receipt.blockNumber),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (dbError) {
      console.error('Error saving transaction to database:', dbError);
      // Don't fail the request since the transaction was successful
    }

    return new Response(
      JSON.stringify({
        success: true,
        transactionHash: receipt.transactionHash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed,
        amountSent: amountEth,
        toAddress: toAddress
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in send-eth-to-wallet function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Transfer failed', 
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});