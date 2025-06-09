
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
    const { affiliateId, action, data } = await req.json();
    
    if (!affiliateId || !action) {
      throw new Error('Affiliate ID and action are required');
    }
    
    console.log('Processing affiliate action:', { affiliateId, action, data });
    
    let result = {};
    
    switch (action) {
      case 'track_click':
        result = await trackClick(affiliateId, data);
        break;
      case 'track_conversion':
        result = await trackConversion(affiliateId, data);
        break;
      case 'get_stats':
        result = await getAffiliateStats(affiliateId);
        break;
      case 'calculate_commission':
        result = await calculateCommission(affiliateId, data);
        break;
      default:
        throw new Error(`Unknown action: ${action}`);
    }
    
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('Error in affiliate tracking:', error);
    
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

async function trackClick(affiliateId: string, data: any) {
  const clickId = `click_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  return {
    success: true,
    clickId,
    affiliateId,
    timestamp: new Date().toISOString(),
    userAgent: data.userAgent || 'unknown',
    referrer: data.referrer || 'direct',
    ip: data.ip || 'unknown',
    country: data.country || 'unknown'
  };
}

async function trackConversion(affiliateId: string, data: any) {
  const conversionId = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const commissionAmount = calculateCommissionAmount(data.amount, data.commissionRate || 0.05);
  
  return {
    success: true,
    conversionId,
    affiliateId,
    orderId: data.orderId,
    amount: data.amount,
    commission: commissionAmount,
    commissionRate: data.commissionRate || 0.05,
    timestamp: new Date().toISOString(),
    product: data.product || 'unknown'
  };
}

async function getAffiliateStats(affiliateId: string) {
  // Simulate affiliate statistics
  return {
    affiliateId,
    totalClicks: Math.floor(Math.random() * 1000) + 100,
    totalConversions: Math.floor(Math.random() * 50) + 10,
    totalCommission: (Math.random() * 500 + 100).toFixed(2),
    conversionRate: ((Math.random() * 5 + 2)).toFixed(2) + '%',
    period: 'last_30_days',
    topProducts: [
      { name: 'StreamMax Pro', conversions: 15, commission: 149.85 },
      { name: 'FitTracker Elite', conversions: 8, commission: 319.92 },
      { name: 'CloudSync Business', conversions: 12, commission: 59.88 }
    ]
  };
}

async function calculateCommission(affiliateId: string, data: any) {
  const amount = data.amount || 0;
  const rate = data.commissionRate || 0.05;
  const commission = calculateCommissionAmount(amount, rate);
  
  return {
    affiliateId,
    orderAmount: amount,
    commissionRate: rate,
    commissionAmount: commission,
    currency: data.currency || 'USD',
    timestamp: new Date().toISOString()
  };
}

function calculateCommissionAmount(amount: number, rate: number): number {
  return parseFloat((amount * rate).toFixed(2));
}
