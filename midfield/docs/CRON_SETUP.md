# Cron Job Strategy: Bypassing Vercel Hobby Limits

Since Vercel's Hobby plan restricts cron jobs to **once per day**, we must use alternative methods to run our **minute-level** livescore updates.

## Option A: Supabase Database Cron (Recommended)
**Why:** Professional, integrated, zero-cost, no external dependencies.
**How:** We use the `pg_cron` and `pg_net` extensions built into Supabase to trigger our API route.

### 1. Enable Extensions
Run this SQL in your Supabase SQL Editor:
```sql
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;
```

### 2. Schedule the Job
Run this SQL to schedule the minute-level poll:
```sql
-- Check for livescores every minute
SELECT cron.schedule(
  'livescore-poll',          -- Job name
  '* * * * *',              -- Schedule (Every minute)
  $$
  SELECT
    net.http_get(
        url:='https://midfield.one/api/cron/livescores',
        headers:='{"Authorization": "Bearer YOUR_CRON_SECRET"}' -- Optional if you add auth later
    ) as request_id;
  $$
);
```

### 3. Verify
Check if it's running:
```sql
SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 5;
```

---

## Option B: GitHub Actions (Backup for Daily Sync)
**Why:** Reliable, version-controlled, free minutes.
**Limit:** Minimum interval is ~5 minutes. Good for *Daily Schedule* sync, bad for *Livescores*.

Create `.github/workflows/daily-sync.yml`:
```yaml
name: Daily Fixture Sync
on:
  schedule:
    - cron: '0 6 * * *' # 6 AM UTC
  workflow_dispatch:

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Sync
        run: curl https://midfield.one/api/cron/daily-schedule
```

---

## Option C: External Services (Easiest)
**Why:** Simple UI, free tiers available.
**Tools:**
1.  **Cron-job.org**: Free, supports 1-minute intervals.
2.  **Mergent**: Good developer experience.
3.  **EasyCron**: Paid tiers for high reliability.

**Setup:**
1.  Create account.
2.  Create Job -> URL: `https://midfield.one/api/cron/livescores`
3.  Schedule: `Every Minute`.
