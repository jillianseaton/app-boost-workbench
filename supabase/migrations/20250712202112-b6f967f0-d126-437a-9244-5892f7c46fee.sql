-- Create daily_earnings table to store computed daily totals
CREATE TABLE public.daily_earnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  date DATE NOT NULL,
  total_earnings_cents INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Enable RLS
ALTER TABLE public.daily_earnings ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own daily earnings" 
ON public.daily_earnings 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own daily earnings" 
ON public.daily_earnings 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own daily earnings" 
ON public.daily_earnings 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Function to update daily earnings
CREATE OR REPLACE FUNCTION public.update_daily_earnings(target_user_id UUID, target_date DATE)
RETURNS VOID
LANGUAGE SQL
SECURITY DEFINER
AS $$
  INSERT INTO public.daily_earnings (user_id, date, total_earnings_cents, updated_at)
  SELECT 
    target_user_id,
    target_date,
    COALESCE(SUM(amount_earned_cents), 0),
    now()
  FROM public.commissions
  WHERE user_id = target_user_id
    AND DATE(created_at AT TIME ZONE 'UTC') = target_date
  ON CONFLICT (user_id, date) 
  DO UPDATE SET 
    total_earnings_cents = EXCLUDED.total_earnings_cents,
    updated_at = now();
$$;

-- Trigger to automatically update daily earnings when commissions change
CREATE OR REPLACE FUNCTION public.handle_commission_change()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Handle INSERT and UPDATE
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    PERFORM public.update_daily_earnings(
      NEW.user_id, 
      DATE(NEW.created_at AT TIME ZONE 'UTC')
    );
    RETURN NEW;
  END IF;
  
  -- Handle DELETE
  IF TG_OP = 'DELETE' THEN
    PERFORM public.update_daily_earnings(
      OLD.user_id, 
      DATE(OLD.created_at AT TIME ZONE 'UTC')
    );
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$$;

-- Create triggers
CREATE TRIGGER commission_daily_earnings_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.commissions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_commission_change();

-- Add updated_at trigger for daily_earnings
CREATE TRIGGER update_daily_earnings_updated_at
  BEFORE UPDATE ON public.daily_earnings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();