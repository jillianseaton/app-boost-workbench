
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SecureDepositRequest {
  amount: number; // Amount in USD
  bankAccountId: string;
  userBalance: number;
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

    const body: SecureDepositRequest = await req.json();
    const { amount, bankAccountId, userBalance } = body;

    console.log('Processing secure deposit:', { amount, bankAccountId, userId: user.id });

    // Validation checks
    if (!amount || amount < 10) {
      throw new Error('Minimum deposit amount is $10.00');
    }

    if (amount > userBalance) {
      throw new Error('Insufficient balance');
    }

    if (amount > 5000) {
      throw new Error('Maximum deposit amount is $5,000.00 per transaction');
    }

    // Get and verify bank account
    const { data: bankAccount, error: bankError } = await supabase
      .from('user_bank_accounts')
      .select('*')
      .eq('id', bankAccountId)
      .eq('user_id', user.id)
      .single();

    if (bankError || !bankAccount) {
      throw new Error('Bank account not found');
    }

    // CRITICAL: Only allow deposits to verified bank accounts
    if (bankAccount.verification_status !== 'verified') {
      throw new Error('Bank account must be verified before processing deposits. Current status: ' + bankAccount.verification_status);
    }

    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeKey) {
      throw new Error('Stripe secret key not configured');
    }

    const stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16' });

    // Create transfer to the verified bank account
    const transfer = await stripe.transfers.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'usd',
      destination: bankAccount.stripe_account_id,
      metadata: {
        user_id: user.id,
        bank_account_id: bankAccountId,
        source: 'earnflow_balance',
      },
    });

    // Log the secure deposit
    await supabase.from('bank_account_audit_log').insert({
      user_id: user.id,
      bank_account_id: bankAccountId,
      action: 'secure_deposit_processed',
      details: {
        amount: amount,
        stripe_transfer_id: transfer.id,
        verification_confirmed: true,
      },
      ip_address: req.headers.get('x-forwarded-for') || 'unknown',
      user_agent: req.headers.get('user-agent') || 'unknown',
    });

    const depositId = `secure_deposit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    return new Response(JSON.stringify({
      success: true,
      data: {
        depositId,
        amount: amount,
        status: 'processing',
        estimatedArrival: '1-2 business days',
        transferId: transfer.id,
        bankAccountLast4: bankAccount.account_number_last4,
        verificationConfirmed: true,
        message: 'Secure deposit initiated successfully to verified bank account.',
      },
      timestamp: new Date().toISOString(),
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Secure Deposit Error:', error);

    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Failed to process secure deposit',
      timestamp: new Date().toISOString(),
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
