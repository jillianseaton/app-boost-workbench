import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('Real-time commission tracking function called');
  
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
    
    console.log('Processing real-time commission action:', { action, data });
    
    let result = {};
    
    switch (action) {
      case 'record_commission':
        result = await recordRealCommission(supabase, data);
        break;
      case 'get_user_earnings':
        result = await getUserEarnings(supabase, data);
        break;
      case 'get_daily_earnings':
        result = await getDailyEarnings(supabase, data);
        break;
      case 'get_commission_history':
        result = await getCommissionHistory(supabase, data);
        break;
      case 'calculate_payout_amount':
        result = await calculatePayoutAmount(supabase, data);
        break;
      default:
        throw new Error(`Unknown action: ${action}`);
    }
    
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('Error in real-time commission tracking:', error);
    
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

async function recordRealCommission(supabase: any, data: any) {
  const { userId, amountCents, source, description } = data;
  
  if (!userId || !amountCents) {
    throw new Error('User ID and amount are required');
  }

  console.log(`Recording real commission: $${amountCents/100} for user ${userId}`);

  // Insert the commission into the database
  const { data: commission, error } = await supabase
    .from('commissions')
    .insert({
      user_id: userId,
      amount_earned_cents: amountCents,
      source: source || 'task_completion',
      description: description || 'Real-time commission earned',
      paid_out: false
    })
    .select()
    .single();

  if (error) {
    console.error('Error inserting commission:', error);
    throw new Error(`Failed to record commission: ${error.message}`);
  }

  // Get updated user totals
  const { data: totals } = await supabase
    .from('commissions')
    .select('amount_earned_cents')
    .eq('user_id', userId);

  const totalEarnings = totals?.reduce((sum, comm) => sum + comm.amount_earned_cents, 0) || 0;
  const unpaidEarnings = totals?.filter(comm => !comm.paid_out)
    .reduce((sum, comm) => sum + comm.amount_earned_cents, 0) || 0;

  return {
    success: true,
    commission,
    userTotals: {
      totalEarnings: totalEarnings / 100,
      unpaidEarnings: unpaidEarnings / 100,
      totalEarningsCents: totalEarnings,
      unpaidEarningsCents: unpaidEarnings
    },
    recordedAt: new Date().toISOString()
  };
}

async function getUserEarnings(supabase: any, data: any) {
  const { userId } = data;
  
  if (!userId) {
    throw new Error('User ID is required');
  }

  // Get all user commissions
  const { data: commissions, error } = await supabase
    .from('commissions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to get user earnings: ${error.message}`);
  }

  const totalEarnings = commissions?.reduce((sum, comm) => sum + comm.amount_earned_cents, 0) || 0;
  const paidEarnings = commissions?.filter(comm => comm.paid_out)
    .reduce((sum, comm) => sum + comm.amount_earned_cents, 0) || 0;
  const unpaidEarnings = commissions?.filter(comm => !comm.paid_out)
    .reduce((sum, comm) => sum + comm.amount_earned_cents, 0) || 0;

  // Get today's earnings using the database function
  const { data: todaysEarnings } = await supabase.rpc('get_todays_earnings', {
    user_uuid: userId
  });

  return {
    userId,
    earnings: {
      total: totalEarnings / 100,
      paid: paidEarnings / 100,
      unpaid: unpaidEarnings / 100,
      today: (todaysEarnings || 0) / 100
    },
    earningsCents: {
      total: totalEarnings,
      paid: paidEarnings,
      unpaid: unpaidEarnings,
      today: todaysEarnings || 0
    },
    commissionCount: commissions?.length || 0,
    unpaidCommissionCount: commissions?.filter(comm => !comm.paid_out).length || 0,
    lastEarning: commissions?.[0] || null
  };
}

async function getDailyEarnings(supabase: any, data: any) {
  const { userId, days = 30 } = data;
  
  if (!userId) {
    throw new Error('User ID is required');
  }

  // Get daily earnings from the daily_earnings table
  const { data: dailyEarnings, error } = await supabase
    .from('daily_earnings')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false })
    .limit(days);

  if (error) {
    throw new Error(`Failed to get daily earnings: ${error.message}`);
  }

  // Calculate trends
  const recentEarnings = dailyEarnings?.slice(0, 7) || [];
  const previousEarnings = dailyEarnings?.slice(7, 14) || [];
  
  const recentAvg = recentEarnings.reduce((sum, day) => sum + day.total_earnings_cents, 0) / (recentEarnings.length || 1);
  const previousAvg = previousEarnings.reduce((sum, day) => sum + day.total_earnings_cents, 0) / (previousEarnings.length || 1);
  
  const growthRate = previousAvg > 0 ? ((recentAvg - previousAvg) / previousAvg * 100) : 0;

  return {
    userId,
    period: `${days} days`,
    dailyEarnings: dailyEarnings?.map(day => ({
      date: day.date,
      earnings: day.total_earnings_cents / 100,
      earningsCents: day.total_earnings_cents
    })) || [],
    analytics: {
      totalDays: dailyEarnings?.length || 0,
      totalEarnings: dailyEarnings?.reduce((sum, day) => sum + day.total_earnings_cents, 0) / 100 || 0,
      averageDaily: (dailyEarnings?.reduce((sum, day) => sum + day.total_earnings_cents, 0) || 0) / (dailyEarnings?.length || 1) / 100,
      bestDay: Math.max(...(dailyEarnings?.map(day => day.total_earnings_cents) || [0])) / 100,
      growthRate: parseFloat(growthRate.toFixed(2))
    }
  };
}

async function getCommissionHistory(supabase: any, data: any) {
  const { userId, limit = 50, offset = 0 } = data;
  
  if (!userId) {
    throw new Error('User ID is required');
  }

  const { data: commissions, error, count } = await supabase
    .from('commissions')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    throw new Error(`Failed to get commission history: ${error.message}`);
  }

  return {
    userId,
    commissions: commissions?.map(comm => ({
      ...comm,
      amount_earned: comm.amount_earned_cents / 100
    })) || [],
    pagination: {
      total: count || 0,
      limit,
      offset,
      hasMore: (count || 0) > offset + limit
    }
  };
}

async function calculatePayoutAmount(supabase: any, data: any) {
  const { userId } = data;
  
  if (!userId) {
    throw new Error('User ID is required');
  }

  // Get all unpaid commissions
  const { data: unpaidCommissions, error } = await supabase
    .from('commissions')
    .select('*')
    .eq('user_id', userId)
    .eq('paid_out', false);

  if (error) {
    throw new Error(`Failed to calculate payout: ${error.message}`);
  }

  const totalUnpaidCents = unpaidCommissions?.reduce((sum, comm) => sum + comm.amount_earned_cents, 0) || 0;
  const totalUnpaidUSD = totalUnpaidCents / 100;

  // Get current BTC price for conversion calculation
  const { data: btcPriceData, error: priceError } = await supabase.functions.invoke('get-btc-price');
  
  let btcAmount = 0;
  let btcPrice = 0;
  
  if (!priceError && btcPriceData?.price) {
    btcPrice = btcPriceData.price;
    btcAmount = totalUnpaidUSD / btcPrice;
  }

  return {
    userId,
    payout: {
      totalUSD: totalUnpaidUSD,
      totalCents: totalUnpaidCents,
      btcAmount: btcAmount,
      btcPrice: btcPrice,
      satoshis: Math.floor(btcAmount * 100000000),
      commissionCount: unpaidCommissions?.length || 0
    },
    eligibleForPayout: totalUnpaidCents >= 1000, // Minimum $10 payout
    minimumPayout: {
      usd: 10,
      cents: 1000
    },
    unpaidCommissions: unpaidCommissions || []
  };
}