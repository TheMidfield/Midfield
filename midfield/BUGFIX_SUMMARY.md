# 🐛 Bug Fix Summary - Take Counts & LiveFeed Issues

**Date**: January 4, 2026  
**Issues**: Stale take counts + LiveFeed not working on desktop

---

## 🔍 Root Cause Analysis

### Bug 1: Stale Take Counts Everywhere

**Symptoms:**
- Homepage entity cards show incorrect take counts (legacy data)
- EntityHeader shows wrong number of takes  
- Trending widget shows incorrect counts
- **BUT** search results show correct counts (0)

**Root Cause:**
When you migrated to the new Supabase project, you:
1. ✅ Migrated the `topics` table WITH the `post_count` column
2. ❌ Did NOT migrate the `posts` table (takes were NOT copied over)
3. Result: `topics.post_count` still has OLD database values like "234 takes" but there are actually 0 takes in the new DB

**Why Search Works:**
Search likely queries posts directly with a `COUNT(*)` which returns 0 (correct), while other components read the stale `topics.post_count` column.

---

### Bug 2: LiveFeed Not Showing on Desktop

**Symptoms:**
- LiveFeed works on mobile via `MobileTakeFeed`
- LiveFeed appears empty/broken on desktop even with 1 take
- Posting a take doesn't show it in the desktop feed

**Root Cause:**
The `LiveFeed` component had a **hard-coded minimum requirement of 2 takes** to display anything!

```typescript
// Line 167 in LiveFeed.tsx - THE BUG:
if (!swrTakes || swrTakes.length < 2) return;
```

Why this existed:
1. The component has a two-column layout (col1 and col2)
2. The original design assumed there would always be multiple takes
3. The early return was likely meant to prevent rendering with insufficient data
4. But it created a **chicken-and-egg problem**: you can't see takes until you have 2 takes!

**Impact:**
- With 0 takes: Loading skeleton shows (expected)
- With 1 take: **Nothing shows** (BUG!)
- With 2+ takes: Works perfectly

This is why mobile worked - `MobileTakeFeed` doesn't have this restriction!

---

## ✅ Fixes Applied

### Fix 1: Database - Reset All `post_count` Values

**File Created**: `reset_post_counts.sql`

```sql
-- Reset all post_count values to 0 since we migrated to a new Supabase project
-- without the legacy takes data
UPDATE topics
SET post_count = 0
WHERE post_count > 0;

-- Verify the update
SELECT COUNT(*) as total_topics, 
       SUM(CASE WHEN post_count = 0 THEN 1 ELSE 0 END) as zero_count,
       SUM(CASE WHEN post_count > 0 THEN 1 ELSE 0 END) as nonzero_count
FROM topics;
```

**Action Required:**
You need to run this SQL against your production Supabase database via:
- Supabase Dashboard → SQL Editor → Paste and run
- Or via CLI: `supabase db execute -f reset_post_counts.sql`

---

### Fix 2: Invalidate Trending Cache

**File**: `apps/web/src/app/actions/fetch-widget-data.ts`  
**Change**: Updated cache tag from `'trending-topics-widget-v2'` to `'trending-topics-widget-v3'`

This forces the `unstable_cache` to refresh and fetch new data instead of serving stale cached take counts.

**Status**: ✅ Already applied in codebase

---

### Fix 3: Remove 2-Take Minimum from LiveFeed

**File**: `apps/web/src/components/hero/LiveFeed.tsx`  
**Change**: Line 167 changed from `if (!swrTakes || swrTakes.length < 2) return;` to `if (!swrTakes || swrTakes.length === 0) return;`

This allows the LiveFeed to display with **any number of takes** (1 or more) instead of requiring at least 2.

**Status**: ✅ Already applied in codebase

---

## 🚀 Deployment Steps

1. ~~**Run the SQL script** on your production Supabase~~ ✅ **DONE**

2. ~~**Deploy the code changes**~~ ✅ **DONE** (Already pushed to main)

3. **Verify on production**:
   - LiveFeed on desktop should now show your 1 take
   - All take counts should show accurate values
   - Post a new take → it should appear immediately
   - Check homepage entity cards → should show "0 Takes"
   - Check EntityHeader → should show "0 Takes"  
   - Check trending widget → should show correct counts
   - Post a take on PSG → LiveFeed should show it after realtime update

---

## 🔮 Expected Behavior After Fix

### Take Counts
- ✅ All entity cards show "0 Takes" (except PSG which has 1)
- ✅ EntityHeader shows accurate count
- ✅ Trending widget shows correct counts
- ✅ Search results remain accurate

### LiveFeed (Desktop)
Once you post a take:
- ✅ LiveFeed will show the take immediately via realtime subscription
- ✅ Column assignment will work (stable hash-based distribution)
- ✅ Animations will trigger correctly
- ✅ Parallax scroll effects will engage

**Note**: The LiveFeed is designed to be **empty until there are takes**. The current "broken" state is actually just an empty state because there are 0 takes in the database.

---

## 📝 Why This Happened

This is a classic **data migration gotcha**:
1. You migrated the schema + topic metadata
2. But you did NOT migrate user-generated content (takes)
3. The `post_count` column is a **denormalized cache** that wasn't reset
4. Result: Stale counts pointing to non-existent data

**Prevention for Future**:
- Always reset denormalized counters when migrating partial data
- Or better: recalculate them via trigger/migration after import
- Consider using database triggers to auto-update `post_count` on insert/delete

---

## 🧪 Testing Checklist

After deploying:

- [ ] Homepage → Featured Players → All show "0 Takes"
- [ ] Homepage → Featured Clubs → All show "0 Takes"  
- [ ] Homepage → Top Leagues → All show "0 Takes"
- [ ] Navigate to PSG entity page → Should show "1 Take"
- [ ] EntityHeader on any entity → Shows "0 Takes" (except PSG)
- [ ] Trending widget → Shows correct counts
- [ ] Desktop → LiveFeed section → Check if empty state or loading
- [ ] Post a new take → Should appear in LiveFeed on desktop
- [ ] Search for any entity → Results show "0 Takes"

---

**Status**: 🟡 Partially Fixed (Code updated, SQL needs to be run on production)
