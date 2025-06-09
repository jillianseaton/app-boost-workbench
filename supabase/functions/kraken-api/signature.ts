
// Kraken API signature generation utility
export async function generateSignature(path: string, postData: string, secret: string, nonce: string): Promise<string> {
  console.log('Generating signature for path:', path);
  console.log('Post data:', postData);
  console.log('Nonce:', nonce);
  
  try {
    // Decode the base64 secret
    const secretBuffer = Uint8Array.from(atob(secret), c => c.charCodeAt(0));
    
    // Create the message: nonce + postdata
    const message = nonce + postData;
    const messageBuffer = new TextEncoder().encode(message);
    
    // Hash the message with SHA256
    const messageHash = await crypto.subtle.digest('SHA-256', messageBuffer);
    
    // Combine path and message hash
    const pathBuffer = new TextEncoder().encode(path);
    const combinedBuffer = new Uint8Array(pathBuffer.length + messageHash.byteLength);
    combinedBuffer.set(pathBuffer);
    combinedBuffer.set(new Uint8Array(messageHash), pathBuffer.length);
    
    // Import the secret key for HMAC
    const key = await crypto.subtle.importKey(
      'raw',
      secretBuffer,
      { name: 'HMAC', hash: 'SHA-512' },
      false,
      ['sign']
    );
    
    // Generate HMAC signature
    const signature = await crypto.subtle.sign('HMAC', key, combinedBuffer);
    
    // Convert to base64
    const signatureBase64 = btoa(String.fromCharCode(...new Uint8Array(signature)));
    console.log('Generated signature successfully');
    
    return signatureBase64;
  } catch (error) {
    console.error('Error generating signature:', error);
    throw error;
  }
}
