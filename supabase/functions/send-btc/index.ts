import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import * as btc from "https://esm.sh/@noble/bitcoin@1.1.3";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('send-btc function called with method:', req.method);
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  let requestBody;
  try {
    requestBody = await req.json();
    console.log('Received request body:', requestBody);
    
    const { privateKeyWIF, recipientAddress, amountSats } = requestBody;
    console.log('Extracted values:', { 
      privateKeyWIF: privateKeyWIF ? 'present' : 'missing', 
      recipientAddress, 
      amountSats 
    });
    
    if (!privateKeyWIF || !recipientAddress || !amountSats) {
      throw new Error('Private key, recipient address, and amount are required');
    }
    
    // Validate Bitcoin address format for mainnet
    const addressRegex = /^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,62}$/;
    if (!addressRegex.test(recipientAddress)) {
      throw new Error(`Invalid Bitcoin address format: ${recipientAddress}. Please use a valid Bitcoin address starting with 1, 3, or bc1.`);
    }
    
    console.log('Sending BTC:', { recipientAddress, amountSats });
    
    // Create keypair from private key
    let keyPair, senderAddress;
    try {
      keyPair = btc.PrivateKey.fromWIF(privateKeyWIF);
      // Get sender address from public key
      const publicKey = keyPair.publicKey;
      senderAddress = btc.Address.p2pkh(publicKey).address;
      console.log('Sender address:', senderAddress);
    } catch (error) {
      console.error('Invalid private key:', error);
      throw new Error(`Invalid private key format: ${error.message}`);
    }
    
    // Get UTXOs for the sender address using mempool.space
    let utxos;
    try {
      console.log('Fetching UTXOs for address:', senderAddress);
      const utxoResponse = await fetch(`https://mempool.space/api/address/${senderAddress}/utxo`);
      if (!utxoResponse.ok) {
        const errorBody = await utxoResponse.text();
        console.error('UTXO fetch error:', utxoResponse.status, errorBody);
        throw new Error(`Failed to fetch UTXOs: ${utxoResponse.status} - ${errorBody}`);
      }
      utxos = await utxoResponse.json();
      console.log('Available UTXOs:', utxos);
    } catch (error) {
      console.error('UTXO fetch network error:', error);
      throw new Error(`Network error fetching UTXOs: ${error.message}`);
    }
    
    if (!utxos || utxos.length === 0) {
      throw new Error('No UTXOs available for this address');
    }
    
    // Calculate total available balance
    const totalBalance = utxos.reduce((sum, utxo) => sum + utxo.value, 0);
    console.log('Total balance:', totalBalance, 'sats');
    
    // Get current fee rates from mempool.space
    let satPerByte = 10; // fallback
    try {
      const feeResponse = await fetch('https://mempool.space/api/v1/fees/recommended');
      if (feeResponse.ok) {
        const feeRates = await feeResponse.json();
        satPerByte = feeRates.hourFee || 10;
        console.log('Fee rate:', satPerByte, 'sat/byte');
      } else {
        console.log('Fee fetch failed, using fallback fee rate of 10 sat/byte');
      }
    } catch (error) {
      console.error('Fee fetch error, using fallback:', error);
    }
    
    // Select enough UTXOs to cover amount + estimated fee
    let inputSats = 0;
    const selectedUtxos = [];
    
    // Estimate transaction size and fee
    for (const utxo of utxos) {
      selectedUtxos.push(utxo);
      inputSats += utxo.value;
      
      // Estimate size: inputs * 148 + outputs * 34 + 10 overhead
      const estimatedSize = (selectedUtxos.length * 148) + (2 * 34) + 10;
      const estimatedFee = estimatedSize * satPerByte;
      
      if (inputSats >= amountSats + estimatedFee) {
        console.log('Selected UTXOs:', selectedUtxos.length);
        console.log('Input value:', inputSats, 'sats');
        console.log('Estimated fee:', estimatedFee, 'sats');
        break;
      }
    }
    
    // Final fee calculation
    const finalSize = (selectedUtxos.length * 148) + (2 * 34) + 10;
    const finalFee = finalSize * satPerByte;
    
    if (inputSats < amountSats + finalFee) {
      throw new Error(`Insufficient balance. Available: ${totalBalance} sats, Required: ${amountSats + finalFee} sats (including fee of ${finalFee})`);
    }
    
    // Build transaction using noble-bitcoin
    console.log('Building transaction...');
    const tx = new btc.Transaction();
    
    // Add inputs
    for (const utxo of selectedUtxos) {
      tx.addInput({
        txid: utxo.txid,
        index: utxo.vout
      });
    }
    
    // Add output to recipient
    tx.addOutput({
      address: recipientAddress,
      value: amountSats
    });
    
    // Add change output if needed
    const change = inputSats - amountSats - finalFee;
    if (change > 546) { // dust threshold
      tx.addOutput({
        address: senderAddress,
        value: change
      });
      console.log('Change output:', change, 'sats');
    }
    
    // Sign all inputs
    console.log('Signing transaction...');
    for (let i = 0; i < selectedUtxos.length; i++) {
      try {
        tx.sign(i, keyPair);
      } catch (error) {
        console.error(`Error signing input ${i}:`, error);
        throw new Error(`Failed to sign input ${i}: ${error.message}`);
      }
    }
    
    // Serialize to raw hex
    let txHex;
    try {
      txHex = tx.toHex();
      console.log('Transaction created, hex length:', txHex.length);
    } catch (error) {
      console.error('Transaction serialization error:', error);
      throw new Error(`Failed to serialize transaction: ${error.message}`);
    }
    
    // Calculate transaction ID (double SHA256 and reverse)
    const txid = btc.Transaction.fromHex(txHex).id;
    console.log('Transaction ID:', txid);
    
    // Broadcast transaction to mempool.space first
    let broadcastTxid;
    try {
      console.log('Attempting to broadcast via mempool.space...');
      const broadcastResponse = await fetch('https://mempool.space/api/tx', {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain',
        },
        body: txHex,
      });
      
      if (broadcastResponse.ok) {
        broadcastTxid = await broadcastResponse.text();
        console.log('Successfully broadcasted via mempool.space:', broadcastTxid);
      } else {
        const errorBody = await broadcastResponse.text();
        console.error('Mempool.space broadcast failed:', broadcastResponse.status, errorBody);
        throw new Error(`Mempool.space broadcast failed: ${broadcastResponse.status} - ${errorBody}`);
      }
    } catch (mempoolError) {
      console.error('Mempool.space broadcast error, trying Blockstream fallback:', mempoolError);
      
      try {
        console.log('Attempting to broadcast via Blockstream...');
        const blockstreamResponse = await fetch('https://blockstream.info/api/tx', {
          method: 'POST',
          headers: {
            'Content-Type': 'text/plain',
          },
          body: txHex,
        });
        
        if (!blockstreamResponse.ok) {
          const errorBody = await blockstreamResponse.text();
          console.error('Blockstream broadcast failed:', blockstreamResponse.status, errorBody);
          throw new Error(`Blockstream broadcast failed: ${blockstreamResponse.status} - ${errorBody}`);
        }
        
        broadcastTxid = await blockstreamResponse.text();
        console.log('Successfully broadcasted via Blockstream:', broadcastTxid);
      } catch (blockstreamError) {
        console.error('All broadcast methods failed:', { mempoolError, blockstreamError });
        throw new Error(`All broadcast methods failed. Mempool: ${mempoolError.message}. Blockstream: ${blockstreamError.message}`);
      }
    }
    
    console.log('Transaction successfully broadcasted:', broadcastTxid);
    
    return new Response(JSON.stringify({
      success: true,
      txid: broadcastTxid,
      txHex,
      amountSats,
      recipientAddress,
      fee: finalFee,
      change: change > 546 ? change : 0,
      network: 'mainnet',
      explorerUrl: `https://mempool.space/tx/${broadcastTxid}`,
      inputsUsed: selectedUtxos.length,
      totalInput: inputSats
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('Error sending BTC:', error);
    console.error('Error stack:', error.stack);
    console.error('Request context:', { 
      senderAddress: senderAddress || 'unknown',
      recipientAddress: requestBody?.recipientAddress || 'unknown',
      amountSats: requestBody?.amountSats || 'unknown'
    });
    
    // Determine error type and provide appropriate response
    let errorResponse = {
      success: false,
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    };
    
    // Add specific error context based on error type
    if (error.message.includes('UTXO')) {
      errorResponse.errorType = 'UTXO_FETCH_ERROR';
    } else if (error.message.includes('broadcast')) {
      errorResponse.errorType = 'BROADCAST_ERROR';
    } else if (error.message.includes('balance') || error.message.includes('Insufficient')) {
      errorResponse.errorType = 'INSUFFICIENT_BALANCE';
    } else if (error.message.includes('address')) {
      errorResponse.errorType = 'INVALID_ADDRESS';
    } else if (error.message.includes('private key') || error.message.includes('WIF')) {
      errorResponse.errorType = 'INVALID_PRIVATE_KEY';
    } else if (error.message.includes('sign')) {
      errorResponse.errorType = 'SIGNING_ERROR';
    } else {
      errorResponse.errorType = 'GENERAL_ERROR';
    }
    
    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});