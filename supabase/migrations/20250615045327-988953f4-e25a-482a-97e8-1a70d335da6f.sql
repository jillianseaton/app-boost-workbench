
-- Create user_bank_accounts table for storing bank account information
CREATE TABLE public.user_bank_accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_account_id TEXT NOT NULL,
  bank_account_id TEXT NOT NULL,
  account_holder_name TEXT NOT NULL,
  bank_name TEXT NOT NULL,
  routing_number_last4 TEXT NOT NULL,
  account_number_last4 TEXT NOT NULL,
  verification_status TEXT NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verifying', 'verified', 'failed', 'requires_action')),
  verification_method TEXT NOT NULL DEFAULT 'micro_deposits',
  is_primary BOOLEAN NOT NULL DEFAULT false,
  verified_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create bank_account_audit_log table for tracking all bank account operations
CREATE TABLE public.bank_account_audit_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bank_account_id UUID REFERENCES public.user_bank_accounts(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  details JSONB DEFAULT '{}',
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security on both tables
ALTER TABLE public.user_bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bank_account_audit_log ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_bank_accounts
CREATE POLICY "Users can view their own bank accounts" ON public.user_bank_accounts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own bank accounts" ON public.user_bank_accounts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bank accounts" ON public.user_bank_accounts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bank accounts" ON public.user_bank_accounts
  FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for bank_account_audit_log
CREATE POLICY "Users can view their own audit logs" ON public.bank_account_audit_log
  FOR SELECT USING (auth.uid() = user_id);

-- Service role can insert audit logs (for edge functions)
CREATE POLICY "Service role can insert audit logs" ON public.bank_account_audit_log
  FOR INSERT WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX idx_user_bank_accounts_user_id ON public.user_bank_accounts(user_id);
CREATE INDEX idx_user_bank_accounts_verification_status ON public.user_bank_accounts(verification_status);
CREATE INDEX idx_bank_account_audit_log_user_id ON public.bank_account_audit_log(user_id);
CREATE INDEX idx_bank_account_audit_log_bank_account_id ON public.bank_account_audit_log(bank_account_id);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_bank_accounts_updated_at 
  BEFORE UPDATE ON public.user_bank_accounts 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
