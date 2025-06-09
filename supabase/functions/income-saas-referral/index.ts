
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
    
    console.log('Processing SaaS referral income action:', { action, data });
    
    let result = {};
    
    switch (action) {
      case 'calculate_referral_income':
        result = await calculateReferralIncome(data);
        break;
      case 'track_subscription_income':
        result = await trackSubscriptionIncome(data);
        break;
      case 'get_income_dashboard':
        result = await getIncomeDashboard(data);
        break;
      case 'process_commission_payout':
        result = await processCommissionPayout(data);
        break;
      case 'get_lifetime_value':
        result = await getLifetimeValue(data);
        break;
      default:
        throw new Error(`Unknown action: ${action}`);
    }
    
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('Error in SaaS referral income tracking:', error);
    
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

async function calculateReferralIncome(data: any) {
  const { referrerId, timeframe = 'monthly', tier = 'standard' } = data;
  
  const tierMultipliers = {
    standard: 1.0,
    premium: 1.5,
    vip: 2.0
  };
  
  const baseIncome = Math.random() * 800 + 200;
  const multiplier = tierMultipliers[tier as keyof typeof tierMultipliers] || 1.0;
  const totalIncome = baseIncome * multiplier;
  
  return {
    referrerId,
    timeframe,
    tier,
    income: {
      base: parseFloat(baseIncome.toFixed(2)),
      multiplier,
      total: parseFloat(totalIncome.toFixed(2))
    },
    sources: {
      newSignups: parseFloat((totalIncome * 0.4).toFixed(2)),
      renewals: parseFloat((totalIncome * 0.5).toFixed(2)),
      upgrades: parseFloat((totalIncome * 0.1).toFixed(2))
    },
    metrics: {
      referrals: Math.floor(Math.random() * 25) + 5,
      conversions: Math.floor(Math.random() * 15) + 3,
      conversionRate: parseFloat((Math.random() * 20 + 10).toFixed(1))
    },
    currency: 'USD',
    calculatedAt: new Date().toISOString()
  };
}

async function trackSubscriptionIncome(data: any) {
  const { referrerId, subscriptionId, plan, amount, billingCycle } = data;
  const incomeId = `sub_income_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const commissionRates = {
    'basic': 0.1,
    'premium': 0.15,
    'enterprise': 0.2
  };
  
  const rate = commissionRates[plan as keyof typeof commissionRates] || 0.1;
  const commissionAmount = amount * rate;
  
  return {
    success: true,
    incomeId,
    referrerId,
    subscriptionId,
    plan,
    amount,
    billingCycle,
    commission: {
      rate,
      amount: parseFloat(commissionAmount.toFixed(2)),
      type: 'subscription'
    },
    recurringIncome: {
      monthly: billingCycle === 'monthly' ? parseFloat(commissionAmount.toFixed(2)) : parseFloat((commissionAmount / 12).toFixed(2)),
      annual: billingCycle === 'annual' ? parseFloat(commissionAmount.toFixed(2)) : parseFloat((commissionAmount * 12).toFixed(2))
    },
    recordedAt: new Date().toISOString(),
    nextPayment: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
  };
}

async function getIncomeDashboard(data: any) {
  const { referrerId, period = 'last_30_days' } = data;
  
  return {
    referrerId,
    period,
    overview: {
      totalIncome: parseFloat((Math.random() * 3000 + 500).toFixed(2)),
      recurringIncome: parseFloat((Math.random() * 1500 + 300).toFixed(2)),
      oneTimeIncome: parseFloat((Math.random() * 800 + 200).toFixed(2)),
      pendingPayouts: parseFloat((Math.random() * 400 + 100).toFixed(2))
    },
    growth: {
      monthOverMonth: parseFloat((Math.random() * 40 + 10).toFixed(1)),
      quarterOverQuarter: parseFloat((Math.random() * 60 + 20).toFixed(1)),
      yearOverYear: parseFloat((Math.random() * 100 + 50).toFixed(1))
    },
    topPerformingReferrals: [
      { id: 'ref_001', plan: 'enterprise', monthlyValue: 299.99, commission: 59.99 },
      { id: 'ref_002', plan: 'premium', monthlyValue: 99.99, commission: 14.99 },
      { id: 'ref_003', plan: 'basic', monthlyValue: 29.99, commission: 2.99 }
    ],
    projections: {
      nextMonth: parseFloat((Math.random() * 2000 + 600).toFixed(2)),
      nextQuarter: parseFloat((Math.random() * 6000 + 1800).toFixed(2)),
      nextYear: parseFloat((Math.random() * 25000 + 7500).toFixed(2))
    },
    milestones: {
      nextPayout: {
        amount: parseFloat((Math.random() * 500 + 150).toFixed(2)),
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      },
      annualTarget: {
        target: 10000,
        current: parseFloat((Math.random() * 7000 + 2000).toFixed(2)),
        progress: parseFloat((Math.random() * 70 + 20).toFixed(1))
      }
    }
  };
}

async function processCommissionPayout(data: any) {
  const { referrerId, amount, paymentMethod = 'bitcoin', address } = data;
  const payoutId = `commission_payout_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const processingFees = {
    bitcoin: 0.01,
    paypal: 0.029,
    bank: 0.005
  };
  
  const feeRate = processingFees[paymentMethod as keyof typeof processingFees] || 0.02;
  const fee = amount * feeRate;
  const netAmount = amount - fee;
  
  return {
    success: true,
    payoutId,
    referrerId,
    gross: amount,
    fee,
    net: parseFloat(netAmount.toFixed(2)),
    paymentMethod,
    address,
    status: 'processing',
    estimatedCompletion: new Date(Date.now() + (paymentMethod === 'bitcoin' ? 2 : 5) * 24 * 60 * 60 * 1000).toISOString(),
    transactionDetails: {
      processingTime: paymentMethod === 'bitcoin' ? '1-2 hours' : '3-5 business days',
      confirmationRequired: paymentMethod === 'bitcoin'
    },
    requestedAt: new Date().toISOString()
  };
}

async function getLifetimeValue(data: any) {
  const { referrerId, customerId } = data;
  
  const customerData = {
    signupDate: new Date(Date.now() - Math.floor(Math.random() * 365) * 24 * 60 * 60 * 1000).toISOString(),
    currentPlan: 'premium',
    monthlyValue: 99.99,
    totalPaid: parseFloat((Math.random() * 1200 + 300).toFixed(2)),
    commissionEarned: parseFloat((Math.random() * 180 + 45).toFixed(2))
  };
  
  const projectedLTV = customerData.monthlyValue * 24; // 2 year average
  const projectedCommission = projectedLTV * 0.15;
  
  return {
    referrerId,
    customerId,
    current: {
      tenure: Math.floor((Date.now() - new Date(customerData.signupDate).getTime()) / (24 * 60 * 60 * 1000)),
      totalValue: customerData.totalPaid,
      commissionEarned: customerData.commissionEarned,
      monthlyRecurring: customerData.monthlyValue
    },
    projected: {
      lifetimeValue: parseFloat(projectedLTV.toFixed(2)),
      lifetimeCommission: parseFloat(projectedCommission.toFixed(2)),
      remainingValue: parseFloat((projectedLTV - customerData.totalPaid).toFixed(2))
    },
    analytics: {
      churnRisk: Math.random() < 0.2 ? 'high' : Math.random() < 0.5 ? 'medium' : 'low',
      upgradeOpportunity: Math.random() < 0.3 ? 'high' : 'low',
      satisfaction: parseFloat((Math.random() * 3 + 7).toFixed(1)) // 7-10 scale
    }
  };
}
