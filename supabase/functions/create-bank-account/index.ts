
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CreateBankAccountRequest {
  accountHolderName: string;
  routingNumber: string;
  accountNumber: string;
  accountType: 'checking' | 'savings';
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

    const body: CreateBankAccountRequest = await req.json();
    const { accountHolderName, routingNumber, accountNumber, accountType } = body;

    console.log('Creating bank account for user:', user.id);

    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeKey) {
      throw new Error('Stripe secret key not configured');
    }

    const stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16' });

    // Create or get existing Connect account for user
    let connectAccount;
    try {
      // Check if user already has a Connect account
      const { data: existingAccount } = await supabase
        .from('user_bank_accounts')
        .select('stripe_account_id')
        .eq('user_id', user.id)
        .limit(1)
        .single();

      if (existingAccount?.stripe_account_id) {
        connectAccount = await stripe.accounts.retrieve(existingAccount.stripe_account_id);
      } else {
        // Create new Express account
        connectAccount = await stripe.accounts.create({
          type: 'express',
          email: user.email,
          capabilities: {
            transfers: { requested: true },
          },
          business_type: 'individual',
        });
      }
    } catch (error) {
      // Create new account if none exists
      connectAccount = await stripe.accounts.create({
        type: 'express',
        email: user.email,
        capabilities: {
          transfers: { requested: true },
        },
        business_type: 'individual',
      });
    }

    // Create external account (bank account) for the Connect account
    const bankAccount = await stripe.accounts.createExternalAccount(
      connectAccount.id,
      {
        external_account: {
          object: 'bank_account',
          country: 'US',
          currency: 'usd',
          account_holder_name: accountHolderName,
          account_holder_type: 'individual',
          routing_number: routingNumber,
          account_number: accountNumber,
          account_type: accountType,
        },
      }
    );

    // Store bank account info in database (never store full account details)
    const { data: dbBankAccount, error: dbError } = await supabase
      .from('user_bank_accounts')
      .upsert({
        user_id: user.id,
        stripe_account_id: connectAccount.id,
        bank_account_id: bankAccount.id,
        account_holder_name: accountHolderName,
        bank_name: bankAccount.bank_name || 'Unknown',
        routing_number_last4: routingNumber.slice(-4),
        account_number_last4: accountNumber.slice(-4),
        verification_status: 'verifying',
        verification_method: 'micro_deposits',
        is_primary: true,
        metadata: {
          account_type: accountType,
          created_via: 'secure_form',
        },
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      throw new Error('Failed to save bank account information');
    }

    // Log the action
    await supabase.from('bank_account_audit_log').insert({
      user_id: user.id,
      bank_account_id: dbBankAccount.id,
      action: 'created',
      details: {
        verification_method: 'micro_deposits',
        account_type: accountType,
      },
      ip_address: req.headers.get('x-forwarded-for') || 'unknown',
      user_agent: req.headers.get('user-agent') || 'unknown',
    });

    return new Response(JSON.stringify({
      success: true,
      data: {
        bankAccountId: dbBankAccount.id,
        stripeAccountId: connectAccount.id,
        verificationStatus: 'verifying',
        accountLast4: accountNumber.slice(-4),
        routingLast4: routingNumber.slice(-4),
        message: 'Bank account created successfully. Micro-deposit verification will begin shortly.',
      },
      timestamp: new Date().toISOString(),
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Create Bank Account Error:', error);

    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Failed to create bank account',
      timestamp: new Date().toISOString(),
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
