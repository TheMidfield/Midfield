# 🔄 MIDFIELD SYNC DOCTRINE & STATUS
**Single Source of Truth for Data Synchronization**
**Last Updated: January 2, 2026**

> [!IMPORTANT]
> This document defines the **ONLY** authorized architecture for data extraction, transformation, and loading (ETL) within Midfield. It supersedes any prior documentation regarding sync, including legacy Vercel Cron references.

---

## 1. THE "DUAL-ENGINE" ARCHITECTURE

Midfield uses a split-brain approach to handle the massive processing difference between "Live Data" (seconds) and "Structural Data" (days).

### ⚡ ENGINE A: THE REALTIME ENGINE (Time-Sensitive)
**Responsibility:** Fixtures, Scores, Match Status, Live Events.
**Infrastructure:** Next.js API Routes triggered by **Supabase pg_cron**.
**Frequency:** 
- **Schedule Sync:** Every 6 hours (`0 */6 * * *`)
- **Livescore Poll:** Every 1 minute (`* * * * *`)

### 🗿 ENGINE B: THE ATLAS ENGINE (Structural)
**Responsibility:** Clubs, Players, Leagues, Badges, Metadata, History.
**Infrastructure:** Supabase Edge Functions + GitHub Actions.
**Frequency:** Weekly (Sundays).

---

## 2. REALTIME ENGINE SPECIFICATIONS

### A. The "Schedule Sync" (`/api/cron/daily-schedule`)
**Triggers:** `pg_cron` (Supabase Database)
**Schedule:** `0 */6 * * *` (00:00, 06:00, 12:00, 18:00 UTC)
**Actions:**
1.  **Season Detection**: Auto-calculates current/next season.
2.  **Stub Law**: If a match involves a team NOT in our DB, a "Stub" topic is created instantly. This prevents foreign key failures.
3.  **Strict Status Normalization**: Converts API statuses (e.g., "Match Postponed", "Pen.") to strict Postgres enums (`NS`, `LIVE`, `HT`, `FT`, `PST`, `ABD`).
4.  **Upsert**: Batch upserts all fixtures for Core Leagues.

### B. The "Livescore Poll" (`/api/cron/livescores`)
**Triggers:** `pg_cron` (Supabase Database)
**Schedule:** `* * * * *` (Every Minute)
**Actions:**
1.  **Smart Window**: Checks DB for *active* matches (LIVE/HT) or matches starting/ending ±2 hours.
2.  **Zero-Cost Idle**: If no matches are active/imminent, it exits immediately (0 API calls).
3.  **Update**: Fetches precise scores and minutes from TheSportsDB V2 Live endpoint.

---

## 3. CONFIGURATION & INFRASTRUCTURE

### 🔐 Authentication
Cron endpoints are protected. They accept authorization via **EITHER**:
1.  `CRON_SECRET` (Legacy/External)
2.  `SUPABASE_SERVICE_ROLE_KEY` (Internal/pg_cron)

### 🤖 Supabase `pg_cron` Setup
All cron jobs are managed directly within the Postgres database. 

**Current Active Configuration:**
```sql
-- 1. General Schedule Sync (Every 6 Hours)
SELECT cron.schedule(
  'daily-fixture-sync',
  '0 */6 * * *',
  $$
  SELECT net.http_get(
      url:='https://midfield.one/api/cron/daily-schedule',
      headers:='{"Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb
  ) as request_id;
  $$
);

-- 2. Livescore Polling (Every Minute)
SELECT cron.schedule(
  'livescore-poll',
  '* * * * *',
  $$
  SELECT net.http_get(
      url:='https://midfield.one/api/cron/livescores',
      headers:='{"Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb
  ) as request_id;
  $$
);
```

### 🚫 Vercel Cron (DEPRECATED)
We explicitly **DO NOT** use Vercel Cron to avoid free tier limits (2 jobs/project). `vercel.json` crons have been removed.

---

## 4. TROUBLESHOOTING & VERIFICATION

### How to verify sync is working?

**1. Check Latency:**
Run this SQL in Supabase Studio:
```sql
SELECT 
    id, 
    home_team_name, 
    status, 
    updated_at, 
    NOW() - updated_at as time_since_update 
FROM fixtures 
WHERE status IN ('LIVE', 'HT') 
ORDER BY updated_at DESC;
```

**2. Check Schedule Freshness:**
```sql
-- Should show dates far into the future (e.g. May 2026)
SELECT MAX(date) FROM fixtures;
```

**3. Manually Trigger Sync (Emergency):**
Run the script locally:
```bash
npx tsx scripts/test-sync.ts
```

---

## 5. SUPPORTED LEAGUES
Currently synced leagues (IDs):
- **4328**: EPL
- **4335**: La Liga
- **4332**: Serie A
- **4331**: Bundesliga
- **4334**: Ligue 1
- **4480**: UEFA Champions League
- **4481**: UEFA Europa League
*(Note: Domestic Cups like FA Cup are currently excluded by design to minimize noise/stub creation for non-league teams)*

### C. The "Stub UI Law"
Stubs (opponents created solely for fixture completeness) are **Visible but Non-Interactive**.
- **Display**: They appear in fixture lists with their Name and Logo (if available).
- **Interactivity**: They are **NOT Clickable**. They do not have dedicated Topic Pages.
- **Identification**: Frontend checks `metadata.is_stub` to disable links.
