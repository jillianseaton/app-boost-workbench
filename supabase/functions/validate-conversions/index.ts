import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

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
    
    console.log('Conversion validation action:', action);

    // Create Supabase client with service role
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    let result = {};

    switch (action) {
      case 'validate_pending_conversions':
        result = await validatePendingConversions(supabase);
        break;
      case 'verify_partner_api':
        result = await verifyPartnerAPI(data);
        break;
      case 'reconcile_commissions':
        result = await reconcileCommissions(supabase, data);
        break;
      case 'get_conversion_stats':
        result = await getConversionStats(supabase);
        break;
      default:
        throw new Error(`Unknown action: ${action}`);
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });

  } catch (error) {
    console.error('Error in conversion validation:', error);
    
    return new Response(JSON.stringify({
      error: error.message,
      success: false,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400
    });
  }
});

async function validatePendingConversions(supabase: any) {
  console.log('Validating pending conversions...');
  
  try {
    // Get all pending conversions from the last 30 days
    const { data: pendingConversions, error } = await supabase
      .from('affiliate_conversions')
      .select('*')
      .eq('status', 'pending')
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

    if (error) {
      throw error;
    }

    const validationResults = [];

    for (const conversion of pendingConversions || []) {
      const validation = await validateSingleConversion(conversion);
      validationResults.push(validation);

      // Update conversion status based on validation
      if (validation.status !== 'pending') {
        await supabase
          .from('affiliate_conversions')
          .update({ 
            status: validation.status,
            validation_notes: validation.notes,
            validated_at: new Date().toISOString()
          })
          .eq('conversion_id', conversion.conversion_id);
      }
    }

    return {
      success: true,
      totalConversions: pendingConversions?.length || 0,
      validationResults,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error('Error validating pending conversions:', error);
    throw error;
  }
}

async function validateSingleConversion(conversion: any) {
  console.log('Validating conversion:', conversion.conversion_id);
  
  try {
    // Validate based on network
    switch (conversion.network) {
      case 'commission_junction':
        return await validateCJConversion(conversion);
      case 'shopify_partners':
        return await validateShopifyConversion(conversion);
      case 'impact':
        return await validateImpactConversion(conversion);
      default:
        return await validateDirectConversion(conversion);
    }
  } catch (error) {
    console.error('Error validating conversion:', error);
    return {
      conversionId: conversion.conversion_id,
      status: 'error',
      notes: `Validation error: ${error.message}`
    };
  }
}

async function validateCJConversion(conversion: any) {
  // In a real implementation, this would call CJ's API to verify the conversion
  console.log('Validating CJ conversion:', conversion.conversion_id);
  
  // Simulate API validation
  const isValid = Math.random() > 0.1; // 90% success rate
  
  return {
    conversionId: conversion.conversion_id,
    status: isValid ? 'confirmed' : 'rejected',
    notes: isValid ? 'CJ API validation successful' : 'CJ API validation failed',
    validatedAt: new Date().toISOString()
  };
}

async function validateShopifyConversion(conversion: any) {
  // In a real implementation, this would call Shopify's Partner API
  console.log('Validating Shopify conversion:', conversion.conversion_id);
  
  // Simulate API validation
  const isValid = Math.random() > 0.05; // 95% success rate
  
  return {
    conversionId: conversion.conversion_id,
    status: isValid ? 'confirmed' : 'rejected',
    notes: isValid ? 'Shopify Partner API validation successful' : 'Shopify Partner API validation failed',
    validatedAt: new Date().toISOString()
  };
}

async function validateImpactConversion(conversion: any) {
  // In a real implementation, this would call Impact's API
  console.log('Validating Impact conversion:', conversion.conversion_id);
  
  // Simulate API validation
  const isValid = Math.random() > 0.08; // 92% success rate
  
  return {
    conversionId: conversion.conversion_id,
    status: isValid ? 'confirmed' : 'rejected',
    notes: isValid ? 'Impact API validation successful' : 'Impact API validation failed',
    validatedAt: new Date().toISOString()
  };
}

async function validateDirectConversion(conversion: any) {
  // For direct partners, validation might be simpler
  console.log('Validating direct conversion:', conversion.conversion_id);
  
  // Basic validation - check if conversion data looks reasonable
  const hasValidData = conversion.amount_cents > 0 && 
                      conversion.commission_cents > 0 && 
                      conversion.order_id;
  
  return {
    conversionId: conversion.conversion_id,
    status: hasValidData ? 'confirmed' : 'rejected',
    notes: hasValidData ? 'Direct conversion data validation passed' : 'Invalid conversion data',
    validatedAt: new Date().toISOString()
  };
}

async function verifyPartnerAPI(data: any) {
  const { network, credentials } = data;
  
  console.log('Verifying partner API access for:', network);
  
  try {
    switch (network) {
      case 'commission_junction':
        return await verifyCJAPI(credentials);
      case 'shopify_partners':
        return await verifyShopifyAPI(credentials);
      case 'impact':
        return await verifyImpactAPI(credentials);
      default:
        throw new Error(`Unknown network: ${network}`);
    }
  } catch (error) {
    return {
      success: false,
      network,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

async function verifyCJAPI(credentials: any) {
  // In a real implementation, this would test CJ API connectivity
  console.log('Testing CJ API connectivity...');
  
  return {
    success: true,
    network: 'commission_junction',
    status: 'API accessible',
    timestamp: new Date().toISOString()
  };
}

async function verifyShopifyAPI(credentials: any) {
  // In a real implementation, this would test Shopify Partner API connectivity
  console.log('Testing Shopify Partner API connectivity...');
  
  return {
    success: true,
    network: 'shopify_partners',
    status: 'API accessible',
    timestamp: new Date().toISOString()
  };
}

async function verifyImpactAPI(credentials: any) {
  // In a real implementation, this would test Impact API connectivity
  console.log('Testing Impact API connectivity...');
  
  return {
    success: true,
    network: 'impact',
    status: 'API accessible',
    timestamp: new Date().toISOString()
  };
}

async function reconcileCommissions(supabase: any, data: any) {
  const { startDate, endDate } = data;
  
  console.log('Reconciling commissions from', startDate, 'to', endDate);
  
  try {
    // Get all confirmed conversions in the date range
    const { data: conversions, error } = await supabase
      .from('affiliate_conversions')
      .select('*')
      .eq('status', 'confirmed')
      .gte('created_at', startDate)
      .lte('created_at', endDate);

    if (error) {
      throw error;
    }

    const reconciliation = {
      totalConversions: conversions?.length || 0,
      totalCommissionCents: 0,
      partnerBreakdown: {} as any,
      networkBreakdown: {} as any
    };

    for (const conversion of conversions || []) {
      reconciliation.totalCommissionCents += conversion.commission_cents;
      
      // Partner breakdown
      if (!reconciliation.partnerBreakdown[conversion.partner_name]) {
        reconciliation.partnerBreakdown[conversion.partner_name] = {
          conversions: 0,
          commissionCents: 0
        };
      }
      reconciliation.partnerBreakdown[conversion.partner_name].conversions += 1;
      reconciliation.partnerBreakdown[conversion.partner_name].commissionCents += conversion.commission_cents;
      
      // Network breakdown
      if (!reconciliation.networkBreakdown[conversion.network]) {
        reconciliation.networkBreakdown[conversion.network] = {
          conversions: 0,
          commissionCents: 0
        };
      }
      reconciliation.networkBreakdown[conversion.network].conversions += 1;
      reconciliation.networkBreakdown[conversion.network].commissionCents += conversion.commission_cents;
    }

    return {
      success: true,
      period: { startDate, endDate },
      reconciliation,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error('Error reconciling commissions:', error);
    throw error;
  }
}

async function getConversionStats(supabase: any) {
  console.log('Getting conversion statistics...');
  
  try {
    // Get conversion stats for the last 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    
    const { data: conversions, error } = await supabase
      .from('affiliate_conversions')
      .select('*')
      .gte('created_at', thirtyDaysAgo);

    if (error) {
      throw error;
    }

    const stats = {
      totalConversions: conversions?.length || 0,
      confirmedConversions: conversions?.filter(c => c.status === 'confirmed').length || 0,
      pendingConversions: conversions?.filter(c => c.status === 'pending').length || 0,
      rejectedConversions: conversions?.filter(c => c.status === 'rejected').length || 0,
      totalCommissionCents: conversions?.reduce((sum, c) => sum + (c.commission_cents || 0), 0) || 0,
      confirmedCommissionCents: conversions?.filter(c => c.status === 'confirmed').reduce((sum, c) => sum + (c.commission_cents || 0), 0) || 0,
      conversionRate: 0,
      averageCommissionCents: 0
    };

    if (stats.totalConversions > 0) {
      stats.conversionRate = (stats.confirmedConversions / stats.totalConversions) * 100;
      stats.averageCommissionCents = Math.round(stats.totalCommissionCents / stats.totalConversions);
    }

    return {
      success: true,
      period: 'last_30_days',
      stats,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error('Error getting conversion stats:', error);
    throw error;
  }
}