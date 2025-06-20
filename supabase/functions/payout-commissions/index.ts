
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

    // Initialize Stripe with secret key
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeSecretKey) {
      throw new Error('STRIPE_SECRET_KEY not configured');
    }

    // Initialize Supabase client with service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Your hardcoded Stripe account ID
    const stripe_account_id = "acct_1RbjrwGgN5bGspWj";

    // Fetch unpaid commissions
    const { data: commissions, error: fetchError } = await supabase
      .from('commissions')
      .select('*')
      .eq('paid_out', false);

    if (fetchError) {
      console.error('Error fetching commissions:', fetchError);
      throw new Error(`Failed to fetch commissions: ${fetchError.message}`);
    }

    console.log(`Found ${commissions?.length || 0} unpaid commissions`);

    if (!commissions || commissions.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "No commissions to pay out",
          amount: 0
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Calculate total amount in cents
    const totalCents = commissions.reduce((sum, commission) => sum + commission.amount_earned_cents, 0);
    
    console.log(`Total payout amount: $${totalCents / 100}`);

    if (totalCents === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "No amount to pay out",
          amount: 0
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Create Stripe transfer
    const transferResponse = await fetch('https://api.stripe.com/v1/transfers', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${stripeSecretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        amount: totalCents.toString(),
        currency: 'usd',
        destination: stripe_account_id,
        description: `Commission payout for ${commissions.length} transactions`
      }),
    });

    if (!transferResponse.ok) {
      const errorText = await transferResponse.text();
      console.error('Stripe transfer failed:', errorText);
      throw new Error(`Stripe transfer failed: ${errorText}`);
    }

    const transfer = await transferResponse.json();
    console.log('Stripe transfer created:', transfer.id);

    // Mark commissions as paid
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
      // Note: Transfer was successful but database update failed
      // This should be handled by admin review
      throw new Error(`Payout sent but failed to update database: ${updateError.message}`);
    }

    console.log(`Successfully processed payout of $${totalCents / 100} for ${commissions.length} commissions`);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Commission payout processed successfully",
        amount: totalCents / 100,
        commissions_count: commissions.length,
        stripe_transfer_id: transfer.id
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
