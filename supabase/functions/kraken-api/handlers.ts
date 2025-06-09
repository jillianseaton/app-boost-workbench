
import { krakenRequest } from './client.ts';

export async function handleConnect(apiKey: string, apiSecret: string) {
  console.log('Testing Kraken connection...');
  
  try {
    // Test with account balance - this is a simple authenticated endpoint
    const accountBalance = await krakenRequest('Balance', {}, apiKey, apiSecret);
    console.log('Account balance retrieved successfully:', accountBalance);
    
    // Get additional account info if possible
    let tradeFee = 0.26; // Default fee
    let verification = 'intermediate';
    
    try {
      const tradeBalance = await krakenRequest('TradeBalance', {}, apiKey, apiSecret);
      console.log('Trade balance:', tradeBalance);
      
      // Extract fee information if available
      if (tradeBalance && tradeBalance.m) {
        tradeFee = parseFloat(tradeBalance.m) || 0.26;
      }
    } catch (feeError) {
      console.warn('Could not fetch trade balance (non-critical):', feeError);
    }
    
    return {
      connected: true,
      balances: accountBalance,
      tradeFee,
      verification
    };
  } catch (connectionError) {
    console.error('Connection test failed:', connectionError);
    
    // Provide more specific error messages based on common issues
    let errorMessage = connectionError.message;
    
    if (errorMessage.includes('EAPI:Invalid key')) {
      errorMessage = 'Invalid API key. Please check your Kraken API key is correct.';
    } else if (errorMessage.includes('EAPI:Invalid signature')) {
      errorMessage = 'Invalid API signature. Please check your Kraken API secret is correct.';
    } else if (errorMessage.includes('EAPI:Invalid nonce')) {
      errorMessage = 'Invalid nonce. Please try again.';
    } else if (errorMessage.includes('EGeneral:Permission denied')) {
      errorMessage = 'Permission denied. Please ensure your API key has "Query Funds" permission enabled.';
    }
    
    throw new Error(errorMessage);
  }
}

export async function handleBalances(apiKey: string, apiSecret: string) {
  console.log('Fetching account balances...');
  const balances = await krakenRequest('Balance', {}, apiKey, apiSecret);
  return { balances };
}

export async function handleWithdraw(params: any, apiKey: string, apiSecret: string) {
  console.log('Processing withdrawal...');
  const { asset, amount, address, method } = params;
  
  if (!asset || !amount || !address) {
    throw new Error('Asset, amount, and address are required for withdrawal');
  }
  
  if (method === 'bitcoin' || method === 'crypto') {
    console.log(`Withdrawing ${amount} ${asset} to ${address}`);
    
    const withdrawResult = await krakenRequest('Withdraw', {
      asset,
      key: address,
      amount
    }, apiKey, apiSecret);
    
    return {
      success: true,
      refid: withdrawResult.refid,
      message: `Withdrawal of ${amount} ${asset} initiated`
    };
  } else {
    console.log(`Withdrawing $${amount} USD via ${method}`);
    
    const withdrawResult = await krakenRequest('Withdraw', {
      asset: 'USD',
      key: method,
      amount
    }, apiKey, apiSecret);
    
    return {
      success: true,
      refid: withdrawResult.refid,
      message: `Fiat withdrawal of $${amount} USD initiated via ${method}`
    };
  }
}

export async function handleTradeHistory(apiKey: string, apiSecret: string) {
  console.log('Fetching trade history...');
  const trades = await krakenRequest('TradesHistory', {}, apiKey, apiSecret);
  return { trades };
}

export async function handleOpenOrders(apiKey: string, apiSecret: string) {
  console.log('Fetching open orders...');
  const orders = await krakenRequest('OpenOrders', {}, apiKey, apiSecret);
  return { orders };
}
