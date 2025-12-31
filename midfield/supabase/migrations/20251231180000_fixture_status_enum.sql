-- Create the fixture_status enum
CREATE TYPE fixture_status AS ENUM ('NS', 'LIVE', 'HT', 'FT', 'PST', 'ABD');

-- Alter the fixtures table to use the enum
-- First, drop the default to avoid casting issues during conversion
ALTER TABLE fixtures ALTER COLUMN status DROP DEFAULT;

-- Update existing data to match the enum (Standardization)
UPDATE fixtures SET status = 'NS' WHERE status IN ('Not Started', 'Time to be defined', '', null);
UPDATE fixtures SET status = 'FT' WHERE status IN ('Match Finished', 'Finished', 'AET', 'PEN');
UPDATE fixtures SET status = 'live' WHERE status IN ('1H', '2H', 'ET', 'Break'); -- Temporary lowercase match for safety
UPDATE fixtures SET status = 'PST' WHERE status IN ('Postponed', 'Cancelled');
UPDATE fixtures SET status = 'ABD' WHERE status IN ('Abandoned', 'Suspended');

-- Handle any remaining edge cases by defaulting to NS
UPDATE fixtures SET status = 'NS' WHERE status NOT IN ('NS', 'LIVE', 'HT', 'FT', 'PST', 'ABD', 'live');

-- Now CAST the column to the new type
ALTER TABLE fixtures 
    ALTER COLUMN status TYPE fixture_status 
    USING (status::fixture_status);

-- Set default back to NS
ALTER TABLE fixtures ALTER COLUMN status SET DEFAULT 'NS';
