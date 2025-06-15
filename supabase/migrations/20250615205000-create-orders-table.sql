
-- Create orders table to track payments and fulfillment
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_session_id TEXT UNIQUE NOT NULL,
  customer_email TEXT,
  amount_total INTEGER,
  currency TEXT DEFAULT 'usd',
  payment_status TEXT,
  status TEXT DEFAULT 'awaiting_payment',
  fulfilled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row-Level Security
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Create policies for the orders table
CREATE POLICY "orders_select_policy" ON public.orders
  FOR SELECT
  USING (true);

CREATE POLICY "orders_insert_policy" ON public.orders
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "orders_update_policy" ON public.orders
  FOR UPDATE
  USING (true);

-- Create trigger to update updated_at timestamp
CREATE TRIGGER update_orders_updated_at 
  BEFORE UPDATE ON public.orders 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
