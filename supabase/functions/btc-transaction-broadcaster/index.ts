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
        result = await createAndBroadcastRealTransaction(transactionData);
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
      case 'create_multisig_transaction':
        result = await createMultisigTransaction(transactionData);
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

async function createAndBroadcastRealTransaction(data: any) {
  const { 
    recipientAddress, 
    amountSats, 
    network = 'mainnet',
    feeRate = 'medium',
    walletType = 'generated',
    isMultisig = false
  } = data;
  
  console.log('Creating REAL Bitcoin transaction:', { 
    recipientAddress, 
    amountSats, 
    network,
    walletType,
    isMultisig
  });

  // SECURITY WARNING: In production, private keys should NEVER be hardcoded
  // This should use secure key management systems like:
  // - Hardware Security Modules (HSM)
  // - Key Management Services (KMS)
  // - Secure enclaves
  // - Multi-party computation (MPC)
  
  const fundingPrivateKey = Deno.env.get('BITCOIN_FUNDING_PRIVATE_KEY');
  if (!fundingPrivateKey) {
    throw new Error('Bitcoin funding private key not configured in secrets');
  }
  
  // Import bitcoinjs-lib for real transaction creation
  const bitcoin = await import('https://cdn.skypack.dev/bitcoinjs-lib@6.1.5');
  
  // Set network (mainnet for production)
  const btcNetwork = network === 'mainnet' ? bitcoin.networks.bitcoin : bitcoin.networks.testnet;
  
  // Create keypair from funding private key
  const keyPair = bitcoin.ECPair.fromWIF(fundingPrivateKey, btcNetwork);
  const { address: fundingAddress } = bitcoin.payments.p2wpkh({ 
    pubkey: keyPair.publicKey, 
    network: btcNetwork 
  });
  
  console.log('Funding from address:', fundingAddress);
  
  // Get UTXOs for the funding address
  const utxos = await fetchUTXOsFromMempool(fundingAddress, network);
  
  if (utxos.length === 0) {
    throw new Error('No UTXOs available in funding wallet - insufficient funds');
  }
  
  // Calculate total available balance
  const totalBalance = utxos.reduce((sum: number, utxo: any) => sum + utxo.value, 0);
  console.log('Total funding balance:', totalBalance, 'sats');
  
  // Get current fee rates
  const feeRates = await getMempoolFeeRates(network);
  const satPerByte = feeRates[feeRate] || feeRates.medium;
  
  // Estimate transaction size
  const estimatedSize = (utxos.length * 148) + (2 * 34) + 10;
  const estimatedFee = estimatedSize * satPerByte;
  
  console.log('Transaction estimates:', {
    size: estimatedSize,
    feeRate: satPerByte,
    estimatedFee
  });
  
  if (totalBalance < amountSats + estimatedFee) {
    throw new Error(`Insufficient funds in hot wallet. Available: ${totalBalance} sats, Required: ${amountSats + estimatedFee} sats`);
  }
  
  // Create transaction
  const psbt = new bitcoin.Psbt({ network: btcNetwork });
  
  let inputValue = 0;
  
  // Add inputs from funding wallet
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
      address: fundingAddress,
      value: change,
    });
  }
  
  // Sign all inputs with funding wallet
  for (let i = 0; i < psbt.inputCount; i++) {
    psbt.signInput(i, keyPair);
  }
  
  psbt.finalizeAllInputs();
  
  // Get transaction hex and ID
  const txHex = psbt.extractTransaction().toHex();
  const txid = psbt.extractTransaction().getId();
  
  console.log('Real transaction created:', { txid, size: txHex.length / 2 });
  
  // Broadcast to Bitcoin network
  const broadcastResult = await broadcastToMempool(txHex, network);
  
  return {
    success: true,
    txid,
    txHex,
    amountSats,
    recipientAddress,
    fundingAddress,
    fee: estimatedFee,
    change,
    network,
    walletType,
    isMultisig,
    broadcastResults: broadcastResult,
    explorerUrl: generateMempoolExplorerUrl(txid, network),
    timestamp: new Date().toISOString(),
    warning: 'This is a REAL Bitcoin transaction on mainnet with real money'
  };
}

async function createMultisigTransaction(data: any) {
  const { recipientAddress, amountSats, publicKeys, requiredSigs, network = 'mainnet' } = data;
  
  console.log('Creating multisig transaction:', {
    recipientAddress,
    amountSats,
    publicKeysCount: publicKeys.length,
    requiredSigs,
    network
  });
  
  // Import bitcoinjs-lib
  const bitcoin = await import('https://cdn.skypack.dev/bitcoinjs-lib@6.1.5');
  const btcNetwork = network === 'mainnet' ? bitcoin.networks.bitcoin : bitcoin.networks.testnet;
  
  // Create multisig redeem script
  const pubkeyBuffers = publicKeys.map((pk: string) => Buffer.from(pk, 'hex'));
  const { address: multisigAddress, redeem } = bitcoin.payments.p2sh({
    redeem: bitcoin.payments.p2ms({
      m: requiredSigs,
      pubkeys: pubkeyBuffers,
      network: btcNetwork
    }),
    network: btcNetwork
  });
  
  // Get UTXOs for multisig address
  const utxos = await fetchUTXOsFromMempool(multisigAddress, network);
  
  if (utxos.length === 0) {
    throw new Error('No UTXOs available in multisig wallet');
  }
  
  // Create unsigned transaction template
  const psbt = new bitcoin.Psbt({ network: btcNetwork });
  
  let inputValue = 0;
  
  // Add inputs
  for (const utxo of utxos) {
    const txResponse = await fetchTransactionHexFromMempool(utxo.txid, network);
    
    psbt.addInput({
      hash: utxo.txid,
      index: utxo.vout,
      nonWitnessUtxo: Buffer.from(txResponse.hex, 'hex'),
      redeemScript: redeem!.output,
    });
    
    inputValue += utxo.value;
  }
  
  // Add outputs
  psbt.addOutput({
    address: recipientAddress,
    value: amountSats,
  });
  
  // Calculate and add change
  const feeRates = await getMempoolFeeRates(network);
  const estimatedSize = (utxos.length * 200) + (2 * 34) + 50; // Larger size for multisig
  const estimatedFee = estimatedSize * feeRates.medium;
  const change = inputValue - amountSats - estimatedFee;
  
  if (change > 546) {
    psbt.addOutput({
      address: multisigAddress,
      value: change,
    });
  }
  
  return {
    success: true,
    unsignedTransaction: psbt.toBase64(),
    multisigAddress,
    requiredSignatures: requiredSigs,
    totalSigners: publicKeys.length,
    estimatedFee,
    change,
    note: 'This transaction requires signing by multiple parties before broadcast'
  };
}

async function broadcastToMempool(txHex: string, network: string) {
  const isMainnet = network === 'mainnet';
  const baseUrl = isMainnet ? 'https://mempool.space' : 'https://mempool.space/testnet';
  
  try {
    console.log('Broadcasting to Bitcoin network via mempool.space...');
    
    const response = await fetch(`${baseUrl}/api/tx`, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: txHex,
    });
    
    if (response.ok) {
      const txid = await response.text();
      console.log('Successfully broadcast to Bitcoin network:', txid);
      return {
        success: true,
        txid,
        api: 'mempool.space',
        network: isMainnet ? 'mainnet' : 'testnet',
        timestamp: new Date().toISOString()
      };
    } else {
      const errorText = await response.text();
      throw new Error(`Bitcoin network broadcast failed: ${errorText}`);
    }
    
  } catch (error) {
    console.error('Bitcoin broadcast error:', error.message);
    throw new Error(`Failed to broadcast to Bitcoin network: ${error.message}`);
  }
}

async function fetchUTXOsFromMempool(address: string, network: string) {
  const isMainnet = network === 'mainnet';
  const baseUrl = isMainnet ? 'https://mempool.space' : 'https://mempool.space/testnet';
  
  const response = await fetch(`${baseUrl}/api/address/${address}/utxo`);
  if (!response.ok) {
    throw new Error(`Failed to fetch UTXOs: ${response.statusText}`);
  }
  
  return await response.json();
}

async function fetchTransactionHexFromMempool(txid: string, network: string) {
  const isMainnet = network === 'mainnet';
  const baseUrl = isMainnet ? 'https://mempool.space' : 'https://mempool.space/testnet';
  
  const response = await fetch(`${baseUrl}/api/tx/${txid}/hex`);
  if (!response.ok) {
    throw new Error(`Failed to fetch transaction hex: ${response.statusText}`);
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
    console.log('Fee rate fetch failed:', error.message);
  }
  
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
