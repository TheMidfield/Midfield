# MIDFIELD SYNC DOCTRINE

> **Status:** ✅ ACTIVE & PRODUCTION READY (as of Jan 2, 2026)
> **Single Source of Truth** for all Data Synchronization Logic.

---

## 1. The Core Philosophy: "Dual Engine"

To balance the need for specific, sub-minute live scores with deep, heavy historical data, Midfield uses two distinct "Engines" that operate in parallel.

| Feature | **⚡️ Realtime Engine** | **🗿 Atlas Engine** |
| :--- | :--- | :--- |
| **Focus** | Time (Livescores) + Hygiene (Purge) | History (Schedule) + Structure (Metadata) |
| **Frequency** | **Every Minute** (Livescores) <br> **Daily** (Purge) | **Every 6 Hours** (Schedule) <br> **Weekly** (Metadata) |
| **Technology** | `Supabase Edge Functions` (via `pg_cron`) | `GitHub Actions` (Node.js Scripts) |
| **Data Types** | • Live Scores (Goals/Events)<br>• Notification Cleanup | • Fixtures (Schedule/Results)<br>• Standings<br>• Club/Player Metadata |
| **Key File** | `supabase/functions/cron-livescores`<br>`supabase/functions/cron-purge` | `scripts/sync-daily-schedule.ts`<br>`scripts/sync-static-metadata.ts` |

---

## 2. ⚡️ The Realtime Engine (Edge)

**"The Pulse"**

Lightweight, stateless functions running on Supabase Edge Network. Triggered internally by `pg_cron`.

### A. The 1-Minute Livescores
**Trigger**: `* * * * *` (Every minute)
**Mechanism**: `pg_cron` -> `POST /functions/v1/cron-livescores`

**Thinking Process:**
1.  **Snapshot**: Check DB for matches that are `LIVE`, `HT`, or starting in < 30m.
2.  **Safety Net (Grim Reaper)**: Check for "Zombie" matches (stuck `LIVE/HT` > 4h after start time). Auto-terminates them to `FT` if found.
3.  **Poll**: If active matches exist, fetch API data for those specific leagues.
4.  **Update**: Upsert result/status/score to DB.
5.  **Sleep**: If no matches, exit immediately (0 API calls).

### B. The Daily Maintenance (Purge)
**Trigger**: `0 0 * * *` (Midnight UTC)
**Mechanism**: `pg_cron` -> `POST /functions/v1/cron-purge-notifications`

**Thinking Process:**
1.  **Hygiene**: Delete notifications > 30 days old.
2.  **Performance**: Keeps the table small for fast reads.

---

## 3. 🗿 The Atlas Engine (GitHub Actions)

**"The Heavy Lifter"**

Complex, batch-processing scripts running on GitHub Infrastructure. Handles heavy API loads and long-running tasks.

### A. The 6-Hour Cycle (Schedule & Standings)
**Trigger**: `0 */6 * * *` (GitHub Schedule)
**Script**: `scripts/sync-daily-schedule.ts`

**Thinking Process:**
1.  **Global Schedule**: Fetch full season schedule (Past Results + Future Fixtures).
2.  **Stub Law**: If a team is missing, create a placeholder `topic` immediately.
3.  **Club Sync**: Updates precise match times (Last 5 / Next 15 events) for all 157 Core Clubs (Parallel Stream, 120 req/min).
4.  **Standings**: Updates tables for the 5 Core Leagues.

### B. The Weekly Metadata Sync
**Trigger**: `0 3 * * 0` (Sundays 3AM UTC)
**Script**: `scripts/sync-static-metadata.ts`

**Thinking Process:**
1.  **Deep Dive**: Iterates all Core Clubs.
2.  **Roster check**: Updates players, kits, stadium info, ages, heights.
3.  **Healing**: Replaces "Stubs" with full rich data.

---

## 4. 🛡️ Failure Modes & Recovery

| Scenario | System Behavior |
| :--- | :--- |
| **Zombie Matches** | **Grim Reaper**: Livescores Edge Function auto-detects `LIVE/HT` matches > 4h old and forces `FT`. |
| **API Limit (429)** | **Backoff**: Both Engines have exponential backoff. GH Actions use `p-limit` to respect 100 req/min. |
| **Edge Timeout** | **Fast Fail**: One minute execution limit. Livescores is optimized to finish in seconds. |
| **Actions Timeout** | **Slow & Steady**: GH Actions allows 6h execution. Sync usually takes ~5 mins. |

---

## 5. Maintenance & Verification

### Essential Commands

**Manual Edge Invocation (Test):**
```bash
curl -X POST https://[PROJECT].supabase.co/functions/v1/cron-livescores \
  -H "Authorization: Bearer [CRON_SECRET]"
```

**Run Manual Schedule Sync:**
```bash
# Triggers the GitHub Action remotely (requires gh cli) or run locally:
npx tsx scripts/sync-daily-schedule.ts
```

**Kill Zombie Matches (Manual Tool):**
```bash
npx tsx scripts/manage-fixtures.ts --kill
```

---

## 6. Access & Secrets

*   `THESPORTSDB_API_KEY`: Required for all external data.
*   `SUPABASE_SERVICE_ROLE_KEY`: Required for admin-level DB writes (Bypassing RLS).
*   `CRON_SECRET`: Secures the public HTTP endpoints.

---
**Last Updated:** Jan 3, 2026
**Architecture State:** Hardened (Zombie & Future-Proofed).
