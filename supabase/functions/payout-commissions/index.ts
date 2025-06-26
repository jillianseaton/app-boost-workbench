
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting commission payout process...');

    // Get the authorization header to identify the user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Authorization header required');
    }

    // Initialize Supabase client with service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the user from the auth header
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Invalid authentication');
    }

    console.log('Processing payout for user:', user.id);

    // Fetch unpaid commissions for this specific user
    const { data: commissions, error: fetchError } = await supabase
      .from('commissions')
      .select('*')
      .eq('user_id', user.id)
      .eq('paid_out', false);

    if (fetchError) {
      console.error('Error fetching commissions:', fetchError);
      throw new Error(`Failed to fetch commissions: ${fetchError.message}`);
    }

    console.log(`Found ${commissions?.length || 0} unpaid commissions for user ${user.id}`);

    if (!commissions || commissions.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "No commissions to pay out",
          amount: 0,
          commissions_count: 0
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Calculate total amount in cents
    const totalCents = commissions.reduce((sum, commission) => sum + commission.amount_earned_cents, 0);
    
    console.log(`Total payout amount for user ${user.id}: $${totalCents / 100}`);

    if (totalCents === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "No amount to pay out",
          amount: 0,
          commissions_count: commissions.length
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // For now, we'll simulate the payout process since we need proper Stripe setup
    // In a real implementation, you would:
    // 1. Create a payout to the user's bank account OR
    // 2. Transfer to their connected Stripe account OR  
    // 3. Add funds to their internal balance
    
    console.log('Simulating payout process - marking commissions as paid');

    // Mark commissions as paid with current timestamp
    const commissionIds = commissions.map(c => c.id);
    const { error: updateError } = await supabase
      .from('commissions')
      .update({ 
        paid_out: true, 
        paid_at: new Date().toISOString() 
      })
      .in('id', commissionIds);

    if (updateError) {
      console.error('Error updating commissions:', updateError);
      throw new Error(`Failed to update commissions: ${updateError.message}`);
    }

    console.log(`Successfully processed payout of $${totalCents / 100} for ${commissions.length} commissions for user ${user.id}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Commission payout processed successfully",
        amount: totalCents / 100,
        commissions_count: commissions.length,
        note: "Commissions marked as paid. In production, this would transfer funds to your account."
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Commission payout error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
