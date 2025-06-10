
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { withdrawalId } = await req.json();
    
    console.log('Checking withdrawal status:', withdrawalId);

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Check withdrawal status in database
    const { data: withdrawal, error } = await supabase
      .from('smart_contract_withdrawals')
      .select('*')
      .eq('withdrawal_id', withdrawalId)
      .single();

    if (error) {
      throw new Error(`Withdrawal not found: ${error.message}`);
    }

    const executed = withdrawal.status === 'executed';
    
    return new Response(JSON.stringify({
      success: true,
      executed,
      status: withdrawal.status,
      requestTxHash: withdrawal.request_tx_hash,
      executionTxHash: withdrawal.execution_tx_hash,
      finalGasFee: withdrawal.execution_gas_fee,
      errorMessage: withdrawal.error_message
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error checking withdrawal status:', error);
    
    return new Response(JSON.stringify({
      error: error.message,
      success: false
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
