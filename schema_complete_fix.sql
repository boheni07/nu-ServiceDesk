-- Add missing column to users table
ALTER TABLE app_users ADD COLUMN IF NOT EXISTS support_team_name TEXT;

-- Add missing column to projects table
ALTER TABLE projects ADD COLUMN IF NOT EXISTS support_team TEXT;

-- Add missing columns to tickets table (matching Ticket interface)
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS attachments TEXT[] DEFAULT '{}';
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS plan_attachments TEXT[] DEFAULT '{}';
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS intake_method TEXT;
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS request_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS expected_completion_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS expected_completion_delay_reason TEXT;
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS shortened_due_reason TEXT;
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS postpone_reason TEXT;
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS postpone_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Add missing columns to agency_info table
ALTER TABLE agency_info ADD COLUMN IF NOT EXISTS support_team_1 TEXT;
ALTER TABLE agency_info ADD COLUMN IF NOT EXISTS support_team_2 TEXT;
ALTER TABLE agency_info ADD COLUMN IF NOT EXISTS support_team_3 TEXT;

-- Force PostgREST to reload schema
NOTIFY pgrst, 'reload schema';
