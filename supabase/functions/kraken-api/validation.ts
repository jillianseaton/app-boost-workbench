
export function validateApiCredentials(apiKey: string, apiSecret: string) {
  if (!apiKey || !apiSecret) {
    throw new Error('API key and secret are required');
  }

  // Validate API key format (should be base64-ish)
  if (!apiKey.trim() || !apiSecret.trim()) {
    throw new Error('API key and secret cannot be empty');
  }

  // Basic validation for Kraken API key format
  if (apiKey.length < 50 || apiSecret.length < 80) {
    throw new Error('API key or secret appears to be invalid format. Please check your Kraken API credentials.');
  }
}
