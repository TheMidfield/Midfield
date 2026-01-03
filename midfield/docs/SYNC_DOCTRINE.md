# MIDFIELD SYNC DOCTRINE

> **Status:** ✅ ACTIVE & PRODUCTION READY (as of Jan 2, 2026)
> **Single Source of Truth** for all Data Synchronization Logic.

---

## 1. The Core Philosophy: "Dual Engine"

To balance the need for specific, sub-minute live scores with deep, heavy historical data, Midfield uses two distinct "Engines" that operate in parallel.

| Feature | **⚡️ Realtime Engine** | **🗿 Atlas Engine** |
| :--- | :--- | :--- |
| **Focus** | Time (When? What score? Who won?) | Structure (Who are they? History? Kits?) |
| **Frequency** | **Every Minute** (Live) <br> **Every 6 Hours** (Schedule) | **Weekly** (Sundays) |
| **Technology** | `Next.js API Routes` (Runs on Vercel) | `GitHub Actions` / `Workers` |
| **Data Types** | • Fixtures (Schedule/Results)<br>• Live Scores (Goals/Events)<br>• **League Standings** | • Club Metadata (Stadium, Socials)<br>• Player Profiles (Height, Age)<br>• Transfers / Rosters |
| **Key File** | `apps/web/src/app/api/cron/...`<br>*(Note: `supabase/functions` is deprecated/archived)* | `scripts/sync-static-metadata.ts` |

---

## 2. ⚡️ The Realtime Engine (V2)

**"The Surgical Striker"**

This engine is lightweight, stateless, and runs on Vercel's Edge/Serverless infrastructure, triggered by Supabase `pg_cron`.

### A. The 6-Hour Cycle (Schedule & Standings)
**Trigger**: `0 */6 * * *` (Every 6 hours)
**Endpoint**: `GET /api/cron/daily-schedule`
**Authentication**: `CRON_SECRET` or `SUPABASE_SERVICE_ROLE_KEY`

**What it does:**
1.  **Schedule Sync**: Fetches matches for the next 30 days and results for the last 7 days.
2.  **Stub Creation**: If a team in a fixture does not exist in our DB, it **immediately** creates a "Stub" topic (placeholder) so the match can be saved. This is the **Stub Law**.
3.  **Standings Sync**: Iterates through the 5 Core Leagues (EPL, La Liga, Bundesliga, Serie A, Ligue 1) and updates the `league_standings` table.

### B. The 1-Minute Cycle (Livescores)
**Trigger**: `* * * * *` (Every minute)
**Endpoint**: `GET /api/cron/livescores`

**What it does:**
1.  **Adaptive Polling**: Checks DB for *any* matches currently marked `LIVE`, finished today (`FT`), or scheduled to start within 30 minutes.
2.  **12-Hour Backward Window**: Polls matches from the last 12 hours to catch late-finishing games (CRITICAL: previously 2.5 hours, causing matches to be stuck as `NS` if the cron missed them).
3.  **Surgical Update**: If matches are found, it polls the API specifically for those league IDs and updates score/status/minute.
4.  **Sleep**: If no matches qualify, it does nothing (Conserves API limits).

### C. The Daily Maintenance Cycle (Cleanup)
**Trigger**: `0 0 * * *` (Daily at Midnight UTC)
**Endpoint**: `POST /api/cron/purge-notifications`
**Authentication**: `CRON_SECRET` or `SUPABASE_SERVICE_ROLE_KEY`

**What it does:**
1.  **Hygiene**: Deletes all notifications older than **30 days** to keep the `notifications` table performant.
2.  **Privacy**: Ensures ephemeral social interactions don't persist forever.

---

## 3. 🗿 The Atlas Engine (Structural)

**"The Heavy Lifter"**

This engine handles the massive, slow-moving data. It ensures our database is rich with context.

### A. The Weekly Metadata Sync
**Trigger**: `0 3 * * 0` (Sundays at 3:00 AM UTC)
**Executor**: GitHub Actions (`.github/workflows/weekly-metadata-sync.yml`)
**Script**: `scripts/sync-static-metadata.ts`

**What it does:**
1.  **Team-Centric Fetch**: Iterates through all **157 Core Clubs**.
2.  **Deep Dive**: Fetches full roster (Players) and Club details.
3.  **Enrichment**: Updates Jersey Numbers, Heights, Weights, Birth Dates, Stadium Capacities, Founded Years.
4.  **Healing**: If a "Stub" was created by the Realtime Engine during the week, the Atlas Engine finds it and "hydrates" it with real logos and data.

---

## 4. 🛡️ Failure Modes & Recovery

| Scenario | System Behavior |
| :--- | :--- |
| **Missing Team in Fixture** | **Stub Law**: Realtime Engine creates a minimal placeholder instantly. Sync validates. |
| **Missing Team in Standings** | **Fail-Safe**: Standings row is skipped (warns in logs). Requires manual seed if persistent. |
| **API Down** | Cron fails gracefully. Retries next run. No data corruption. |
| **Zombie Matches** | **Definition**: Matches marked `LIVE`/`HT` but started > 4 hours ago.<br>**Protocol**: Realtime Engine auto-cures these to `FT` if API confirms completion or if age > 5.5 hours (force cure). |
| **False Future Lives** | **Definition**: Matches scheduled > 4 hours in FUTURE but marked `LIVE`.<br>**Protocol**: "Bogie Sweep" Logic resets these to `NS` to prevent "Pulsating Green Rows" on entity pages. |
| **Cross-League Support** | **Stub Law**: If a Core Club plays an "Unknown" opponent (e.g., Club World Cup), a **Stub Topic** is auto-created. Stubs have badges/names but are **not clickable** (is_stub: true). |
| **Sync Fragility** | **Warning**: The "Club Schedule Sync" is the only lifeline for Cross-League matches. If it crashes (timeout/API error), these matches will vanish from the DB. Monitor `manual-sync-clubs.ts` if missing. |

---

## 5. Maintenance & Verification

### Essential Commands

**Run Manual Schedule/Standings Sync:**
```bash
curl -X GET https://midfield.one/api/cron/daily-schedule \
     -H "Authorization: Bearer [CRON_SECRET]"
```

**Run Manual Metadata Sync:**
```bash
npx tsx scripts/sync-static-metadata.ts
```

**Verify System Health (All Green):**
```bash
npx tsx scripts/verify-production-readiness.ts
```
*Checks: Fixture counts, Standings coverage, API connectivity.*

---

## 6. Access & Secrets

*   `THESPORTSDB_API_KEY`: Required for all external data.
*   `SUPABASE_SERVICE_ROLE_KEY`: Required for admin-level DB writes (Bypassing RLS).
*   `CRON_SECRET`: Secures the public HTTP endpoints.

---
**Last Updated:** Jan 3, 2026
**Architecture State:** Hardened (Zombie & Future-Proofed).
