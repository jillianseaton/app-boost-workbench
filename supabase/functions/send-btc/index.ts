
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
    const { privateKeyWIF, recipientAddress, amountSats } = await req.json();
    
    if (!privateKeyWIF || !recipientAddress || !amountSats) {
      throw new Error('Private key, recipient address, and amount are required');
    }
    
    console.log('Sending BTC:', { recipientAddress, amountSats });
    
    // Import bitcoinjs-lib
    const bitcoin = await import('https://cdn.skypack.dev/bitcoinjs-lib@6.1.5');
    
    // Create keypair from private key
    const keyPair = bitcoin.ECPair.fromWIF(privateKeyWIF, bitcoin.networks.testnet);
    const { address: senderAddress } = bitcoin.payments.p2pkh({ 
      pubkey: keyPair.publicKey, 
      network: bitcoin.networks.testnet 
    });
    
    // Get UTXOs for the sender address
    const utxoResponse = await fetch(`https://blockstream.info/testnet/api/address/${senderAddress}/utxo`);
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
    
    // Estimate fee (simple calculation: 250 sats per input + 34 sats per output)
    const estimatedFee = (utxos.length * 250) + (2 * 34); // 2 outputs (recipient + change)
    
    if (totalBalance < amountSats + estimatedFee) {
      throw new Error(`Insufficient balance. Available: ${totalBalance} sats, Required: ${amountSats + estimatedFee} sats (including fee)`);
    }
    
    // Create transaction
    const psbt = new bitcoin.Psbt({ network: bitcoin.networks.testnet });
    
    let inputValue = 0;
    
    // Add inputs
    for (const utxo of utxos) {
      // Get transaction hex
      const txResponse = await fetch(`https://blockstream.info/testnet/api/tx/${utxo.txid}/hex`);
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
    
    // Broadcast transaction
    const broadcastResponse = await fetch('https://blockstream.info/testnet/api/tx', {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain',
      },
      body: txHex,
    });
    
    if (!broadcastResponse.ok) {
      const errorText = await broadcastResponse.text();
      throw new Error(`Failed to broadcast transaction: ${errorText}`);
    }
    
    const txid = await broadcastResponse.text();
    
    console.log('Transaction broadcasted:', txid);
    
    return new Response(JSON.stringify({
      txid,
      amountSats,
      recipientAddress,
      fee: estimatedFee,
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
