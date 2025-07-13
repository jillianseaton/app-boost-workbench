import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('Real-time BTC earnings function called');
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { action, data } = await req.json();
    
    if (!action) {
      throw new Error('Action is required');
    }
    
    console.log('Processing real-time BTC earnings action:', { action, data });
    
    let result = {};
    
    switch (action) {
      case 'track_btc_transaction':
        result = await trackBTCTransaction(supabase, data);
        break;
      case 'get_btc_balance':
        result = await getBTCBalance(supabase, data);
        break;
      case 'get_btc_transactions':
        result = await getBTCTransactions(supabase, data);
        break;
      case 'update_transaction_status':
        result = await updateTransactionStatus(supabase, data);
        break;
      case 'calculate_btc_earnings':
        result = await calculateBTCEarnings(supabase, data);
        break;
      case 'check_transaction_confirmations':
        result = await checkTransactionConfirmations(supabase, data);
        break;
      default:
        throw new Error(`Unknown action: ${action}`);
    }
    
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('Error in real-time BTC earnings:', error);
    
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false,
      timestamp: new Date().toISOString()
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function trackBTCTransaction(supabase: any, data: any) {
  const { userId, transactionId, address, amountBTC, amountSatoshis, status = 'pending', orderId = null } = data;
  
  if (!userId || !transactionId || !address || (!amountBTC && !amountSatoshis)) {
    throw new Error('User ID, transaction ID, address, and amount are required');
  }

  const finalAmountBTC = amountBTC || (amountSatoshis / 100000000);
  const finalAmountSatoshis = amountSatoshis || Math.floor(amountBTC * 100000000);

  console.log(`Tracking real BTC transaction: ${finalAmountBTC} BTC (${finalAmountSatoshis} sats) for user ${userId}`);

  // Insert the transaction into the database
  const { data: transaction, error } = await supabase
    .from('bitcoin_transactions')
    .insert({
      transaction_id: transactionId,
      user_id: userId,
      address: address,
      amount_btc: finalAmountBTC,
      amount_satoshis: finalAmountSatoshis,
      status: status,
      order_id: orderId,
      confirmations: 0,
      fee_satoshis: 0
    })
    .select()
    .single();

  if (error) {
    console.error('Error inserting BTC transaction:', error);
    throw new Error(`Failed to track BTC transaction: ${error.message}`);
  }

  return {
    success: true,
    transaction,
    recordedAt: new Date().toISOString()
  };
}

async function getBTCBalance(supabase: any, data: any) {
  const { userId, address } = data;
  
  if (!userId) {
    throw new Error('User ID is required');
  }

  // Get all user's BTC transactions
  const { data: transactions, error } = await supabase
    .from('bitcoin_transactions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to get BTC balance: ${error.message}`);
  }

  // Calculate balances
  const totalBTC = transactions?.reduce((sum, tx) => {
    if (tx.status === 'confirmed' || tx.status === 'completed') {
      return sum + parseFloat(tx.amount_btc);
    }
    return sum;
  }, 0) || 0;

  const pendingBTC = transactions?.reduce((sum, tx) => {
    if (tx.status === 'pending') {
      return sum + parseFloat(tx.amount_btc);
    }
    return sum;
  }, 0) || 0;

  const totalSatoshis = Math.floor(totalBTC * 100000000);
  const pendingSatoshis = Math.floor(pendingBTC * 100000000);

  // Get current BTC price for USD equivalent
  const { data: btcPriceData } = await supabase.functions.invoke('get-btc-price');
  const btcPrice = btcPriceData?.price || 0;
  
  const totalUSD = totalBTC * btcPrice;
  const pendingUSD = pendingBTC * btcPrice;

  return {
    userId,
    address,
    balance: {
      confirmed: {
        btc: totalBTC,
        satoshis: totalSatoshis,
        usd: totalUSD
      },
      pending: {
        btc: pendingBTC,
        satoshis: pendingSatoshis,
        usd: pendingUSD
      },
      total: {
        btc: totalBTC + pendingBTC,
        satoshis: totalSatoshis + pendingSatoshis,
        usd: totalUSD + pendingUSD
      }
    },
    transactionCount: transactions?.length || 0,
    lastTransaction: transactions?.[0] || null,
    btcPrice: btcPrice
  };
}

async function getBTCTransactions(supabase: any, data: any) {
  const { userId, limit = 50, offset = 0, status = null } = data;
  
  if (!userId) {
    throw new Error('User ID is required');
  }

  let query = supabase
    .from('bitcoin_transactions')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (status) {
    query = query.eq('status', status);
  }

  const { data: transactions, error, count } = await query;

  if (error) {
    throw new Error(`Failed to get BTC transactions: ${error.message}`);
  }

  return {
    userId,
    transactions: transactions || [],
    pagination: {
      total: count || 0,
      limit,
      offset,
      hasMore: (count || 0) > offset + limit
    },
    filter: { status }
  };
}

async function updateTransactionStatus(supabase: any, data: any) {
  const { transactionId, status, confirmations = null, blockHeight = null, feeSatoshis = null } = data;
  
  if (!transactionId || !status) {
    throw new Error('Transaction ID and status are required');
  }

  const updateData: any = {
    status: status,
    updated_at: new Date().toISOString()
  };

  if (confirmations !== null) updateData.confirmations = confirmations;
  if (blockHeight !== null) updateData.block_height = blockHeight;
  if (feeSatoshis !== null) updateData.fee_satoshis = feeSatoshis;

  const { data: transaction, error } = await supabase
    .from('bitcoin_transactions')
    .update(updateData)
    .eq('transaction_id', transactionId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update transaction status: ${error.message}`);
  }

  console.log(`Updated transaction ${transactionId} status to ${status}`);

  return {
    success: true,
    transaction,
    updatedAt: new Date().toISOString()
  };
}

async function calculateBTCEarnings(supabase: any, data: any) {
  const { userId, timeframe = 'all' } = data;
  
  if (!userId) {
    throw new Error('User ID is required');
  }

  let query = supabase
    .from('bitcoin_transactions')
    .select('*')
    .eq('user_id', userId);

  // Apply timeframe filter
  if (timeframe !== 'all') {
    const now = new Date();
    let startDate: Date;
    
    switch (timeframe) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(0); // All time
    }
    
    query = query.gte('created_at', startDate.toISOString());
  }

  const { data: transactions, error } = await query;

  if (error) {
    throw new Error(`Failed to calculate BTC earnings: ${error.message}`);
  }

  // Calculate earnings by status
  const earnings = {
    confirmed: { btc: 0, satoshis: 0, count: 0 },
    pending: { btc: 0, satoshis: 0, count: 0 },
    failed: { btc: 0, satoshis: 0, count: 0 },
    total: { btc: 0, satoshis: 0, count: 0 }
  };

  transactions?.forEach(tx => {
    const btcAmount = parseFloat(tx.amount_btc);
    const satoshiAmount = parseInt(tx.amount_satoshis);
    
    if (tx.status === 'confirmed' || tx.status === 'completed') {
      earnings.confirmed.btc += btcAmount;
      earnings.confirmed.satoshis += satoshiAmount;
      earnings.confirmed.count++;
    } else if (tx.status === 'pending') {
      earnings.pending.btc += btcAmount;
      earnings.pending.satoshis += satoshiAmount;
      earnings.pending.count++;
    } else if (tx.status === 'failed') {
      earnings.failed.btc += btcAmount;
      earnings.failed.satoshis += satoshiAmount;
      earnings.failed.count++;
    }
    
    earnings.total.btc += btcAmount;
    earnings.total.satoshis += satoshiAmount;
    earnings.total.count++;
  });

  // Get current BTC price for USD calculations
  const { data: btcPriceData } = await supabase.functions.invoke('get-btc-price');
  const btcPrice = btcPriceData?.price || 0;

  // Add USD values
  Object.keys(earnings).forEach(key => {
    earnings[key].usd = earnings[key].btc * btcPrice;
  });

  return {
    userId,
    timeframe,
    earnings,
    btcPrice,
    transactions: transactions || [],
    calculatedAt: new Date().toISOString()
  };
}

async function checkTransactionConfirmations(supabase: any, data: any) {
  const { transactionId } = data;
  
  if (!transactionId) {
    throw new Error('Transaction ID is required');
  }

  // Get the transaction from database
  const { data: transaction, error } = await supabase
    .from('bitcoin_transactions')
    .select('*')
    .eq('transaction_id', transactionId)
    .single();

  if (error) {
    throw new Error(`Failed to get transaction: ${error.message}`);
  }

  // In a real implementation, you would check the blockchain for confirmations
  // For now, we'll simulate this by checking if enough time has passed
  const createdAt = new Date(transaction.created_at);
  const now = new Date();
  const minutesPassed = (now.getTime() - createdAt.getTime()) / (1000 * 60);
  
  let confirmations = transaction.confirmations || 0;
  let status = transaction.status;
  
  // Simulate confirmations accumulating over time
  if (status === 'pending') {
    if (minutesPassed > 10) { // After 10 minutes, start getting confirmations
      confirmations = Math.min(6, Math.floor(minutesPassed / 10));
      if (confirmations >= 3) {
        status = 'confirmed';
      }
    }
  }

  // Update transaction if status changed
  if (confirmations !== transaction.confirmations || status !== transaction.status) {
    await supabase
      .from('bitcoin_transactions')
      .update({
        confirmations: confirmations,
        status: status,
        updated_at: new Date().toISOString()
      })
      .eq('transaction_id', transactionId);
  }

  return {
    transactionId: transactionId,
    confirmations: confirmations,
    status: status,
    requiredConfirmations: 3,
    isConfirmed: confirmations >= 3,
    minutesSinceCreated: Math.floor(minutesPassed),
    estimatedTimeToConfirmation: confirmations < 3 ? `${Math.max(0, 30 - minutesPassed)} minutes` : 'Confirmed',
    checkedAt: new Date().toISOString()
  };
}