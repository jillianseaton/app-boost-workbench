
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
    network = 'testnet',
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
  
  // Get UTXOs for the sender address
  const utxos = await fetchUTXOs(senderAddress, network);
  
  if (utxos.length === 0) {
    throw new Error('No UTXOs available for this address');
  }
  
  // Calculate total available balance
  const totalBalance = utxos.reduce((sum: number, utxo: any) => sum + utxo.value, 0);
  
  // Get current fee rates
  const feeRates = await getFeeRates(network);
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
    const txResponse = await fetchTransactionHex(utxo.txid, network);
    
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
  
  // Broadcast transaction using multiple APIs for redundancy
  const broadcastResult = await broadcastWithRedundancy(txHex, network);
  
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
    explorerUrl: generateExplorerUrl(txid, network),
    timestamp: new Date().toISOString()
  };
}

async function broadcastRawTransaction(data: any) {
  const { txHex, network = 'testnet' } = data;
  
  console.log('Broadcasting raw transaction:', { network });
  
  const broadcastResult = await broadcastWithRedundancy(txHex, network);
  
  // Extract txid from hex
  const bitcoin = await import('https://cdn.skypack.dev/bitcoinjs-lib@6.1.5');
  const tx = bitcoin.Transaction.fromHex(txHex);
  const txid = tx.getId();
  
  return {
    success: true,
    txid,
    network,
    broadcastResults: broadcastResult,
    explorerUrl: generateExplorerUrl(txid, network),
    timestamp: new Date().toISOString()
  };
}

async function broadcastWithRedundancy(txHex: string, network: string) {
  const apis = getBlockchainAPIs(network);
  const results = [];
  
  for (const api of apis) {
    try {
      console.log(`Attempting broadcast via ${api.name}...`);
      
      const response = await fetch(api.broadcastUrl, {
        method: 'POST',
        headers: api.headers,
        body: api.bodyFormat === 'json' ? JSON.stringify({ tx: txHex }) : txHex,
      });
      
      if (response.ok) {
        const result = api.responseFormat === 'json' ? await response.json() : await response.text();
        
        results.push({
          api: api.name,
          success: true,
          response: result,
          timestamp: new Date().toISOString()
        });
        
        console.log(`✅ Broadcast successful via ${api.name}`);
        break; // Success with first API, no need to try others
        
      } else {
        const errorText = await response.text();
        results.push({
          api: api.name,
          success: false,
          error: errorText,
          status: response.status,
          timestamp: new Date().toISOString()
        });
        
        console.log(`❌ Broadcast failed via ${api.name}: ${errorText}`);
      }
      
    } catch (error) {
      results.push({
        api: api.name,
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      });
      
      console.log(`❌ Broadcast error via ${api.name}: ${error.message}`);
    }
  }
  
  const successfulBroadcasts = results.filter(r => r.success);
  
  if (successfulBroadcasts.length === 0) {
    throw new Error(`Failed to broadcast transaction via all APIs: ${JSON.stringify(results)}`);
  }
  
  return {
    successful: successfulBroadcasts.length,
    total: results.length,
    results
  };
}

function getBlockchainAPIs(network: string) {
  const isMainnet = network === 'mainnet';
  
  return [
    {
      name: 'Blockstream',
      broadcastUrl: isMainnet 
        ? 'https://blockstream.info/api/tx' 
        : 'https://blockstream.info/testnet/api/tx',
      headers: { 'Content-Type': 'text/plain' },
      bodyFormat: 'raw',
      responseFormat: 'text'
    },
    {
      name: 'Mempool.space',
      broadcastUrl: isMainnet 
        ? 'https://mempool.space/api/tx' 
        : 'https://mempool.space/testnet/api/tx',
      headers: { 'Content-Type': 'text/plain' },
      bodyFormat: 'raw',
      responseFormat: 'text'
    },
    {
      name: 'BlockCypher',
      broadcastUrl: isMainnet 
        ? 'https://api.blockcypher.com/v1/btc/main/txs/push' 
        : 'https://api.blockcypher.com/v1/btc/test3/txs/push',
      headers: { 'Content-Type': 'application/json' },
      bodyFormat: 'json',
      responseFormat: 'json'
    }
  ];
}

async function fetchUTXOs(address: string, network: string) {
  const isMainnet = network === 'mainnet';
  
  // Try Blockstream first
  try {
    const url = isMainnet 
      ? `https://blockstream.info/api/address/${address}/utxo`
      : `https://blockstream.info/testnet/api/address/${address}/utxo`;
      
    const response = await fetch(url);
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.log('Blockstream UTXO fetch failed:', error.message);
  }
  
  // Fallback to Mempool.space
  try {
    const url = isMainnet 
      ? `https://mempool.space/api/address/${address}/utxo`
      : `https://mempool.space/testnet/api/address/${address}/utxo`;
      
    const response = await fetch(url);
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.log('Mempool.space UTXO fetch failed:', error.message);
  }
  
  throw new Error('Failed to fetch UTXOs from all APIs');
}

async function fetchTransactionHex(txid: string, network: string) {
  const isMainnet = network === 'mainnet';
  
  // Try Blockstream first
  try {
    const url = isMainnet 
      ? `https://blockstream.info/api/tx/${txid}/hex`
      : `https://blockstream.info/testnet/api/tx/${txid}/hex`;
      
    const response = await fetch(url);
    if (response.ok) {
      const hex = await response.text();
      return { hex };
    }
  } catch (error) {
    console.log('Blockstream transaction fetch failed:', error.message);
  }
  
  // Fallback to Mempool.space
  try {
    const url = isMainnet 
      ? `https://mempool.space/api/tx/${txid}/hex`
      : `https://mempool.space/testnet/api/tx/${txid}/hex`;
      
    const response = await fetch(url);
    if (response.ok) {
      const hex = await response.text();
      return { hex };
    }
  } catch (error) {
    console.log('Mempool.space transaction fetch failed:', error.message);
  }
  
  throw new Error('Failed to fetch transaction hex from all APIs');
}

async function getFeeRates(network: string) {
  const isMainnet = network === 'mainnet';
  
  try {
    const url = isMainnet 
      ? 'https://mempool.space/api/v1/fees/recommended'
      : 'https://mempool.space/testnet/api/v1/fees/recommended';
      
    const response = await fetch(url);
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
    console.log('Fee rate fetch failed:', error.message);
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
  const { address, network = 'testnet', outputs = 1 } = data;
  
  const utxos = await fetchUTXOs(address, network);
  const feeRates = await getFeeRates(network);
  
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
    timestamp: new Date().toISOString()
  };
}

async function getAddressUTXOs(data: any) {
  const { address, network = 'testnet' } = data;
  
  const utxos = await fetchUTXOs(address, network);
  const totalBalance = utxos.reduce((sum: number, utxo: any) => sum + utxo.value, 0);
  
  return {
    address,
    network,
    utxos,
    utxoCount: utxos.length,
    totalBalance,
    totalBalanceBTC: totalBalance / 100000000,
    timestamp: new Date().toISOString()
  };
}

async function checkTransactionStatus(data: any) {
  const { txid, network = 'testnet' } = data;
  
  const isMainnet = network === 'mainnet';
  
  try {
    const url = isMainnet 
      ? `https://blockstream.info/api/tx/${txid}`
      : `https://blockstream.info/testnet/api/tx/${txid}`;
      
    const response = await fetch(url);
    if (response.ok) {
      const txData = await response.json();
      return {
        txid,
        network,
        confirmed: txData.status.confirmed,
        confirmations: txData.status.confirmed ? txData.status.block_height : 0,
        blockHeight: txData.status.block_height,
        fee: txData.fee,
        size: txData.size,
        weight: txData.weight,
        timestamp: new Date().toISOString(),
        explorerUrl: generateExplorerUrl(txid, network)
      };
    }
  } catch (error) {
    console.log('Transaction status check failed:', error.message);
  }
  
  throw new Error('Failed to check transaction status');
}

async function getAddressInformation(data: any) {
  const { address, network = 'testnet' } = data;
  
  const isMainnet = network === 'mainnet';
  
  try {
    const url = isMainnet 
      ? `https://blockstream.info/api/address/${address}`
      : `https://blockstream.info/testnet/api/address/${address}`;
      
    const response = await fetch(url);
    if (response.ok) {
      const addressData = await response.json();
      return {
        address,
        network,
        balance: addressData.chain_stats.funded_txo_sum - addressData.chain_stats.spent_txo_sum,
        totalReceived: addressData.chain_stats.funded_txo_sum,
        totalSent: addressData.chain_stats.spent_txo_sum,
        transactionCount: addressData.chain_stats.tx_count,
        unconfirmedBalance: addressData.mempool_stats.funded_txo_sum - addressData.mempool_stats.spent_txo_sum,
        timestamp: new Date().toISOString()
      };
    }
  } catch (error) {
    console.log('Address information fetch failed:', error.message);
  }
  
  throw new Error('Failed to fetch address information');
}

function generateExplorerUrl(txid: string, network: string): string {
  const isMainnet = network === 'mainnet';
  
  return isMainnet 
    ? `https://blockstream.info/tx/${txid}`
    : `https://blockstream.info/testnet/tx/${txid}`;
}
