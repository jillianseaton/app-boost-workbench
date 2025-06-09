
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
    
    console.log('Processing ad revenue income action:', { action, data });
    
    let result = {};
    
    switch (action) {
      case 'calculate_ad_income':
        result = await calculateAdIncome(data);
        break;
      case 'track_revenue':
        result = await trackAdRevenue(data);
        break;
      case 'get_revenue_stats':
        result = await getRevenueStatistics(data);
        break;
      case 'optimize_income':
        result = await optimizeAdIncome(data);
        break;
      case 'get_income_forecast':
        result = await getIncomeForcast(data);
        break;
      default:
        throw new Error(`Unknown action: ${action}`);
    }
    
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('Error in ad revenue income tracking:', error);
    
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

async function calculateAdIncome(data: any) {
  const { publisherId, timeframe = 'daily', adUnits } = data;
  
  const totalImpressions = Math.floor(Math.random() * 100000) + 10000;
  const totalClicks = Math.floor(Math.random() * 2000) + 200;
  const cpm = parseFloat((Math.random() * 3 + 1.5).toFixed(2));
  const cpc = parseFloat((Math.random() * 0.5 + 0.2).toFixed(2));
  
  const impressionRevenue = (totalImpressions / 1000) * cpm;
  const clickRevenue = totalClicks * cpc;
  const totalRevenue = impressionRevenue + clickRevenue;
  
  return {
    publisherId,
    timeframe,
    metrics: {
      impressions: totalImpressions,
      clicks: totalClicks,
      ctr: parseFloat(((totalClicks / totalImpressions) * 100).toFixed(2)),
      cpm,
      cpc
    },
    revenue: {
      impressions: parseFloat(impressionRevenue.toFixed(2)),
      clicks: parseFloat(clickRevenue.toFixed(2)),
      total: parseFloat(totalRevenue.toFixed(2)),
      currency: 'USD'
    },
    breakdown: {
      display: parseFloat((totalRevenue * 0.6).toFixed(2)),
      video: parseFloat((totalRevenue * 0.3).toFixed(2)),
      native: parseFloat((totalRevenue * 0.1).toFixed(2))
    },
    calculatedAt: new Date().toISOString()
  };
}

async function trackAdRevenue(data: any) {
  const { publisherId, adUnitId, impressions, clicks, revenue } = data;
  const revenueId = `rev_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  return {
    success: true,
    revenueId,
    publisherId,
    adUnitId,
    metrics: {
      impressions: impressions || 0,
      clicks: clicks || 0,
      revenue: revenue || 0
    },
    performance: {
      ctr: impressions > 0 ? parseFloat(((clicks / impressions) * 100).toFixed(2)) : 0,
      rpm: impressions > 0 ? parseFloat(((revenue / impressions) * 1000).toFixed(2)) : 0,
      ecpm: parseFloat(((revenue / (impressions / 1000)) || 0).toFixed(2))
    },
    recordedAt: new Date().toISOString(),
    status: 'confirmed'
  };
}

async function getRevenueStatistics(data: any) {
  const { publisherId, period = 'last_30_days' } = data;
  
  return {
    publisherId,
    period,
    totalRevenue: parseFloat((Math.random() * 1000 + 200).toFixed(2)),
    dailyAverage: parseFloat((Math.random() * 50 + 10).toFixed(2)),
    trends: {
      growth: parseFloat((Math.random() * 25 + 5).toFixed(1)),
      bestPerformingDay: {
        date: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        revenue: parseFloat((Math.random() * 100 + 30).toFixed(2))
      }
    },
    adUnitPerformance: [
      { id: 'header_banner', revenue: parseFloat((Math.random() * 200 + 50).toFixed(2)), share: 40 },
      { id: 'sidebar_ads', revenue: parseFloat((Math.random() * 150 + 30).toFixed(2)), share: 35 },
      { id: 'content_native', revenue: parseFloat((Math.random() * 100 + 20).toFixed(2)), share: 25 }
    ],
    projectedIncome: {
      thisMonth: parseFloat((Math.random() * 800 + 200).toFixed(2)),
      nextMonth: parseFloat((Math.random() * 900 + 250).toFixed(2))
    }
  };
}

async function optimizeAdIncome(data: any) {
  const { publisherId, currentRevenue } = data;
  
  const optimizationSuggestions = [
    {
      type: 'placement',
      suggestion: 'Add sticky header ad unit for 15% revenue increase',
      potentialIncrease: parseFloat((currentRevenue * 0.15).toFixed(2)),
      difficulty: 'easy'
    },
    {
      type: 'format',
      suggestion: 'Implement video ads in content for 25% boost',
      potentialIncrease: parseFloat((currentRevenue * 0.25).toFixed(2)),
      difficulty: 'medium'
    },
    {
      type: 'targeting',
      suggestion: 'Enable geographic targeting for premium rates',
      potentialIncrease: parseFloat((currentRevenue * 0.18).toFixed(2)),
      difficulty: 'easy'
    }
  ];
  
  return {
    publisherId,
    currentRevenue,
    optimizations: optimizationSuggestions,
    totalPotentialIncrease: parseFloat(optimizationSuggestions.reduce((sum, opt) => sum + opt.potentialIncrease, 0).toFixed(2)),
    implementationPriority: optimizationSuggestions.sort((a, b) => b.potentialIncrease - a.potentialIncrease),
    estimatedImplementationTime: '2-4 weeks'
  };
}

async function getIncomeForcast(data: any) {
  const { publisherId, currentMetrics } = data;
  
  const forecastDays = 30;
  const baseRevenue = currentMetrics?.dailyRevenue || 25;
  
  const forecast = Array.from({ length: forecastDays }, (_, i) => {
    const variation = (Math.random() - 0.5) * 0.2; // ±20% variation
    const trendGrowth = i * 0.01; // 1% growth per day
    const revenue = baseRevenue * (1 + variation + trendGrowth);
    
    return {
      date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      estimatedRevenue: parseFloat(revenue.toFixed(2)),
      confidence: Math.max(85 - i * 0.5, 60) // Decreasing confidence over time
    };
  });
  
  return {
    publisherId,
    forecastPeriod: `${forecastDays} days`,
    totalProjectedRevenue: parseFloat(forecast.reduce((sum, day) => sum + day.estimatedRevenue, 0).toFixed(2)),
    dailyForecast: forecast,
    assumptions: {
      trafficGrowth: '1% daily',
      seasonalFactors: 'none',
      marketConditions: 'stable'
    },
    confidenceLevel: 'medium'
  };
}
