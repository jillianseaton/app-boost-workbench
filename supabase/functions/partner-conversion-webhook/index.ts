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

  console.log('Partner conversion webhook received:', req.method, req.url);

  try {
    // Create Supabase client with service role for database writes
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    const requestBody = await req.text();
    console.log('Webhook payload:', requestBody);

    // Parse webhook data based on partner network
    const webhookData = await parseWebhookData(req, requestBody);
    
    if (!webhookData.success) {
      throw new Error(webhookData.error || 'Failed to parse webhook data');
    }

    // Validate and process the conversion
    const conversionResult = await processConversion(supabase, webhookData);
    
    // Record commission if conversion is valid
    if (conversionResult.valid) {
      await recordRealCommission(supabase, conversionResult);
    }

    return new Response(JSON.stringify({
      success: true,
      conversionId: conversionResult.conversionId,
      commission: conversionResult.commission,
      status: conversionResult.status,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });

  } catch (error) {
    console.error('Error processing partner conversion webhook:', error);
    
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

async function parseWebhookData(req: Request, body: string) {
  const url = new URL(req.url);
  const network = url.searchParams.get('network');
  const partner = url.searchParams.get('partner');
  
  console.log('Parsing webhook for network:', network, 'partner:', partner);

  try {
    const data = JSON.parse(body);
    
    switch (network) {
      case 'commission_junction':
        return parseCJWebhook(data);
      case 'shopify_partners':
        return parseShopifyWebhook(data);
      case 'impact':
        return parseImpactWebhook(data);
      default:
        return parseGenericWebhook(data, partner);
    }
  } catch (error) {
    console.error('Error parsing webhook data:', error);
    return { success: false, error: 'Invalid webhook format' };
  }
}

function parseCJWebhook(data: any) {
  // Parse Commission Junction webhook
  console.log('Parsing CJ webhook:', data);
  
  return {
    success: true,
    network: 'commission_junction',
    conversionId: data.actionId || `cj_${Date.now()}`,
    orderId: data.orderId,
    partner: data.advertiserName || 'CJ Advertiser',
    amount: parseFloat(data.saleAmount || '0'),
    commission: parseFloat(data.commissionAmount || '0'),
    eventType: data.eventType || 'sale',
    status: data.actionStatus || 'pending',
    clickId: data.sid,
    timestamp: data.actionDate || new Date().toISOString(),
    rawData: data
  };
}

function parseShopifyWebhook(data: any) {
  // Parse Shopify Partners webhook
  console.log('Parsing Shopify webhook:', data);
  
  const commission = data.order_value ? (data.order_value * 0.20) : 0; // 20% commission rate
  
  return {
    success: true,
    network: 'shopify_partners',
    conversionId: data.order_id || `shopify_${Date.now()}`,
    orderId: data.order_id,
    partner: 'Shopify',
    amount: parseFloat(data.order_value || '0'),
    commission: commission,
    eventType: 'subscription',
    status: 'confirmed',
    clickId: data.click_id,
    timestamp: data.created_at || new Date().toISOString(),
    rawData: data
  };
}

function parseImpactWebhook(data: any) {
  // Parse Impact Radius webhook
  console.log('Parsing Impact webhook:', data);
  
  return {
    success: true,
    network: 'impact',
    conversionId: data.conversion_id || `impact_${Date.now()}`,
    orderId: data.order_id,
    partner: data.campaign_name || 'Impact Advertiser',
    amount: parseFloat(data.conversion_value || '0'),
    commission: parseFloat(data.payout_amount || '0'),
    eventType: data.event_type || 'conversion',
    status: data.status || 'pending',
    clickId: data.click_id,
    timestamp: data.conversion_date || new Date().toISOString(),
    rawData: data
  };
}

function parseGenericWebhook(data: any, partner: string | null) {
  // Parse generic partner webhook
  console.log('Parsing generic webhook for partner:', partner, data);
  
  return {
    success: true,
    network: 'direct',
    conversionId: data.conversion_id || data.order_id || `direct_${Date.now()}`,
    orderId: data.order_id,
    partner: partner || data.partner || 'Direct Partner',
    amount: parseFloat(data.amount || data.order_value || '0'),
    commission: parseFloat(data.commission || '0'),
    eventType: data.event_type || 'conversion',
    status: data.status || 'pending',
    clickId: data.click_id,
    timestamp: data.timestamp || new Date().toISOString(),
    rawData: data
  };
}

async function processConversion(supabase: any, webhookData: any) {
  console.log('Processing conversion:', webhookData.conversionId);
  
  // Validate conversion data
  const isValid = webhookData.amount > 0 && webhookData.commission > 0;
  
  if (!isValid) {
    console.log('Invalid conversion - no amount or commission');
    return {
      conversionId: webhookData.conversionId,
      valid: false,
      status: 'invalid',
      reason: 'No amount or commission'
    };
  }

  // Check for duplicate conversions
  const { data: existingConversion } = await supabase
    .from('affiliate_conversions')
    .select('*')
    .eq('conversion_id', webhookData.conversionId)
    .single();

  if (existingConversion) {
    console.log('Duplicate conversion detected:', webhookData.conversionId);
    return {
      conversionId: webhookData.conversionId,
      valid: false,
      status: 'duplicate',
      reason: 'Conversion already processed'
    };
  }

  return {
    conversionId: webhookData.conversionId,
    valid: true,
    status: 'confirmed',
    partner: webhookData.partner,
    amount: webhookData.amount,
    commission: webhookData.commission,
    network: webhookData.network,
    orderId: webhookData.orderId,
    eventType: webhookData.eventType,
    timestamp: webhookData.timestamp,
    rawData: webhookData.rawData
  };
}

async function recordRealCommission(supabase: any, conversionData: any) {
  console.log('Recording real commission:', conversionData.conversionId);
  
  try {
    // First, store the conversion record
    const { error: conversionError } = await supabase
      .from('affiliate_conversions')
      .insert({
        conversion_id: conversionData.conversionId,
        partner_name: conversionData.partner,
        network: conversionData.network,
        order_id: conversionData.orderId,
        amount_cents: Math.round(conversionData.amount * 100),
        commission_cents: Math.round(conversionData.commission * 100),
        event_type: conversionData.eventType,
        status: conversionData.status,
        raw_data: conversionData.rawData,
        processed_at: new Date().toISOString()
      });

    if (conversionError) {
      console.error('Error storing conversion:', conversionError);
    } else {
      console.log('Conversion stored successfully');
    }

    // Then, record the commission in the commissions table
    const { error: commissionError } = await supabase
      .from('commissions')
      .insert({
        user_id: 'system', // For now, assign to system - TODO: map to actual user
        amount_earned_cents: Math.round(conversionData.commission * 100),
        description: `Real ${conversionData.partner} affiliate commission - Order ${conversionData.orderId}`,
        source: 'affiliate_conversion',
        paid_out: false,
        created_at: new Date().toISOString()
      });

    if (commissionError) {
      console.error('Error recording commission:', commissionError);
      throw commissionError;
    }

    console.log('Real commission recorded successfully:', conversionData.commission);
    return true;

  } catch (error) {
    console.error('Error recording real commission:', error);
    throw error;
  }
}