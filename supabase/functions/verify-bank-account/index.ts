
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface VerifyBankAccountRequest {
  bankAccountId: string;
  amounts: [number, number]; // Two micro-deposit amounts in cents
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

    const body: VerifyBankAccountRequest = await req.json();
    const { bankAccountId, amounts } = body;

    console.log('Verifying bank account:', bankAccountId);

    // Get bank account from database
    const { data: bankAccount, error: bankError } = await supabase
      .from('user_bank_accounts')
      .select('*')
      .eq('id', bankAccountId)
      .eq('user_id', user.id)
      .single();

    if (bankError || !bankAccount) {
      throw new Error('Bank account not found');
    }

    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeKey) {
      throw new Error('Stripe secret key not configured');
    }

    const stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16' });

    // Verify the micro-deposits with Stripe
    const verification = await stripe.accounts.verifyExternalAccount(
      bankAccount.stripe_account_id,
      bankAccount.bank_account_id,
      {
        amounts: amounts,
      }
    );

    // Update verification status based on Stripe response
    const verificationStatus = verification.status === 'verified' ? 'verified' : 'failed';
    
    const { error: updateError } = await supabase
      .from('user_bank_accounts')
      .update({
        verification_status: verificationStatus,
        verified_at: verificationStatus === 'verified' ? new Date().toISOString() : null,
      })
      .eq('id', bankAccountId);

    if (updateError) {
      throw new Error('Failed to update verification status');
    }

    // Log the verification attempt
    await supabase.from('bank_account_audit_log').insert({
      user_id: user.id,
      bank_account_id: bankAccountId,
      action: verificationStatus === 'verified' ? 'verified' : 'verification_failed',
      details: {
        verification_method: 'micro_deposits',
        stripe_status: verification.status,
      },
      ip_address: req.headers.get('x-forwarded-for') || 'unknown',
      user_agent: req.headers.get('user-agent') || 'unknown',
    });

    return new Response(JSON.stringify({
      success: true,
      data: {
        bankAccountId: bankAccountId,
        verificationStatus: verificationStatus,
        message: verificationStatus === 'verified' 
          ? 'Bank account verified successfully! You can now process deposits.'
          : 'Verification failed. Please check the amounts and try again.',
      },
      timestamp: new Date().toISOString(),
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Verify Bank Account Error:', error);

    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Failed to verify bank account',
      timestamp: new Date().toISOString(),
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
