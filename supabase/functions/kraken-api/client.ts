
import { generateSignature } from './signature.ts';

// Kraken API base URL
const KRAKEN_API_URL = 'https://api.kraken.com';

// Make authenticated request to Kraken
export async function krakenRequest(endpoint: string, params: any, apiKey: string, apiSecret: string) {
  console.log(`Making Kraken API request to ${endpoint} with params:`, params);
  
  // Generate nonce (microseconds)
  const nonce = (Date.now() * 1000).toString();
  
  // Prepare form data
  const formParams = new URLSearchParams();
  formParams.append('nonce', nonce);
  
  // Add other parameters
  Object.keys(params).forEach(key => {
    if (params[key] !== undefined && params[key] !== null) {
      formParams.append(key, params[key].toString());
    }
  });
  
  const postData = formParams.toString();
  const path = `/0/private/${endpoint}`;
  
  console.log('Request path:', path);
  console.log('Post data:', postData);
  console.log('API Key (first 8 chars):', apiKey.substring(0, 8));
  
  try {
    const signature = await generateSignature(path, postData, apiSecret, nonce);

    const response = await fetch(`${KRAKEN_API_URL}${path}`, {
      method: 'POST',
      headers: {
        'API-Key': apiKey,
        'API-Sign': signature,
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Kraken REST API Client'
      },
      body: postData,
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    const responseText = await response.text();
    console.log('Raw response:', responseText);

    if (!response.ok) {
      console.error(`HTTP error: ${response.status} ${response.statusText}`);
      throw new Error(`HTTP ${response.status}: ${response.statusText} - ${responseText}`);
    }

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse JSON response:', parseError);
      throw new Error(`Invalid JSON response: ${responseText}`);
    }
    
    console.log('Parsed response:', data);
    
    if (data.error && data.error.length > 0) {
      console.error('Kraken API errors:', data.error);
      throw new Error(`Kraken API Error: ${data.error.join(', ')}`);
    }
    
    return data.result;
  } catch (error) {
    console.error(`Error in krakenRequest for ${endpoint}:`, error);
    throw error;
  }
}
