
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, data } = await req.json();
    
    if (!action) {
      throw new Error('Action is required');
    }
    
    console.log('Processing affiliate income action:', { action, data });
    
    let result = {};
    
    switch (action) {
      case 'calculate_earnings':
        result = await calculateAffiliateEarnings(data);
        break;
      case 'track_commission':
        result = await trackCommissionIncome(data);
        break;
      case 'get_income_stats':
        result = await getIncomeStatistics(data);
        break;
      case 'process_payout':
        result = await processAffiliatePayout(data);
        break;
      case 'get_earnings_breakdown':
        result = await getEarningsBreakdown(data);
        break;
      default:
        throw new Error(`Unknown action: ${action}`);
    }
    
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('Error in affiliate income tracking:', error);
    
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

async function calculateAffiliateEarnings(data: any) {
  const { affiliateId, timeframe = 'monthly' } = data;
  
  // Simulate affiliate earnings calculation
  const baseEarnings = Math.random() * 500 + 100;
  const bonusEarnings = Math.random() * 100;
  const totalEarnings = baseEarnings + bonusEarnings;
  
  return {
    affiliateId,
    timeframe,
    earnings: {
      base: parseFloat(baseEarnings.toFixed(2)),
      bonus: parseFloat(bonusEarnings.toFixed(2)),
      total: parseFloat(totalEarnings.toFixed(2))
    },
    metrics: {
      conversions: Math.floor(Math.random() * 50) + 10,
      clicks: Math.floor(Math.random() * 1000) + 200,
      conversionRate: parseFloat((Math.random() * 5 + 2).toFixed(2)),
      averageOrderValue: parseFloat((Math.random() * 100 + 50).toFixed(2))
    },
    currency: 'USD',
    calculatedAt: new Date().toISOString()
  };
}

async function trackCommissionIncome(data: any) {
  const { affiliateId, orderId, orderValue, commissionRate } = data;
  const commissionAmount = orderValue * (commissionRate || 0.05);
  const incomeId = `income_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  return {
    success: true,
    incomeId,
    affiliateId,
    orderId,
    orderValue,
    commissionRate: commissionRate || 0.05,
    commissionAmount: parseFloat(commissionAmount.toFixed(2)),
    status: 'pending',
    recordedAt: new Date().toISOString(),
    expectedPayoutDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
  };
}

async function getIncomeStatistics(data: any) {
  const { affiliateId, period = 'last_30_days' } = data;
  
  return {
    affiliateId,
    period,
    totalIncome: parseFloat((Math.random() * 2000 + 500).toFixed(2)),
    pendingIncome: parseFloat((Math.random() * 300 + 50).toFixed(2)),
    paidIncome: parseFloat((Math.random() * 1500 + 300).toFixed(2)),
    breakdown: {
      affiliate: parseFloat((Math.random() * 800 + 200).toFixed(2)),
      referral: parseFloat((Math.random() * 600 + 150).toFixed(2)),
      bonus: parseFloat((Math.random() * 200 + 50).toFixed(2))
    },
    trends: {
      growthRate: parseFloat((Math.random() * 20 + 5).toFixed(1)),
      monthOverMonth: parseFloat((Math.random() * 30 + 10).toFixed(1))
    },
    nextPayout: {
      amount: parseFloat((Math.random() * 400 + 100).toFixed(2)),
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    }
  };
}

async function processAffiliatePayout(data: any) {
  const { affiliateId, amount, paymentMethod = 'bitcoin' } = data;
  const payoutId = `payout_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  return {
    success: true,
    payoutId,
    affiliateId,
    amount,
    paymentMethod,
    status: 'processing',
    processingFee: parseFloat((amount * 0.02).toFixed(2)),
    netAmount: parseFloat((amount * 0.98).toFixed(2)),
    requestedAt: new Date().toISOString(),
    estimatedCompletion: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
  };
}

async function getEarningsBreakdown(data: any) {
  const { affiliateId, startDate, endDate } = data;
  
  return {
    affiliateId,
    period: { startDate, endDate },
    dailyEarnings: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      amount: parseFloat((Math.random() * 50 + 10).toFixed(2)),
      conversions: Math.floor(Math.random() * 5) + 1
    })),
    topPerformingProducts: [
      { name: 'Premium Software License', earnings: 234.50, conversions: 8 },
      { name: 'Online Course Bundle', earnings: 189.30, conversions: 12 },
      { name: 'SaaS Subscription', earnings: 156.80, conversions: 6 }
    ],
    summary: {
      totalDays: 30,
      avgDailyEarnings: parseFloat((Math.random() * 30 + 15).toFixed(2)),
      bestDay: parseFloat((Math.random() * 80 + 40).toFixed(2)),
      worstDay: parseFloat((Math.random() * 10 + 2).toFixed(2))
    }
  };
}
