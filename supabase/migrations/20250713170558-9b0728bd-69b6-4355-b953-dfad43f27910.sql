-- Update the status check constraint to include 'converted' status
ALTER TABLE bitcoin_transactions DROP CONSTRAINT bitcoin_transactions_status_check;

ALTER TABLE bitcoin_transactions ADD CONSTRAINT bitcoin_transactions_status_check 
CHECK (status = ANY (ARRAY['pending'::text, 'confirmed'::text, 'failed'::text, 'converted'::text]));