-- Create function to calculate today's earnings for a user
CREATE OR REPLACE FUNCTION public.get_todays_earnings(user_uuid UUID DEFAULT auth.uid())
RETURNS INTEGER
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT COALESCE(SUM(amount_earned_cents), 0)::INTEGER
  FROM public.commissions
  WHERE user_id = user_uuid
    AND DATE(created_at AT TIME ZONE 'UTC') = CURRENT_DATE
$$;

-- Create function to get today's earnings for all users (admin use)
CREATE OR REPLACE FUNCTION public.get_all_users_todays_earnings()
RETURNS TABLE(user_id UUID, total_earnings_cents INTEGER)
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT 
    c.user_id,
    COALESCE(SUM(c.amount_earned_cents), 0)::INTEGER as total_earnings_cents
  FROM public.commissions c
  WHERE DATE(c.created_at AT TIME ZONE 'UTC') = CURRENT_DATE
  GROUP BY c.user_id
$$;