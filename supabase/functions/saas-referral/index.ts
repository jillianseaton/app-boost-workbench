
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
    
    console.log('Processing SaaS referral action:', { action, data });
    
    let result = {};
    
    switch (action) {
      case 'create_referral':
        result = await createReferral(data);
        break;
      case 'track_signup':
        result = await trackSignup(data);
        break;
      case 'track_subscription':
        result = await trackSubscription(data);
        break;
      case 'calculate_rewards':
        result = await calculateRewards(data);
        break;
      case 'get_referral_stats':
        result = await getReferralStats(data);
        break;
      case 'process_payout':
        result = await processPayout(data);
        break;
      default:
        throw new Error(`Unknown action: ${action}`);
    }
    
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('Error in SaaS referral:', error);
    
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

async function createReferral(data: any) {
  const referralCode = `REF_${Date.now()}_${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
  const referralLink = `https://earnflow.com/signup?ref=${referralCode}`;
  
  return {
    success: true,
    referralCode,
    referralLink,
    referrerId: data.referrerId,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days
    status: 'active',
    tier: data.tier || 'standard'
  };
}

async function trackSignup(data: any) {
  const signupId = `signup_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  return {
    success: true,
    signupId,
    referralCode: data.referralCode,
    newUserId: data.userId,
    email: data.email,
    signupDate: new Date().toISOString(),
    source: data.source || 'referral_link',
    ipAddress: data.ipAddress,
    userAgent: data.userAgent,
    status: 'pending_verification'
  };
}

async function trackSubscription(data: any) {
  const subscriptionId = `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const reward = calculateSubscriptionReward(data.plan, data.amount);
  
  return {
    success: true,
    subscriptionId,
    referralCode: data.referralCode,
    userId: data.userId,
    plan: data.plan,
    amount: data.amount,
    currency: data.currency || 'USD',
    reward,
    subscriptionDate: new Date().toISOString(),
    billingCycle: data.billingCycle || 'monthly',
    status: 'active'
  };
}

async function calculateRewards(data: any) {
  const { referrals = [], tier = 'standard' } = data;
  
  const tierMultipliers = {
    standard: 1.0,
    premium: 1.5,
    vip: 2.0
  };
  
  const multiplier = tierMultipliers[tier as keyof typeof tierMultipliers] || 1.0;
  
  let totalReward = 0;
  let breakdown = [];
  
  for (const referral of referrals) {
    const baseReward = referral.amount * 0.1; // 10% commission
    const finalReward = baseReward * multiplier;
    totalReward += finalReward;
    
    breakdown.push({
      userId: referral.userId,
      plan: referral.plan,
      amount: referral.amount,
      baseReward,
      finalReward,
      tier
    });
  }
  
  return {
    totalReward: parseFloat(totalReward.toFixed(2)),
    tierMultiplier: multiplier,
    breakdown,
    currency: 'USD',
    calculatedAt: new Date().toISOString()
  };
}

async function getReferralStats(data: any) {
  const referrerId = data.referrerId;
  
  // Simulate referral statistics
  return {
    referrerId,
    stats: {
      totalReferrals: Math.floor(Math.random() * 50) + 10,
      activeSubscriptions: Math.floor(Math.random() * 30) + 5,
      totalEarnings: parseFloat((Math.random() * 1000 + 200).toFixed(2)),
      thisMonthEarnings: parseFloat((Math.random() * 200 + 50).toFixed(2)),
      conversionRate: parseFloat((Math.random() * 15 + 5).toFixed(1)),
      averageOrderValue: parseFloat((Math.random() * 50 + 20).toFixed(2))
    },
    recentReferrals: [
      {
        userId: 'user_001',
        signupDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        plan: 'operator-license',
        status: 'active',
        reward: 9.99
      },
      {
        userId: 'user_002',
        signupDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        plan: 'operator-license',
        status: 'active',
        reward: 9.99
      }
    ],
    payouts: {
      pending: parseFloat((Math.random() * 100 + 20).toFixed(2)),
      processed: parseFloat((Math.random() * 500 + 100).toFixed(2)),
      nextPayoutDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    }
  };
}

async function processPayout(data: any) {
  const payoutId = `payout_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  return {
    success: true,
    payoutId,
    referrerId: data.referrerId,
    amount: data.amount,
    currency: data.currency || 'USD',
    method: data.method || 'bitcoin',
    address: data.address,
    status: 'processing',
    requestedAt: new Date().toISOString(),
    estimatedCompletion: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    fees: parseFloat((data.amount * 0.02).toFixed(2)), // 2% processing fee
    netAmount: parseFloat((data.amount * 0.98).toFixed(2))
  };
}

function calculateSubscriptionReward(plan: string, amount: number): number {
  const rewardRates = {
    'operator-license': 0.3, // 30% for operator license
    'premium': 0.2, // 20% for premium
    'basic': 0.1 // 10% for basic
  };
  
  const rate = rewardRates[plan as keyof typeof rewardRates] || 0.1;
  return parseFloat((amount * rate).toFixed(2));
}
