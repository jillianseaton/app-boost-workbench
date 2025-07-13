
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('send-btc function called with method:', req.method);
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestBody = await req.json();
    console.log('Received request body:', requestBody);
    
    const { privateKeyWIF, recipientAddress, amountSats } = requestBody;
    console.log('Extracted values:', { privateKeyWIF: privateKeyWIF ? 'present' : 'missing', recipientAddress, amountSats });
    
    if (!privateKeyWIF || !recipientAddress || !amountSats) {
      throw new Error('Private key, recipient address, and amount are required');
    }
    
    // Validate Bitcoin address format for mainnet
    const addressRegex = /^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,62}$/;
    if (!addressRegex.test(recipientAddress)) {
      throw new Error(`Invalid Bitcoin address format: ${recipientAddress}. Please use a valid Bitcoin address starting with 1, 3, or bc1.`);
    }
    
    console.log('Sending BTC:', { recipientAddress, amountSats });
    
    // Import bitcoinjs-lib with proper ES modules
    const bitcoin = await import('https://esm.sh/bitcoinjs-lib@6.1.5');
    const ECPair = await import('https://esm.sh/ecpair@2.1.0');
    const ecc = await import('https://esm.sh/tiny-secp256k1@2.2.3');
    
    // Initialize ECPair with ecc
    const ECPairFactory = ECPair.ECPairFactory(ecc.default);
    
    // Create keypair from private key (mainnet)
    const keyPair = ECPairFactory.fromWIF(privateKeyWIF, bitcoin.networks.bitcoin);
    const { address: senderAddress } = bitcoin.payments.p2pkh({ 
      pubkey: keyPair.publicKey, 
      network: bitcoin.networks.bitcoin 
    });
    
    // Get UTXOs for the sender address using mempool.space
    const utxoResponse = await fetch(`https://mempool.space/api/address/${senderAddress}/utxo`);
    if (!utxoResponse.ok) {
      throw new Error('Failed to fetch UTXOs');
    }
    
    const utxos = await utxoResponse.json();
    console.log('Available UTXOs:', utxos);
    
    if (utxos.length === 0) {
      throw new Error('No UTXOs available');
    }
    
    // Calculate total available balance
    const totalBalance = utxos.reduce((sum: number, utxo: any) => sum + utxo.value, 0);
    
    // Get current fee rates from mempool.space
    const feeResponse = await fetch('https://mempool.space/api/v1/fees/recommended');
    const feeRates = await feeResponse.json();
    const satPerByte = feeRates.hourFee || 10; // Use hourFee for reasonable confirmation time
    
    // Estimate transaction size and fee
    const estimatedSize = (utxos.length * 148) + (2 * 34) + 10;
    const estimatedFee = estimatedSize * satPerByte;
    
    if (totalBalance < amountSats + estimatedFee) {
      throw new Error(`Insufficient balance. Available: ${totalBalance} sats, Required: ${amountSats + estimatedFee} sats (including fee)`);
    }
    
    // Create transaction
    const psbt = new bitcoin.Psbt({ network: bitcoin.networks.bitcoin });
    
    let inputValue = 0;
    
    // Add inputs
    for (const utxo of utxos) {
      // Get transaction hex from mempool.space
      const txResponse = await fetch(`https://mempool.space/api/tx/${utxo.txid}/hex`);
      const txHex = await txResponse.text();
      
      psbt.addInput({
        hash: utxo.txid,
        index: utxo.vout,
        nonWitnessUtxo: Buffer.from(txHex, 'hex'),
      });
      
      inputValue += utxo.value;
      
      // Break if we have enough inputs
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
    
    console.log('Transaction created:', txHex);
    
    // Broadcast transaction to mempool.space first
    let txid;
    try {
      const broadcastResponse = await fetch('https://mempool.space/api/tx', {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain',
        },
        body: txHex,
      });
      
      if (broadcastResponse.ok) {
        txid = await broadcastResponse.text();
      } else {
        throw new Error('Mempool.space broadcast failed');
      }
    } catch (error) {
      // Fallback to Blockstream
      const blockstreamResponse = await fetch('https://blockstream.info/api/tx', {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain',
        },
        body: txHex,
      });
      
      if (!blockstreamResponse.ok) {
        const errorText = await blockstreamResponse.text();
        throw new Error(`Failed to broadcast transaction: ${errorText}`);
      }
      
      txid = await blockstreamResponse.text();
    }
    
    console.log('Transaction broadcasted:', txid);
    
    return new Response(JSON.stringify({
      txid,
      amountSats,
      recipientAddress,
      fee: estimatedFee,
      network: 'mainnet',
      explorerUrl: `https://mempool.space/tx/${txid}`,
      success: true
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error sending BTC:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
