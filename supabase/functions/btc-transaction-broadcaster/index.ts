
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
    const { action, transactionData } = await req.json();
    
    console.log('Bitcoin transaction handler:', { action });
    
    let result = {};
    
    switch (action) {
      case 'create_and_broadcast':
        result = await createAndBroadcastTransaction(transactionData);
        break;
      case 'broadcast_raw':
        result = await broadcastRawTransaction(transactionData);
        break;
      case 'estimate_fees':
        result = await estimateTransactionFees(transactionData);
        break;
      case 'get_utxos':
        result = await getAddressUTXOs(transactionData);
        break;
      case 'check_transaction':
        result = await checkTransactionStatus(transactionData);
        break;
      case 'get_address_info':
        result = await getAddressInformation(transactionData);
        break;
      case 'get_block_info':
        result = await getBlockInformation(transactionData);
        break;
      case 'get_mempool_stats':
        result = await getMempoolStats(transactionData);
        break;
      default:
        throw new Error(`Unknown action: ${action}`);
    }
    
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('Bitcoin transaction error:', error);
    
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false,
      timestamp: new Date().toISOString()
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function createAndBroadcastTransaction(data: any) {
  const { 
    privateKeyWIF, 
    recipientAddress, 
    amountSats, 
    network = 'mainnet',
    feeRate = 'medium'
  } = data;
  
  console.log('Creating and broadcasting BTC transaction:', { 
    recipientAddress, 
    amountSats, 
    network 
  });
  
  // Import bitcoinjs-lib
  const bitcoin = await import('https://cdn.skypack.dev/bitcoinjs-lib@6.1.5');
  
  // Set network
  const btcNetwork = network === 'mainnet' ? bitcoin.networks.bitcoin : bitcoin.networks.testnet;
  
  // Create keypair from private key
  const keyPair = bitcoin.ECPair.fromWIF(privateKeyWIF, btcNetwork);
  const { address: senderAddress } = bitcoin.payments.p2pkh({ 
    pubkey: keyPair.publicKey, 
    network: btcNetwork 
  });
  
  // Get UTXOs for the sender address using mempool.space
  const utxos = await fetchUTXOsFromMempool(senderAddress, network);
  
  if (utxos.length === 0) {
    throw new Error('No UTXOs available for this address');
  }
  
  // Calculate total available balance
  const totalBalance = utxos.reduce((sum: number, utxo: any) => sum + utxo.value, 0);
  
  // Get current fee rates from mempool.space
  const feeRates = await getMempoolFeeRates(network);
  const satPerByte = feeRates[feeRate] || feeRates.medium;
  
  // Estimate transaction size (inputs * 148 + outputs * 34 + 10)
  const estimatedSize = (utxos.length * 148) + (2 * 34) + 10;
  const estimatedFee = estimatedSize * satPerByte;
  
  if (totalBalance < amountSats + estimatedFee) {
    throw new Error(`Insufficient balance. Available: ${totalBalance} sats, Required: ${amountSats + estimatedFee} sats`);
  }
  
  // Create transaction
  const psbt = new bitcoin.Psbt({ network: btcNetwork });
  
  let inputValue = 0;
  
  // Add inputs
  for (const utxo of utxos) {
    const txResponse = await fetchTransactionHexFromMempool(utxo.txid, network);
    
    psbt.addInput({
      hash: utxo.txid,
      index: utxo.vout,
      nonWitnessUtxo: Buffer.from(txResponse.hex, 'hex'),
    });
    
    inputValue += utxo.value;
    
    if (inputValue >= amountSats + estimatedFee) {
      break;
    }
  }
  
  // Add recipient output
  psbt.addOutput({
    address: recipientAddress,
    value: amountSats,
  });
  
  // Add change output if needed
  const change = inputValue - amountSats - estimatedFee;
  if (change > 546) { // Dust threshold
    psbt.addOutput({
      address: senderAddress,
      value: change,
    });
  }
  
  // Sign all inputs
  for (let i = 0; i < psbt.inputCount; i++) {
    psbt.signInput(i, keyPair);
  }
  
  psbt.finalizeAllInputs();
  
  // Get transaction hex
  const txHex = psbt.extractTransaction().toHex();
  const txid = psbt.extractTransaction().getId();
  
  console.log('Transaction created:', { txid, txHex });
  
  // Broadcast transaction using mempool.space first, then fallback
  const broadcastResult = await broadcastToMempool(txHex, network);
  
  return {
    success: true,
    txid,
    txHex,
    amountSats,
    recipientAddress,
    senderAddress,
    fee: estimatedFee,
    change,
    network,
    broadcastResults: broadcastResult,
    explorerUrl: generateMempoolExplorerUrl(txid, network),
    timestamp: new Date().toISOString()
  };
}

async function broadcastRawTransaction(data: any) {
  const { txHex, network = 'mainnet' } = data;
  
  console.log('Broadcasting raw transaction via mempool.space:', { network });
  
  const broadcastResult = await broadcastToMempool(txHex, network);
  
  // Extract txid from hex
  const bitcoin = await import('https://cdn.skypack.dev/bitcoinjs-lib@6.1.5');
  const tx = bitcoin.Transaction.fromHex(txHex);
  const txid = tx.getId();
  
  return {
    success: true,
    txid,
    network,
    broadcastResults: broadcastResult,
    explorerUrl: generateMempoolExplorerUrl(txid, network),
    timestamp: new Date().toISOString()
  };
}

async function broadcastToMempool(txHex: string, network: string) {
  const isMainnet = network === 'mainnet';
  const baseUrl = isMainnet ? 'https://mempool.space' : 'https://mempool.space/testnet';
  
  try {
    console.log('Broadcasting to mempool.space...');
    
    const response = await fetch(`${baseUrl}/api/tx`, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: txHex,
    });
    
    if (response.ok) {
      const txid = await response.text();
      return {
        success: true,
        txid,
        api: 'mempool.space',
        timestamp: new Date().toISOString()
      };
    } else {
      const errorText = await response.text();
      throw new Error(`Mempool.space broadcast failed: ${errorText}`);
    }
    
  } catch (error) {
    console.error('Mempool.space broadcast error:', error.message);
    
    // Fallback to Blockstream
    try {
      const blockstreamUrl = isMainnet 
        ? 'https://blockstream.info/api/tx' 
        : 'https://blockstream.info/testnet/api/tx';
        
      const response = await fetch(blockstreamUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: txHex,
      });
      
      if (response.ok) {
        const txid = await response.text();
        return {
          success: true,
          txid,
          api: 'blockstream (fallback)',
          timestamp: new Date().toISOString()
        };
      }
    } catch (fallbackError) {
      console.error('Fallback broadcast also failed:', fallbackError.message);
    }
    
    throw new Error(`Failed to broadcast transaction: ${error.message}`);
  }
}

async function fetchUTXOsFromMempool(address: string, network: string) {
  const isMainnet = network === 'mainnet';
  const baseUrl = isMainnet ? 'https://mempool.space' : 'https://mempool.space/testnet';
  
  const response = await fetch(`${baseUrl}/api/address/${address}/utxo`);
  if (!response.ok) {
    throw new Error(`Failed to fetch UTXOs from mempool.space: ${response.statusText}`);
  }
  
  return await response.json();
}

async function fetchTransactionHexFromMempool(txid: string, network: string) {
  const isMainnet = network === 'mainnet';
  const baseUrl = isMainnet ? 'https://mempool.space' : 'https://mempool.space/testnet';
  
  const response = await fetch(`${baseUrl}/api/tx/${txid}/hex`);
  if (!response.ok) {
    throw new Error(`Failed to fetch transaction hex from mempool.space: ${response.statusText}`);
  }
  
  const hex = await response.text();
  return { hex };
}

async function getMempoolFeeRates(network: string) {
  const isMainnet = network === 'mainnet';
  const baseUrl = isMainnet ? 'https://mempool.space' : 'https://mempool.space/testnet';
  
  try {
    const response = await fetch(`${baseUrl}/api/v1/fees/recommended`);
    if (response.ok) {
      const fees = await response.json();
      return {
        slow: fees.economyFee || 1,
        medium: fees.hourFee || 5,
        fast: fees.halfHourFee || 10,
        urgent: fees.fastestFee || 20
      };
    }
  } catch (error) {
    console.log('Mempool fee rate fetch failed:', error.message);
  }
  
  // Default fee rates if API fails
  return {
    slow: 1,
    medium: 5,
    fast: 10,
    urgent: 20
  };
}

async function estimateTransactionFees(data: any) {
  const { address, network = 'mainnet', outputs = 1 } = data;
  
  const utxos = await fetchUTXOsFromMempool(address, network);
  const feeRates = await getMempoolFeeRates(network);
  
  // Estimate transaction size
  const estimatedSize = (utxos.length * 148) + (outputs * 34) + 10;
  
  return {
    address,
    network,
    utxoCount: utxos.length,
    estimatedSize,
    feeEstimates: {
      slow: {
        satPerByte: feeRates.slow,
        totalFee: estimatedSize * feeRates.slow,
        estimatedTime: '60-120 min'
      },
      medium: {
        satPerByte: feeRates.medium,
        totalFee: estimatedSize * feeRates.medium,
        estimatedTime: '10-60 min'
      },
      fast: {
        satPerByte: feeRates.fast,
        totalFee: estimatedSize * feeRates.fast,
        estimatedTime: '5-30 min'
      },
      urgent: {
        satPerByte: feeRates.urgent,
        totalFee: estimatedSize * feeRates.urgent,
        estimatedTime: '1-10 min'
      }
    },
    timestamp: new Date().toISOString(),
    provider: 'mempool.space'
  };
}

async function getAddressUTXOs(data: any) {
  const { address, network = 'mainnet' } = data;
  
  const utxos = await fetchUTXOsFromMempool(address, network);
  const totalBalance = utxos.reduce((sum: number, utxo: any) => sum + utxo.value, 0);
  
  return {
    address,
    network,
    utxos,
    utxoCount: utxos.length,
    totalBalance,
    totalBalanceBTC: totalBalance / 100000000,
    timestamp: new Date().toISOString(),
    provider: 'mempool.space'
  };
}

async function checkTransactionStatus(data: any) {
  const { txid, network = 'mainnet' } = data;
  
  const isMainnet = network === 'mainnet';
  const baseUrl = isMainnet ? 'https://mempool.space' : 'https://mempool.space/testnet';
  
  const response = await fetch(`${baseUrl}/api/tx/${txid}`);
  if (!response.ok) {
    throw new Error(`Failed to check transaction status: ${response.statusText}`);
  }
  
  const txData = await response.json();
  
  return {
    txid,
    network,
    confirmed: txData.status.confirmed,
    confirmations: txData.status.confirmed ? 1 : 0,
    blockHeight: txData.status.block_height,
    blockHash: txData.status.block_hash,
    blockTime: txData.status.block_time,
    fee: txData.fee,
    size: txData.size,
    weight: txData.weight,
    vsize: txData.vsize,
    timestamp: new Date().toISOString(),
    explorerUrl: generateMempoolExplorerUrl(txid, network),
    provider: 'mempool.space'
  };
}

async function getAddressInformation(data: any) {
  const { address, network = 'mainnet' } = data;
  
  const isMainnet = network === 'mainnet';
  const baseUrl = isMainnet ? 'https://mempool.space' : 'https://mempool.space/testnet';
  
  const response = await fetch(`${baseUrl}/api/address/${address}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch address information: ${response.statusText}`);
  }
  
  const addressData = await response.json();
  
  return {
    address,
    network,
    balance: addressData.chain_stats.funded_txo_sum - addressData.chain_stats.spent_txo_sum,
    totalReceived: addressData.chain_stats.funded_txo_sum,
    totalSent: addressData.chain_stats.spent_txo_sum,
    transactionCount: addressData.chain_stats.tx_count,
    unconfirmedBalance: addressData.mempool_stats.funded_txo_sum - addressData.mempool_stats.spent_txo_sum,
    unconfirmedTxCount: addressData.mempool_stats.tx_count,
    timestamp: new Date().toISOString(),
    provider: 'mempool.space'
  };
}

async function getBlockInformation(data: any) {
  const { blockHash, network = 'mainnet' } = data;
  
  const isMainnet = network === 'mainnet';
  const baseUrl = isMainnet ? 'https://mempool.space' : 'https://mempool.space/testnet';
  
  const response = await fetch(`${baseUrl}/api/block/${blockHash}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch block information: ${response.statusText}`);
  }
  
  const blockData = await response.json();
  
  return {
    blockHash,
    network,
    height: blockData.height,
    timestamp: blockData.timestamp,
    txCount: blockData.tx_count,
    size: blockData.size,
    weight: blockData.weight,
    merkleRoot: blockData.merkle_root,
    previousBlockHash: blockData.previousblockhash,
    nonce: blockData.nonce,
    bits: blockData.bits,
    difficulty: blockData.difficulty,
    explorerUrl: `${baseUrl}/block/${blockHash}`,
    provider: 'mempool.space'
  };
}

async function getMempoolStats(data: any) {
  const { network = 'mainnet' } = data;
  
  const isMainnet = network === 'mainnet';
  const baseUrl = isMainnet ? 'https://mempool.space' : 'https://mempool.space/testnet';
  
  const response = await fetch(`${baseUrl}/api/mempool`);
  if (!response.ok) {
    throw new Error(`Failed to fetch mempool stats: ${response.statusText}`);
  }
  
  const mempoolData = await response.json();
  
  return {
    network,
    count: mempoolData.count,
    vsize: mempoolData.vsize,
    totalFees: mempoolData.total_fee,
    feeHistogram: mempoolData.fee_histogram,
    timestamp: new Date().toISOString(),
    provider: 'mempool.space'
  };
}

function generateMempoolExplorerUrl(txid: string, network: string): string {
  const isMainnet = network === 'mainnet';
  
  return isMainnet 
    ? `https://mempool.space/tx/${txid}`
    : `https://mempool.space/testnet/tx/${txid}`;
}
