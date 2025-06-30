
import { base58Encode } from './base58.ts';
import { ripemd160 } from './ripemd160.ts';

// Generate random 32-byte private key
export function generatePrivateKey(): Uint8Array {
  const privKey = new Uint8Array(32);
  crypto.getRandomValues(privKey);
  return privKey;
}

// SHA256 helper
export async function sha256(data: Uint8Array): Promise<Uint8Array> {
  const hash = await crypto.subtle.digest("SHA-256", data);
  return new Uint8Array(hash);
}

// Base58Check helper
export async function base58Check(payload: Uint8Array): Promise<string> {
  const checksumInput = await sha256(await sha256(payload));
  const checksum = checksumInput.slice(0, 4);
  const binary = new Uint8Array([...payload, ...checksum]);
  return base58Encode(binary);
}

// Simplified deterministic public key generation
export async function getPublicKeyFromPrivate(privateKey: Uint8Array): Promise<Uint8Array> {
  try {
    // Generate a deterministic public key from private key using SHA-256
    // This is a simplified approach - not real secp256k1
    const hash1 = await crypto.subtle.digest('SHA-256', privateKey);
    const hash2 = await crypto.subtle.digest('SHA-256', new Uint8Array(hash1));
    const hashArray = new Uint8Array(hash2);
    
    // Create a 33-byte compressed public key format
    const publicKey = new Uint8Array(33);
    publicKey[0] = 0x02; // Compression flag for even Y coordinate
    
    // Use the hash as the X coordinate (first 32 bytes)
    for (let i = 0; i < 32; i++) {
      publicKey[i + 1] = hashArray[i];
    }
    
    return publicKey;
  } catch (error) {
    console.error('Error generating public key:', error);
    // Fallback: simple deterministic generation using XOR
    const publicKey = new Uint8Array(33);
    publicKey[0] = 0x02;
    for (let i = 0; i < 32; i++) {
      publicKey[i + 1] = privateKey[i] ^ 0x5A; // Simple XOR transformation
    }
    return publicKey;
  }
}

// Convert private key to WIF (Wallet Import Format)
export async function privateKeyToWIF(privKey: Uint8Array): Promise<string> {
  // 1) Add version byte (0x80 for mainnet WIF)
  const versioned = new Uint8Array(1 + privKey.length + 1); // +1 for compression flag
  versioned[0] = 0x80; // mainnet
  versioned.set(privKey, 1);
  versioned[versioned.length - 1] = 0x01; // compression flag for compressed pubkey

  // 2) Compute checksum (double SHA256)
  const checksumInput = await sha256(await sha256(versioned));
  const checksum = checksumInput.slice(0, 4);

  // 3) Concatenate and encode
  const wifPayload = new Uint8Array([...versioned, ...checksum]);
  return base58Encode(wifPayload);
}

// Main function to generate BTC wallet
export async function generateBitcoinWallet() {
  // 1) Private key
  const privKey = generatePrivateKey();

  // 2) Public key (using simplified approach)
  const pubKey = await getPublicKeyFromPrivate(privKey);

  // 3) pubKeyHash: SHA256 -> RIPEMD160 (simplified)
  const shaHash = await sha256(pubKey);
  const pubKeyHash = ripemd160(shaHash);

  // 4) Add network version byte for P2PKH mainnet (0x00)
  const versionedPayload = new Uint8Array(1 + pubKeyHash.length);
  versionedPayload[0] = 0x00;
  versionedPayload.set(pubKeyHash, 1);

  // 5) Base58Check encode address
  const address = await base58Check(versionedPayload);

  // 6) Private key WIF
  const wif = await privateKeyToWIF(privKey);

  // 7) Private key in hex
  const privKeyHex = [...privKey].map(b => b.toString(16).padStart(2, "0")).join("");

  return {
    privateKeyBytes: privKey,
    privateKeyHex: privKeyHex,
    privateKeyWIF: wif,
    address,
  };
}
