
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { address, confirmations = 1 } = await req.json();
    
    if (!address) {
      throw new Error('Bitcoin address is required');
    }
    
    console.log('Checking for incoming BTC transactions:', { address, confirmations });
    
    // Get transaction history for the address
    const txResponse = await fetch(`https://blockstream.info/testnet/api/address/${address}/txs`);
    if (!txResponse.ok) {
      throw new Error('Failed to fetch transaction history');
    }
    
    const transactions = await txResponse.json();
    console.log(`Found ${transactions.length} transactions for address`);
    
    // Filter for incoming transactions (where this address is an output)
    const incomingTxs = transactions.filter((tx: any) => {
      return tx.vout.some((output: any) => 
        output.scriptpubkey_address === address && 
        tx.status.confirmed && 
        tx.status.block_height && 
        (tx.status.block_height + confirmations) <= (transactions[0]?.status?.block_height || 0)
      );
    });
    
    console.log(`Found ${incomingTxs.length} confirmed incoming transactions`);
    
    // Calculate total received amount
    let totalReceived = 0;
    const receivedTransactions = [];
    
    for (const tx of incomingTxs) {
      for (const output of tx.vout) {
        if (output.scriptpubkey_address === address) {
          totalReceived += output.value;
          receivedTransactions.push({
            txid: tx.txid,
            amount: output.value,
            amountBTC: output.value / 100000000,
            confirmations: tx.status.block_height ? 
              (transactions[0]?.status?.block_height || 0) - tx.status.block_height + 1 : 0,
            timestamp: new Date(tx.status.block_time * 1000),
            blockHeight: tx.status.block_height,
            confirmed: tx.status.confirmed
          });
        }
      }
    }
    
    // Get current balance
    const balanceResponse = await fetch(`https://blockstream.info/testnet/api/address/${address}`);
    const balanceData = await balanceResponse.json();
    
    const result = {
      address,
      totalReceived,
      totalReceivedBTC: totalReceived / 100000000,
      currentBalance: balanceData.chain_stats.funded_txo_sum,
      currentBalanceBTC: balanceData.chain_stats.funded_txo_sum / 100000000,
      transactionCount: receivedTransactions.length,
      transactions: receivedTransactions,
      lastUpdated: new Date().toISOString()
    };
    
    console.log('Receive BTC result:', result);
    
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in receive-btc function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      address: null,
      totalReceived: 0,
      transactions: []
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
