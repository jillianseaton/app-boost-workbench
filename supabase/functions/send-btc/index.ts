import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { hex } from "https://esm.sh/@scure/base@1.1.5";
import { sha256 } from "https://esm.sh/@noble/hashes@1.3.3/sha256";
import * as secp256k1 from "https://esm.sh/@noble/secp256k1@2.0.0";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Bitcoin WIF decode function
function decodeWIF(wif: string): Uint8Array {
  const alphabet = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  const base58Map: { [key: string]: number } = {};
  alphabet.split('').forEach((char, i) => base58Map[char] = i);
  
  let result = 0n;
  for (const char of wif) {
    result = result * 58n + BigInt(base58Map[char] || 0);
  }
  
  const bytes = [];
  while (result > 0n) {
    bytes.unshift(Number(result & 0xFFn));
    result = result >> 8n;
  }
  
  // Remove version byte (0x80) and checksum (last 4 bytes)
  const privateKeyBytes = bytes.slice(1, -4);
  
  // Handle compressed flag
  if (privateKeyBytes.length === 33 && privateKeyBytes[32] === 0x01) {
    return new Uint8Array(privateKeyBytes.slice(0, 32));
  }
  
  return new Uint8Array(privateKeyBytes);
}

// Bitcoin address generation
function publicKeyToAddress(publicKey: Uint8Array): string {
  const hash160 = (data: Uint8Array): Uint8Array => {
    const sha256Hash = sha256(data);
    // Simplified RIPEMD160 - using SHA256 as fallback for demo
    return sha256Hash.slice(0, 20);
  };
  
  const pubKeyHash = hash160(publicKey);
  const versionedHash = new Uint8Array([0x00, ...pubKeyHash]); // 0x00 for mainnet P2PKH
  
  const checksum = sha256(sha256(versionedHash)).slice(0, 4);
  const fullHash = new Uint8Array([...versionedHash, ...checksum]);
  
  // Base58 encode
  const alphabet = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  let result = '';
  let num = 0n;
  
  for (const byte of fullHash) {
    num = num * 256n + BigInt(byte);
  }
  
  while (num > 0n) {
    result = alphabet[Number(num % 58n)] + result;
    num = num / 58n;
  }
  
  // Add leading zeros
  for (const byte of fullHash) {
    if (byte === 0) result = '1' + result;
    else break;
  }
  
  return result;
}

// Simplified transaction builder
function buildTransaction(inputs: any[], outputs: any[]): string {
  const parts: string[] = [];
  
  // Version (4 bytes, little endian)
  parts.push('01000000');
  
  // Input count (varint)
  parts.push(inputs.length.toString(16).padStart(2, '0'));
  
  // Inputs
  for (const input of inputs) {
    // Previous tx hash (32 bytes, reversed)
    const txidBytes = hex.decode(input.txid);
    const reversedTxid = [...txidBytes].reverse();
    parts.push(hex.encode(new Uint8Array(reversedTxid)));
    
    // Output index (4 bytes, little endian)
    const vout = input.vout;
    parts.push(vout.toString(16).padStart(8, '0').match(/.{2}/g)!.reverse().join(''));
    
    // Script length and script (simplified - empty for now)
    parts.push('00'); // Empty script for unsigned
    
    // Sequence (4 bytes)
    parts.push('ffffffff');
  }
  
  // Output count
  parts.push(outputs.length.toString(16).padStart(2, '0'));
  
  // Outputs
  for (const output of outputs) {
    // Value (8 bytes, little endian)
    const value = output.value;
    const valueHex = value.toString(16).padStart(16, '0');
    const valueBytes = valueHex.match(/.{2}/g)!.reverse().join('');
    parts.push(valueBytes);
    
    // Script length and script (simplified P2PKH)
    if (output.address.startsWith('1')) {
      // P2PKH script: OP_DUP OP_HASH160 <20-byte-hash> OP_EQUALVERIFY OP_CHECKSIG
      parts.push('1976a914'); // Script length + OP_DUP OP_HASH160 OP_PUSHDATA(20)
      
      // Decode address to get hash160
      // This is simplified - you'd need proper base58 decode here
      parts.push('00'.repeat(20)); // Placeholder hash160
      
      parts.push('88ac'); // OP_EQUALVERIFY OP_CHECKSIG
    }
  }
  
  // Locktime (4 bytes)
  parts.push('00000000');
  
  return parts.join('');
}

serve(async (req) => {
  console.log('send-btc function called with method:', req.method);
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestBody = await req.json();
    console.log('Received request body:', requestBody);
    
    const { privateKeyWIF, recipientAddress, amountSats, userWalletAddress } = requestBody;
    
    // Use recipientAddress or userWalletAddress as the send-to address
    const sendToAddress = recipientAddress || userWalletAddress;
    
    // Parse amount as float/number and ensure it's valid
    const parsedAmount = parseFloat(amountSats) || 0;
    
    console.log('Extracted values:', { 
      privateKeyWIF: privateKeyWIF ? 'present' : 'missing', 
      sendToAddress,
      parsedAmount,
      originalAmount: amountSats
    });
    
    if (!privateKeyWIF) {
      throw new Error('Private key (privateKeyWIF) is required');
    }
    
    if (!sendToAddress) {
      throw new Error('Send to address (recipientAddress or userWalletAddress) is required');
    }
    
    if (!parsedAmount || parsedAmount <= 0) {
      throw new Error(`Invalid amount: ${amountSats}. Amount must be a positive number in satoshis.`);
    }
    
    // Validate Bitcoin address format for mainnet
    const addressRegex = /^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,62}$/;
    if (!addressRegex.test(sendToAddress)) {
      throw new Error(`Invalid Bitcoin address format: ${sendToAddress}. Please use a valid Bitcoin address starting with 1, 3, or bc1.`);
    }
    
    console.log('Sending BTC:', { sendToAddress, parsedAmount });
    
    // Create keypair from private key WIF
    console.log('Decoding WIF private key...');
    const privateKeyBytes = decodeWIF(privateKeyWIF);
    console.log('Private key decoded, length:', privateKeyBytes.length);
    
    // Generate public key
    const publicKey = secp256k1.getPublicKey(privateKeyBytes, true); // compressed
    console.log('Public key generated, length:', publicKey.length);
    
    // Generate sender address
    const senderAddress = publicKeyToAddress(publicKey);
    console.log('Sender address:', senderAddress);
    
    // Get UTXOs for the sender address using mempool.space
    console.log('Fetching UTXOs for address:', senderAddress);
    const utxoResponse = await fetch(`https://mempool.space/api/address/${senderAddress}/utxo`);
    
    if (!utxoResponse.ok) {
      const errorBody = await utxoResponse.text();
      console.error('UTXO fetch error:', utxoResponse.status, errorBody);
      throw new Error(`Failed to fetch UTXOs: ${utxoResponse.status} - ${errorBody}`);
    }
    
    const utxos = await utxoResponse.json();
    console.log('Available UTXOs:', utxos.length, 'UTXOs found');
    console.log('UTXO details:', utxos);
    
    if (!utxos || utxos.length === 0) {
      throw new Error(`No UTXOs available for address ${senderAddress}. This address has no Bitcoin to send.`);
    }
    
    // Calculate total available balance
    const totalBalance = utxos.reduce((sum: number, utxo: any) => sum + utxo.value, 0);
    console.log('Total balance:', totalBalance, 'sats');
    
    // Get current fee rates from mempool.space
    let satPerByte = 10; // fallback
    try {
      console.log('Fetching fee rates...');
      const feeResponse = await fetch('https://mempool.space/api/v1/fees/recommended');
      
      if (feeResponse.ok) {
        const feeRates = await feeResponse.json();
        satPerByte = feeRates.hourFee || 10;
        console.log('Fee rate:', satPerByte, 'sat/byte');
      } else {
        console.log('Fee fetch failed, using fallback fee rate of 10 sat/byte');
      }
    } catch (feeError) {
      console.error('Fee fetch error, using fallback:', feeError);
    }
    
    // Select enough UTXOs to cover amount + estimated fee
    let inputSats = 0;
    const selectedUtxos: any[] = [];
    
    console.log('Selecting UTXOs...');
    for (const utxo of utxos) {
      selectedUtxos.push(utxo);
      inputSats += utxo.value;
      
      // Estimate size: inputs * 148 + outputs * 34 + 10 overhead
      const estimatedSize = (selectedUtxos.length * 148) + (2 * 34) + 10;
      const estimatedFee = estimatedSize * satPerByte;
      
      console.log(`After ${selectedUtxos.length} UTXOs: input=${inputSats}, needed=${parsedAmount + estimatedFee}`);
      
      if (inputSats >= parsedAmount + estimatedFee) {
        console.log('Sufficient UTXOs selected');
        break;
      }
    }
    
    // Final fee calculation
    const finalSize = (selectedUtxos.length * 148) + (2 * 34) + 10;
    const finalFee = finalSize * satPerByte;
    
    console.log('Final calculation:', {
      inputSats,
      parsedAmount,
      finalFee,
      required: parsedAmount + finalFee
    });
    
    if (inputSats < parsedAmount + finalFee) {
      throw new Error(`Insufficient balance. Available: ${totalBalance} sats, Required: ${parsedAmount + finalFee} sats (including fee of ${finalFee})`);
    }
    
    // Calculate change
    const change = inputSats - parsedAmount - finalFee;
    console.log('Change amount:', change, 'sats');
    
    console.log('Transaction validation successful!');
    console.log('Transaction parameters:');
    console.log('- Selected UTXOs:', selectedUtxos.length);
    console.log('- Total input:', inputSats);
    console.log('- Amount to send:', parsedAmount);
    console.log('- Send to address:', sendToAddress);
    console.log('- Fee:', finalFee);
    console.log('- Change:', change);
    
    // Return successful validation response
    return new Response(JSON.stringify({
      success: true,
      message: 'Transaction parameters validated successfully',
      txid: 'mock_transaction_id_' + Date.now(),
      amountSats: parsedAmount,
      recipientAddress: sendToAddress,
      sendToAddress: sendToAddress,
      fee: finalFee,
      change: change > 546 ? change : 0,
      network: 'mainnet',
      senderAddress,
      inputsUsed: selectedUtxos.length,
      totalInput: inputSats,
      totalBalance,
      selectedUtxos: selectedUtxos.map(u => ({ txid: u.txid, vout: u.vout, value: u.value })),
      note: 'This is a validation-only response - no actual Bitcoin transaction was created or broadcasted'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ success: false, error: error.message, stack: error.stack }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});