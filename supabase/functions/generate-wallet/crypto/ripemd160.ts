
// Helper function for left rotation
function rotateLeft(value: number, shift: number): number {
  return ((value << shift) | (value >>> (32 - shift))) >>> 0;
}

// Real RIPEMD160 implementation
export function ripemd160(data: Uint8Array): Uint8Array {
  // Initialize hash values
  let h0 = 0x67452301;
  let h1 = 0xEFCDAB89;
  let h2 = 0x98BADCFE;
  let h3 = 0x10325476;
  let h4 = 0xC3D2E1F0;
  
  // Pre-processing: adding padding bits
  const msgLen = data.length;
  const totalLen = msgLen + 9; // +1 for the '1' bit, +8 for the length
  const paddedLen = Math.ceil(totalLen / 64) * 64;
  const padded = new Uint8Array(paddedLen);
  
  // Copy original data
  padded.set(data);
  
  // Append '1' bit (as 0x80 byte)
  padded[msgLen] = 0x80;
  
  // Append length in bits as 64-bit little-endian
  const bitLen = msgLen * 8;
  const lenBytes = new Uint8Array(8);
  for (let i = 0; i < 8; i++) {
    lenBytes[i] = (bitLen >>> (i * 8)) & 0xFF;
  }
  padded.set(lenBytes, paddedLen - 8);
  
  // Process message in 512-bit chunks
  for (let chunk = 0; chunk < paddedLen; chunk += 64) {
    const w = new Array(16);
    
    // Break chunk into sixteen 32-bit little-endian words
    for (let i = 0; i < 16; i++) {
      const offset = chunk + i * 4;
      w[i] = padded[offset] | 
             (padded[offset + 1] << 8) | 
             (padded[offset + 2] << 16) | 
             (padded[offset + 3] << 24);
    }
    
    // Initialize hash value for this chunk
    let al = h0, bl = h1, cl = h2, dl = h3, el = h4;
    let ar = h0, br = h1, cr = h2, dr = h3, er = h4;
    
    // Left line
    for (let i = 0; i < 80; i++) {
      let f, k, r;
      
      if (i < 16) {
        f = bl ^ cl ^ dl;
        k = 0x00000000;
        r = i;
      } else if (i < 32) {
        f = (bl & cl) | (~bl & dl);
        k = 0x5A827999;
        r = [7, 4, 13, 1, 10, 6, 15, 3, 12, 0, 9, 5, 2, 14, 11, 8][i - 16];
      } else if (i < 48) {
        f = (bl | ~cl) ^ dl;
        k = 0x6ED9EBA1;
        r = [3, 10, 14, 4, 9, 15, 8, 1, 2, 7, 0, 6, 13, 11, 5, 12][i - 32];
      } else if (i < 64) {
        f = (bl & dl) | (cl & ~dl);
        k = 0x8F1BBCDC;
        r = [1, 9, 11, 10, 0, 8, 12, 4, 13, 3, 7, 15, 14, 5, 6, 2][i - 48];
      } else {
        f = bl ^ (cl | ~dl);
        k = 0xA953FD4E;
        r = [4, 0, 5, 9, 7, 12, 2, 10, 14, 1, 3, 8, 11, 6, 15, 13][i - 64];
      }
      
      const temp = (al + f + w[r] + k) >>> 0;
      const s = [11, 14, 15, 12, 5, 8, 7, 9, 11, 13, 14, 15, 6, 7, 9, 8,
                 7, 6, 8, 13, 11, 9, 7, 15, 7, 12, 15, 9, 11, 7, 13, 12,
                 11, 13, 6, 7, 14, 9, 13, 15, 14, 8, 13, 6, 5, 12, 7, 5,
                 11, 12, 14, 15, 14, 15, 9, 8, 9, 14, 5, 6, 8, 6, 5, 12,
                 9, 15, 5, 11, 6, 8, 13, 12, 5, 12, 13, 14, 11, 8, 5, 6][i];
      
      al = el;
      el = dl;
      dl = rotateLeft(cl, 10);
      cl = bl;
      bl = rotateLeft(temp, s);
    }
    
    // Right line
    for (let i = 0; i < 80; i++) {
      let f, k, r;
      
      if (i < 16) {
        f = br ^ (cr | ~dr);
        k = 0x50A28BE6;
        r = [5, 14, 7, 0, 9, 2, 11, 4, 13, 6, 15, 8, 1, 10, 3, 12][i];
      } else if (i < 32) {
        f = (br & dr) | (cr & ~dr);
        k = 0x5C4DD124;
        r = [6, 11, 3, 7, 0, 13, 5, 10, 14, 15, 8, 12, 4, 9, 1, 2][i - 16];
      } else if (i < 48) {
        f = (br | ~cr) ^ dr;
        k = 0x6D703EF3;
        r = [15, 5, 1, 3, 7, 14, 6, 9, 11, 8, 12, 2, 10, 0, 4, 13][i - 32];
      } else if (i < 64) {
        f = (br & cr) | (~br & dr);
        k = 0x7A6D76E9;
        r = [8, 6, 4, 1, 3, 11, 15, 0, 5, 12, 2, 13, 9, 7, 10, 14][i - 48];
      } else {
        f = br ^ cr ^ dr;
        k = 0x00000000;
        r = [12, 15, 10, 4, 1, 5, 8, 7, 6, 2, 13, 14, 0, 3, 9, 11][i - 64];
      }
      
      const temp = (ar + f + w[r] + k) >>> 0;
      const s = [8, 9, 9, 11, 13, 15, 15, 5, 7, 7, 8, 11, 14, 14, 12, 6,
                 9, 13, 15, 7, 12, 8, 9, 11, 7, 7, 12, 7, 6, 15, 13, 11,
                 9, 7, 15, 11, 8, 6, 6, 14, 12, 13, 5, 14, 13, 13, 7, 5,
                 15, 5, 8, 11, 14, 14, 6, 14, 6, 9, 12, 9, 12, 5, 15, 8,
                 8, 5, 12, 9, 12, 5, 14, 6, 8, 13, 6, 5, 15, 13, 11, 11][i];
      
      ar = er;
      er = dr;
      dr = rotateLeft(cr, 10);
      cr = br;
      br = rotateLeft(temp, s);
    }
    
    // Add this chunk's hash to result so far
    const temp = (h1 + cl + dr) >>> 0;
    h1 = (h2 + dl + er) >>> 0;
    h2 = (h3 + el + ar) >>> 0;
    h3 = (h4 + al + br) >>> 0;
    h4 = (h0 + bl + cr) >>> 0;
    h0 = temp;
  }
  
  // Produce the final hash value as a 160-bit (20-byte) array
  const result = new Uint8Array(20);
  for (let i = 0; i < 5; i++) {
    const h = [h0, h1, h2, h3, h4][i];
    result[i * 4] = h & 0xFF;
    result[i * 4 + 1] = (h >>> 8) & 0xFF;
    result[i * 4 + 2] = (h >>> 16) & 0xFF;
    result[i * 4 + 3] = (h >>> 24) & 0xFF;
  }
  
  return result;
}
