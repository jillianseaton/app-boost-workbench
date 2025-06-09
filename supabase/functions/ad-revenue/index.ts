
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
    
    console.log('Processing ad revenue action:', { action, data });
    
    let result = {};
    
    switch (action) {
      case 'track_impression':
        result = await trackImpression(data);
        break;
      case 'track_click':
        result = await trackAdClick(data);
        break;
      case 'calculate_revenue':
        result = await calculateAdRevenue(data);
        break;
      case 'get_performance':
        result = await getAdPerformance(data);
        break;
      case 'optimize_placement':
        result = await optimizePlacement(data);
        break;
      default:
        throw new Error(`Unknown action: ${action}`);
    }
    
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('Error in ad revenue tracking:', error);
    
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

async function trackImpression(data: any) {
  const impressionId = `imp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  return {
    success: true,
    impressionId,
    adId: data.adId,
    placementId: data.placementId,
    userId: data.userId,
    timestamp: new Date().toISOString(),
    viewDuration: data.viewDuration || 0,
    visible: data.visible || true,
    deviceType: data.deviceType || 'desktop'
  };
}

async function trackAdClick(data: any) {
  const clickId = `adclick_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const revenue = calculateClickRevenue(data.adType, data.cpc);
  
  return {
    success: true,
    clickId,
    adId: data.adId,
    placementId: data.placementId,
    userId: data.userId,
    revenue,
    cpc: data.cpc || 0.25,
    timestamp: new Date().toISOString(),
    targetUrl: data.targetUrl
  };
}

async function calculateAdRevenue(data: any) {
  const { impressions = 0, clicks = 0, cpm = 2.5, cpc = 0.25 } = data;
  
  const impressionRevenue = (impressions / 1000) * cpm;
  const clickRevenue = clicks * cpc;
  const totalRevenue = impressionRevenue + clickRevenue;
  
  return {
    impressions,
    clicks,
    cpm,
    cpc,
    impressionRevenue: parseFloat(impressionRevenue.toFixed(2)),
    clickRevenue: parseFloat(clickRevenue.toFixed(2)),
    totalRevenue: parseFloat(totalRevenue.toFixed(2)),
    ctr: impressions > 0 ? parseFloat(((clicks / impressions) * 100).toFixed(2)) : 0,
    period: data.period || 'today'
  };
}

async function getAdPerformance(data: any) {
  const placementId = data.placementId || 'default';
  
  return {
    placementId,
    metrics: {
      impressions: Math.floor(Math.random() * 10000) + 1000,
      clicks: Math.floor(Math.random() * 200) + 50,
      revenue: parseFloat((Math.random() * 100 + 20).toFixed(2)),
      ctr: parseFloat((Math.random() * 2 + 1).toFixed(2)),
      cpm: parseFloat((Math.random() * 3 + 1.5).toFixed(2)),
      fillRate: parseFloat((Math.random() * 20 + 80).toFixed(1))
    },
    topAds: [
      { id: 'ad_001', impressions: 2500, clicks: 45, revenue: 28.75 },
      { id: 'ad_002', impressions: 1800, clicks: 32, revenue: 21.60 },
      { id: 'ad_003', impressions: 2200, clicks: 38, revenue: 24.20 }
    ],
    timestamp: new Date().toISOString()
  };
}

async function optimizePlacement(data: any) {
  const recommendations = [
    {
      type: 'position',
      suggestion: 'Move ad placement 20px higher for better visibility',
      expectedImprovement: '15% CTR increase'
    },
    {
      type: 'timing',
      suggestion: 'Show ads after 3 seconds of page load',
      expectedImprovement: '8% revenue increase'
    },
    {
      type: 'format',
      suggestion: 'Try banner format instead of square',
      expectedImprovement: '12% engagement boost'
    }
  ];
  
  return {
    placementId: data.placementId,
    currentPerformance: {
      ctr: 2.3,
      revenue: 45.67,
      fillRate: 87.5
    },
    recommendations,
    optimizationScore: 78,
    timestamp: new Date().toISOString()
  };
}

function calculateClickRevenue(adType: string = 'display', cpc: number = 0.25): number {
  const multipliers = {
    display: 1.0,
    video: 1.5,
    native: 1.2,
    interstitial: 2.0
  };
  
  const multiplier = multipliers[adType as keyof typeof multipliers] || 1.0;
  return parseFloat((cpc * multiplier).toFixed(2));
}
