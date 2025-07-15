-- Create affiliate conversions table to track real partner conversions
CREATE TABLE public.affiliate_conversions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversion_id TEXT NOT NULL UNIQUE,
  partner_name TEXT NOT NULL,
  network TEXT NOT NULL DEFAULT 'direct',
  order_id TEXT,
  amount_cents INTEGER NOT NULL DEFAULT 0,
  commission_cents INTEGER NOT NULL DEFAULT 0,
  event_type TEXT NOT NULL DEFAULT 'conversion',
  status TEXT NOT NULL DEFAULT 'pending',
  raw_data JSONB,
  validation_notes TEXT,
  validated_at TIMESTAMP WITH TIME ZONE,
  processed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.affiliate_conversions ENABLE ROW LEVEL SECURITY;

-- Create policy for service role to manage all conversions
CREATE POLICY "Service role can manage all conversions" 
ON public.affiliate_conversions 
FOR ALL 
USING (auth.role() = 'service_role');

-- Create indexes for better performance
CREATE INDEX idx_affiliate_conversions_conversion_id ON public.affiliate_conversions(conversion_id);
CREATE INDEX idx_affiliate_conversions_partner_name ON public.affiliate_conversions(partner_name);
CREATE INDEX idx_affiliate_conversions_network ON public.affiliate_conversions(network);
CREATE INDEX idx_affiliate_conversions_status ON public.affiliate_conversions(status);
CREATE INDEX idx_affiliate_conversions_created_at ON public.affiliate_conversions(created_at);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_affiliate_conversions_updated_at
BEFORE UPDATE ON public.affiliate_conversions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();