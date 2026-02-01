-- Add missing columns to companies table
ALTER TABLE companies ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS business_number TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS zip_code TEXT;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS registration_number TEXT; -- Alias for business_number sometimes used

-- Reload schema if needed
NOTIFY pgrst, 'reload schema';
