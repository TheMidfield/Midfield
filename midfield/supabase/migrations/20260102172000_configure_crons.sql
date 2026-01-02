-- Migration to configure pg_cron jobs for Midfield Sync
-- This ensures the scheduler configuration is code-managed and reproducible.

-- 1. CLEANUP: Remove any existing/duplicate jobs to prevent collisions
SELECT cron.unschedule('daily-fixture-sync');
SELECT cron.unschedule('daily-fixture-sync-v2');
SELECT cron.unschedule('livescore-poll');
SELECT cron.unschedule('livescore-sync-v2');
SELECT cron.unschedule('sync-scheduler-daily');
SELECT cron.unschedule('sync-worker-every-minute');

-- 2. SCHEDULE: Realtime Engine - Schedule Sync (Every 6 Hours)
-- Runs at 00:00, 06:00, 12:00, 18:00 UTC
-- Note: Replace YOUR_SERVICE_ROLE_KEY or ensure auth logic in API accepts this internal call (or remove auth check for localhost if applicable)
-- Ideally use vaults, but for standard setup we pass the key.
SELECT cron.schedule(
  'daily-fixture-sync',
  '0 */6 * * *',
  $$
  SELECT net.http_get(
      url:='https://midfield.one/api/cron/daily-schedule',
      headers:='{"Authorization": "Bearer ' || current_setting('app.settings.service_role_key', true) || '"}'::jsonb
  ) as request_id;
  $$
);

-- NOTE: If 'app.settings.service_role_key' is not set in your DB (it often isn't by default in GUI),
-- Use the hardcoded key version below (copy your SERVICE_ROLE_KEY from Supabase Dashboard):

/*
SELECT cron.schedule(
  'daily-fixture-sync',
  '0 */6 * * *',
  $$
  SELECT net.http_get(
      url:='https://midfield.one/api/cron/daily-schedule',
      headers:='{"Authorization": "Bearer YOUR_SERVICE_ROLE_KEY_HERE"}'::jsonb
  ) as request_id;
  $$
);
*/


-- 3. SCHEDULE: Realtime Engine - Livescore Poll (Every Minute)
SELECT cron.schedule(
  'livescore-poll',
  '* * * * *',
  $$
  SELECT net.http_get(
      url:='https://midfield.one/api/cron/livescores',
      headers:='{"Authorization": "Bearer ' || current_setting('app.settings.service_role_key', true) || '"}'::jsonb
  ) as request_id;
  $$
);

/* 
HARDCODED VERSION FOR LIVESCORES:

SELECT cron.schedule(
  'livescore-poll',
  '* * * * *',
  $$
  SELECT net.http_get(
      url:='https://midfield.one/api/cron/livescores',
      headers:='{"Authorization": "Bearer YOUR_SERVICE_ROLE_KEY_HERE"}'::jsonb
  ) as request_id;
  $$
);
*/

-- 4. VERIFY
-- SELECT jobname, schedule, active FROM cron.job;
