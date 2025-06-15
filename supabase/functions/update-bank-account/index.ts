
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface UpdateBankAccountRequest {
  bankAccountId: string;
  routingNumber: string;
  accountNumber: string;
  updateReason: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const body: UpdateBankAccountRequest = await req.json();
    const { bankAccountId, routingNumber, accountNumber, updateReason } = body;

    console.log('Updating bank account for user:', user.id);

    // Get existing bank account
    const { data: existingAccount, error: fetchError } = await supabase
      .from('user_bank_accounts')
      .select('*')
      .eq('id', bankAccountId)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !existingAccount) {
      throw new Error('Bank account not found');
    }

    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeKey) {
      throw new Error('Stripe secret key not configured');
    }

    const stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16' });

    // Delete old external account from Stripe
    await stripe.accounts.deleteExternalAccount(
      existingAccount.stripe_account_id,
      existingAccount.bank_account_id
    );

    // Create new external account with updated details
    const newBankAccount = await stripe.accounts.createExternalAccount(
      existingAccount.stripe_account_id,
      {
        external_account: {
          object: 'bank_account',
          country: 'US',
          currency: 'usd',
          account_holder_name: existingAccount.account_holder_name,
          account_holder_type: 'individual',
          routing_number: routingNumber,
          account_number: accountNumber,
          account_type: 'checking',
        },
      }
    );

    // Update database with new account details
    const { data: updatedAccount, error: updateError } = await supabase
      .from('user_bank_accounts')
      .update({
        bank_account_id: newBankAccount.id,
        routing_number_last4: routingNumber.slice(-4),
        account_number_last4: accountNumber.slice(-4),
        verification_status: 'verifying',
        verified_at: null,
        update_reason: updateReason,
      })
      .eq('id', bankAccountId)
      .select()
      .single();

    if (updateError) {
      console.error('Database update error:', updateError);
      throw new Error('Failed to update bank account information');
    }

    // Log the update action
    await supabase.from('bank_account_audit_log').insert({
      user_id: user.id,
      bank_account_id: bankAccountId,
      action: 'updated',
      details: {
        update_reason: updateReason,
        previous_routing_last4: existingAccount.routing_number_last4,
        previous_account_last4: existingAccount.account_number_last4,
        new_routing_last4: routingNumber.slice(-4),
        new_account_last4: accountNumber.slice(-4),
      },
      ip_address: req.headers.get('x-forwarded-for') || 'unknown',
      user_agent: req.headers.get('user-agent') || 'unknown',
    });

    return new Response(JSON.stringify({
      success: true,
      data: {
        bankAccountId: updatedAccount.id,
        stripeAccountId: updatedAccount.stripe_account_id,
        verificationStatus: 'verifying',
        accountLast4: accountNumber.slice(-4),
        routingLast4: routingNumber.slice(-4),
        message: 'Bank account updated successfully. Micro-deposit verification will begin shortly.',
      },
      timestamp: new Date().toISOString(),
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Update Bank Account Error:', error);

    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Failed to update bank account',
      timestamp: new Date().toISOString(),
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
