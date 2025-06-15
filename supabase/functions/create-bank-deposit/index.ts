
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BankDepositRequest {
  amount: number; // Amount in USD
  email: string;
  userId: string;
  userBalance: number; // Current user balance for validation
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: BankDepositRequest = await req.json();
    const { amount, email, userId, userBalance } = body;
    
    console.log('Bank Deposit Handler - Request:', { amount, email, userId, userBalance });
    
    // Validation checks
    if (!amount || amount < 10) {
      throw new Error('Minimum deposit amount is $10.00');
    }
    
    if (amount > userBalance) {
      throw new Error('Insufficient balance. Cannot deposit more than your current EarnFlow balance.');
    }
    
    if (amount > 500) {
      throw new Error('Maximum deposit amount is $500.00 per transaction');
    }
    
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeKey) {
      throw new Error('Stripe secret key not configured');
    }
    
    if (!stripeKey.startsWith('rk_') && !stripeKey.startsWith('sk_')) {
      throw new Error('Invalid Stripe key format. Please use either a Restricted key (rk_) or Secret key (sk_)');
    }
    
    const stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16' });
    
    // For demonstration purposes, we'll simulate the bank deposit process
    // In a real implementation, this would:
    // 1. Verify the user has a connected Stripe account with bank details
    // 2. Create a transfer/payout to their bank account
    // 3. Deduct the amount from their EarnFlow balance in the database
    // 4. Send confirmation email
    
    console.log('Processing bank deposit for:', { amount, email, userId });
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const depositId = `bank_deposit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return new Response(JSON.stringify({
      success: true,
      data: {
        depositId,
        amount: amount,
        status: 'pending',
        estimatedArrival: '1-2 business days',
        accountId: 'simulation_account',
        remainingBalance: userBalance - amount,
        message: 'Bank deposit initiated successfully. Funds will be transferred to your bank account within 1-2 business days.',
      },
      timestamp: new Date().toISOString(),
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('Bank Deposit Error:', error);
    
    let errorMessage = error.message;
    
    // Provide more helpful error messages for common issues
    if (error.message.includes('permissions')) {
      errorMessage = 'API key permissions error. For live bank deposits, you need to implement Stripe Connect with Express accounts.';
    } else if (error.message.includes('Invalid API Key')) {
      errorMessage = 'Invalid Stripe API key. Please check your key in the Stripe Dashboard.';
    }
    
    return new Response(JSON.stringify({
      success: false,
      error: errorMessage,
      timestamp: new Date().toISOString(),
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
