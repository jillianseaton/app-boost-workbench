# Commission Payout Coinbase Function

This Supabase Edge Function handles commission payouts using the Coinbase API.

## Environment Variables Required

The following environment variables must be set in your Supabase Edge Functions environment:

### Supabase Configuration
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key for database access

### Coinbase API Configuration  
- `COINBASE_API_KEY` - Your Coinbase API key
- `COINBASE_API_SECRET` - Your Coinbase API secret
- `COINBASE_ACCOUNT_ID` - The Coinbase BTC account/wallet ID to send from

## Functionality

1. **Fetches unpaid commissions** from the 'commissions' table for a specific user
2. **Calculates USD total** from all unpaid commissions 
3. **Gets current BTC price** using the get-btc-price function
4. **Converts USD to BTC** equivalent amount
5. **Enforces minimum payout** threshold ($10)
6. **Sends payout** using Coinbase API
7. **Marks commissions as paid** and stores transaction ID

## Request Format

```json
{
  "userId": "uuid-string",
  "coinbaseAddress": "bitcoin-address-or-coinbase-email"
}
```

## Response Format

### Success
```json
{
  "success": true,
  "userId": "uuid-string", 
  "totalUSD": 25.50,
  "btcAmount": "0.00068421",
  "btcPrice": 37285.50,
  "txid": "coinbase-transaction-id",
  "commissionsPaid": 3
}
```

### Error
```json
{
  "success": false,
  "error": "Error message",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Usage Example

```javascript
// Example of calling the function from your frontend
const { data, error } = await supabase.functions.invoke('commission-payout-coinbase', {
  body: {
    userId: 'user-uuid-here',
    coinbaseAddress: 'user@example.com' // or a BTC address
  }
});

if (error) {
  console.error('Payout failed:', error);
} else if (data.success) {
  console.log(`Payout successful! Sent ${data.btcAmount} BTC (${data.totalUSD} USD) - Transaction: ${data.txid}`);
} else {
  console.log('Payout not processed:', data.message);
}
```