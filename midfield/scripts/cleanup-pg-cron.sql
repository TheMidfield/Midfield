-- Cleanup Supabase pg_cron Jobs
-- Run this in Supabase SQL Editor (Production) after verifying GitHub Actions work

-- Check existing cron jobs
SELECT * FROM cron.job;

-- Remove livescore sync (now handled by GitHub Actions)
SELECT cron.unschedule('livescore-sync');

-- Remove schedule sync (now handled by GitHub Actions)
SELECT cron.unschedule('schedule-sync');

-- Verify removal
SELECT * FROM cron.job;
