import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BitcoinWebhookPayload {
  transaction_id: string;
  address: string;
  amount: number; // in satoshis
  confirmations: number;
  block_height?: number;
  timestamp: string;
  status: 'pending' | 'confirmed' | 'failed';
  fee?: number;
  order_id?: string;
  user_id?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }), 
      { 
        status: 405, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }

  try {
    console.log('Bitcoin webhook received');
    
    // Create Supabase client with service role for database writes
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse webhook payload
    const webhookData: BitcoinWebhookPayload = await req.json();
    console.log('Webhook payload:', webhookData);

    // Validate required fields
    if (!webhookData.transaction_id || !webhookData.address || !webhookData.amount) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: transaction_id, address, amount' }), 
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Convert amount from satoshis to BTC for display
    const amountBTC = webhookData.amount / 100000000;

    // Update or create Bitcoin transaction record
    const { data: existingTransaction, error: fetchError } = await supabase
      .from('bitcoin_transactions')
      .select('*')
      .eq('transaction_id', webhookData.transaction_id)
      .maybeSingle();

    if (fetchError) {
      console.error('Error fetching existing transaction:', fetchError);
    }

    let transactionResult;
    
    if (existingTransaction) {
      // Update existing transaction
      transactionResult = await supabase
        .from('bitcoin_transactions')
        .update({
          confirmations: webhookData.confirmations,
          status: webhookData.status,
          block_height: webhookData.block_height,
          updated_at: new Date().toISOString(),
        })
        .eq('transaction_id', webhookData.transaction_id);

      console.log('Updated existing transaction:', webhookData.transaction_id);
    } else {
      // Create new transaction record
      transactionResult = await supabase
        .from('bitcoin_transactions')
        .insert({
          transaction_id: webhookData.transaction_id,
          address: webhookData.address,
          amount_satoshis: webhookData.amount,
          amount_btc: amountBTC,
          confirmations: webhookData.confirmations,
          status: webhookData.status,
          block_height: webhookData.block_height,
          fee_satoshis: webhookData.fee,
          user_id: webhookData.user_id,
          order_id: webhookData.order_id,
          created_at: new Date().toISOString(),
        });

      console.log('Created new transaction record:', webhookData.transaction_id);
    }

    if (transactionResult.error) {
      console.error('Database error:', transactionResult.error);
      return new Response(
        JSON.stringify({ error: 'Database operation failed' }), 
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Handle confirmed payments (typically 6+ confirmations for Bitcoin)
    if (webhookData.status === 'confirmed' && webhookData.confirmations >= 6) {
      console.log(`Payment confirmed with ${webhookData.confirmations} confirmations`);
      
      // Update order status if order_id is provided
      if (webhookData.order_id) {
        const { error: orderUpdateError } = await supabase
          .from('orders')
          .update({ 
            status: 'paid',
            payment_method: 'bitcoin',
            paid_at: new Date().toISOString(),
          })
          .eq('id', webhookData.order_id);

        if (orderUpdateError) {
          console.error('Error updating order status:', orderUpdateError);
        } else {
          console.log('Order status updated to paid:', webhookData.order_id);
        }
      }

      // Add commission if user_id is provided
      if (webhookData.user_id) {
        const commissionAmount = Math.floor(amountBTC * 0.01 * 100); // 1% commission in cents
        
        const { error: commissionError } = await supabase
          .from('commissions')
          .insert({
            user_id: webhookData.user_id,
            amount_earned_cents: commissionAmount,
            source: 'bitcoin_payment',
            description: `Bitcoin payment received: ${amountBTC} BTC`,
          });

        if (commissionError) {
          console.error('Error creating commission:', commissionError);
        } else {
          console.log('Commission created for user:', webhookData.user_id);
        }
      }
    }

    // Log the webhook for audit purposes
    const { error: logError } = await supabase
      .from('webhook_logs')
      .insert({
        webhook_type: 'bitcoin_payment',
        payload: webhookData,
        status: 'processed',
        processed_at: new Date().toISOString(),
      });

    if (logError) {
      console.error('Error logging webhook:', logError);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Bitcoin payment webhook processed successfully',
        transaction_id: webhookData.transaction_id,
      }), 
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Bitcoin webhook error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error.message 
      }), 
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});