-- Add payout_txid column to commissions table to track transaction IDs from payout providers
ALTER TABLE public.commissions 
ADD COLUMN payout_txid TEXT;

-- Add index for better performance when querying by transaction ID
CREATE INDEX idx_commissions_payout_txid ON public.commissions(payout_txid);