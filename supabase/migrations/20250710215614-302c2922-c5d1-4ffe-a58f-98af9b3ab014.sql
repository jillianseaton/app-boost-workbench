-- Create Bitcoin transactions table
CREATE TABLE IF NOT EXISTS public.bitcoin_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id TEXT UNIQUE NOT NULL,
  address TEXT NOT NULL,
  amount_satoshis BIGINT NOT NULL,
  amount_btc DECIMAL(16, 8) NOT NULL,
  confirmations INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'failed')),
  block_height INTEGER,
  fee_satoshis BIGINT,
  user_id UUID,
  order_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create webhook logs table for audit purposes
CREATE TABLE IF NOT EXISTS public.webhook_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  status TEXT DEFAULT 'received' CHECK (status IN ('received', 'processed', 'failed')),
  processed_at TIMESTAMPTZ DEFAULT NOW(),
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on both tables
ALTER TABLE public.bitcoin_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_logs ENABLE ROW LEVEL SECURITY;

-- Bitcoin transactions policies
CREATE POLICY "Users can view their own bitcoin transactions" 
ON public.bitcoin_transactions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all bitcoin transactions" 
ON public.bitcoin_transactions 
FOR ALL 
USING (auth.role() = 'service_role');

-- Webhook logs policies (admin only)
CREATE POLICY "Service role can manage webhook logs" 
ON public.webhook_logs 
FOR ALL 
USING (auth.role() = 'service_role');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_bitcoin_transactions_user_id ON public.bitcoin_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_bitcoin_transactions_status ON public.bitcoin_transactions(status);
CREATE INDEX IF NOT EXISTS idx_bitcoin_transactions_transaction_id ON public.bitcoin_transactions(transaction_id);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_type ON public.webhook_logs(webhook_type);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_status ON public.webhook_logs(status);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_bitcoin_transaction_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER update_bitcoin_transactions_updated_at
    BEFORE UPDATE ON public.bitcoin_transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_bitcoin_transaction_updated_at();