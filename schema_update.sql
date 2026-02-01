-- Add support team columns to agency_info table
ALTER TABLE agency_info ADD COLUMN support_team_1 TEXT;
ALTER TABLE agency_info ADD COLUMN support_team_2 TEXT;
ALTER TABLE agency_info ADD COLUMN support_team_3 TEXT;

-- Add support team column to projects table
ALTER TABLE projects ADD COLUMN support_team TEXT;
