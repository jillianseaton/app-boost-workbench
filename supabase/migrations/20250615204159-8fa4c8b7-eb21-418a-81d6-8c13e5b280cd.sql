
-- Add columns to track bank account updates
ALTER TABLE public.user_bank_accounts 
ADD COLUMN IF NOT EXISTS previous_routing_number_last4 TEXT,
ADD COLUMN IF NOT EXISTS previous_account_number_last4 TEXT,
ADD COLUMN IF NOT EXISTS update_reason TEXT,
ADD COLUMN IF NOT EXISTS updated_by_user_at TIMESTAMP WITH TIME ZONE;

-- Update the trigger to handle the new updated_by_user_at field
CREATE OR REPLACE FUNCTION update_bank_account_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    IF NEW.routing_number_last4 != OLD.routing_number_last4 OR NEW.account_number_last4 != OLD.account_number_last4 THEN
        NEW.updated_by_user_at = now();
        NEW.previous_routing_number_last4 = OLD.routing_number_last4;
        NEW.previous_account_number_last4 = OLD.account_number_last4;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_user_bank_accounts_updated_at ON public.user_bank_accounts;
CREATE TRIGGER update_user_bank_accounts_updated_at 
  BEFORE UPDATE ON public.user_bank_accounts 
  FOR EACH ROW EXECUTE FUNCTION update_bank_account_updated_at();
