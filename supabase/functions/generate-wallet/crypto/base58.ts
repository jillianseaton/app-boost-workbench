
// Base58 encoding implementation
const BASE58_ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

export function base58Encode(buffer: Uint8Array): string {
  if (buffer.length === 0) return '';
  
  let digits = [0];
  for (let i = 0; i < buffer.length; i++) {
    let carry = buffer[i];
    for (let j = 0; j < digits.length; j++) {
      carry += digits[j] << 8;
      digits[j] = carry % 58;
      carry = Math.floor(carry / 58);
    }
    while (carry > 0) {
      digits.push(carry % 58);
      carry = Math.floor(carry / 58);
    }
  }
  
  // Add leading zeros
  let leadingZeros = 0;
  for (let i = 0; i < buffer.length && buffer[i] === 0; i++) {
    leadingZeros++;
  }
  
  return '1'.repeat(leadingZeros) + digits.reverse().map(d => BASE58_ALPHABET[d]).join('');
}
