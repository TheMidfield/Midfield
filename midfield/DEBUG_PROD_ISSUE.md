## Debug Investigation: Prod vs Dev Player Count Discrepancy

### Problem Statement
- **Dev (localhost):** 2721 players displayed ✓
- **Prod (Vercel):** 798 players displayed ✗

### Data Verification
Via MCP queries we confirmed:
- Both DBs have identical data (2925 total players, 2727 in allowed leagues)
- Schema is identical
- topic_relationships table has 2924 rows in both

### What We've Tried (Reverted)
1. Changed `.find()` to `.some()` for multiple club relationships
2. Added `export const dynamic = 'force-dynamic'`  
3. Modified search visibility filters

**Result:** No change. 798 players still showing.

### Critical Observation
The debug page (`/debug-players`) shows that Prod IS fetching all players correctly from the DB, but the JavaScript filter is eliminating most of them.

**From debug output:**
```
Total Players: (not shown but we know it's 2925)
Filtered Players: 798
Filtered/Total Ratio: 79.80%
```

### Hypothesis
Since both DBs are identical and dev works perfectly, the problem MUST be in how the filtering logic executes differently on Vercel.

**Possible causes:**
1. **Environment variable mismatch** - ALLOWED_LEAGUES might be different
2. **Build-time vs Runtime** - Data might be cached from build time
3. **Relationship data not loading** - `club_relationship` array might be empty/different structure

### Next Steps
1. Add console.log to ALLOWED_LEAGUES in players/page.tsx on Prod
2. Add console.log to show sample player.club_relationship structure
3. Compare the actual filter execution between dev and prod
