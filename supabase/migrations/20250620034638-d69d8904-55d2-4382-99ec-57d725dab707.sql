
-- Create commissions table to track earnings and payouts
CREATE TABLE public.commissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  amount_earned_cents INTEGER NOT NULL,
  description TEXT,
  source TEXT NOT NULL DEFAULT 'task_completion',
  paid_out BOOLEAN NOT NULL DEFAULT false,
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for security
ALTER TABLE public.commissions ENABLE ROW LEVEL SECURITY;

-- Create policies for commissions
CREATE POLICY "Users can view their own commissions" 
  ON public.commissions 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own commissions" 
  ON public.commissions 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Admin policy for payout processing (service role can update all)
CREATE POLICY "Service role can update all commissions" 
  ON public.commissions 
  FOR UPDATE 
  USING (auth.role() = 'service_role');

-- Create index for better performance
CREATE INDEX idx_commissions_user_id ON public.commissions(user_id);
CREATE INDEX idx_commissions_paid_out ON public.commissions(paid_out);
