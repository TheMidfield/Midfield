# 🔄 MIDFIELD SYNC STATUS — SINGLE SOURCE OF TRUTH
**Last Updated: January 2, 2026**

---

## 📊 SYSTEM OVERVIEW (Simple Mental Model)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         SYNC ARCHITECTURE                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────┐              ┌─────────────────┐                  │
│  │  FIXTURES       │              │  ENTITIES       │                  │
│  │  (Time Data)    │              │  (Structure)    │                  │
│  │                 │              │                 │                  │
│  │  • Match dates  │              │  • Clubs        │                  │
│  │  • Scores       │              │  • Players      │                  │
│  │  • Status       │              │  • Standings    │                  │
│  └────────┬────────┘              └────────┬────────┘                  │
│           │                                │                           │
│           ▼                                ▼                           │
│  ╔═════════════════╗              ╔═════════════════╗                  │
│  ║ Vercel Cron     ║              ║ GitHub Action   ║                  │
│  ║ 6 AM UTC Daily  ║              ║ Sunday 3 AM UTC ║                  │
│  ╚═════════════════╝              ╚═════════════════╝                  │
│                                                                         │
│  ┌─────────────────┐                                                   │
│  │  LIVE SCORES    │  ← pg_cron (1-min) ← ❌ NOT CONFIGURED            │
│  │  (Real-time)    │                                                   │
│  └─────────────────┘                                                   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## ✅ WHAT'S CURRENTLY ACTIVE

| Job | Trigger | Frequency | Status |
|-----|---------|-----------|--------|
| **Daily Fixture Sync** | Vercel Cron | 6 AM UTC daily | ✅ ACTIVE (if CRON_SECRET is set) |
| **Weekly Metadata Sync** | GitHub Action | Sundays 3 AM UTC | ⚠️ CHECK: Needs GitHub secrets |

---

## ❌ WHAT'S NOT ACTIVE

| Job | Trigger | Why Not Working | Fix Needed |
|-----|---------|-----------------|------------|
| **Live Scores Polling** | pg_cron | SQL never executed in production | Run SQL in Supabase dashboard |
| **Atlas Deep Sync** | Supabase Edge Functions | No automated trigger | Manual or add cron trigger |

---

## 🏟️ COMPETITIONS CURRENTLY SYNCED

| League | ID | Synced? |
|--------|-----|---------|
| English Premier League | 4328 | ✅ |
| Spanish La Liga | 4335 | ✅ |
| Italian Serie A | 4332 | ✅ |
| German Bundesliga | 4331 | ✅ |
| French Ligue 1 | 4334 | ✅ |
| UEFA Champions League | 4480 | ✅ |
| UEFA Europa League | 4481 | ✅ |
| **FA Cup** | 4482 | ❌ NOT SYNCED |
| **EFL League Cup** | 4570 | ❌ NOT SYNCED |
| **UEFA Conference League** | 4482 | ❌ NOT SYNCED |

---

## 🔧 CRON ENDPOINTS

| Endpoint | Auth Required | Function |
|----------|---------------|----------|
| `POST /api/cron/daily-schedule` | `Bearer $CRON_SECRET` | Syncs fixture schedule for all leagues |
| `POST /api/cron/livescores` | `Bearer $CRON_SECRET` | Updates live scores (only if matches active) |

---

## 📁 KEY FILES

| Purpose | File Location |
|---------|---------------|
| Fixture sync logic | `packages/logic/src/sync/simple-fixture-sync.ts` |
| API client | `packages/logic/src/sync/client.ts` |
| Vercel cron config | `apps/web/vercel.json` |
| GitHub Action | `.github/workflows/weekly-metadata-sync.yml` |
| Cron setup docs | `docs/CRON_SETUP.md` |

---

## 🚨 KNOWN ISSUES & FIXES

### Issue 1: Cup matches not appearing (FA Cup, League Cup)
**Root Cause:** League IDs not in sync list
**Fix:** Add league IDs to `LEAGUES` array in `simple-fixture-sync.ts`

### Issue 2: Live scores not updating
**Root Cause:** pg_cron never configured in production
**Fix:** Run this SQL in Supabase SQL Editor:
```sql
SELECT cron.schedule(
  'livescore-poll',
  '* * * * *',
  $$
  SELECT net.http_get(
      url:='https://midfield.one/api/cron/livescores',
      headers:='{"Authorization": "Bearer YOUR_CRON_SECRET"}'::jsonb
  ) as request_id;
  $$
);
```

### Issue 3: Vercel cron may not be firing
**Check:** Vercel Dashboard → Project → Cron Jobs tab
**Verify:** `CRON_SECRET` env var is set

---

## 🔍 HOW TO VERIFY SYNC IS WORKING

### Check last fixture sync:
```sql
SELECT MAX(updated_at), COUNT(*) FROM fixtures WHERE updated_at > NOW() - INTERVAL '1 day';
```

### Check for today's matches:
```sql
SELECT * FROM fixtures WHERE date::date = CURRENT_DATE ORDER BY date;
```

### Check pg_cron jobs:
```sql
SELECT * FROM cron.job;
SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 10;
```
