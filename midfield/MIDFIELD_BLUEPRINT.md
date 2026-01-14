# ⚡ MIDFIELD_BLUEPRINT.md — THE LIVING DOCTRINE (v7.10)

<!--
UPDATE LOG (Jan 13, 2026):
- **CRITICAL SYNC FIX**: Refactored `sync-static-metadata.ts` to use `smartUpsertTopic` (was bypassing protection).
- **Database Verification**: Added explicit PROD/DEV logging to prevent GitHub Actions secret mix-ups.
- **Image URL Migration**: TheSportsDB CDN migration (www → r2) now handled automatically by weekly sync.

UPDATE LOG (Jan 2, 2026 - EVENING):
- **Sync Doctrine Consolidation**: Merged all sync documentation into a single source of truth: `docs/SYNC_DOCTRINE.md`.
- **Standings Sync**: Formally integrated Standings Sync into Realtime Engine (6-hour cycle).
- **Core Club Audit**: Seeded 4 missing core clubs (Las Palmas, Empoli, Venezia, Monza) to achieve 100% standings coverage.

-->

STATUS: ACTIVE // DEFINITIVE SINGLE SOURCE OF TRUTH
OPERATIONAL PHASE: OPTIMIZATION → MOBILE-NATIVE PREP → SCALE
FORGE DATE: JAN 2, 2026 (Updated)
OWNER: Developer is the master of this repo. Standards are non-negotiable.

This file is designed to enable "fresh context window" resets at any time.
If the developer starts a new chat and says: "Read @MIDFIELD_BLUEPRINT.md"
…the assistant is expected to become fully operational immediately.

──────────────────────────────────────────────────────────────────────────────
0) THE SUCCESSOR PROTOCOL (BATON PASS)
──────────────────────────────────────────────────────────────────────────────

You are a successor agent. Treat this file as law.

Expected first response AFTER reading this file (do NOT be generic):
- Confirm you fully internalized the doctrine.
- State you are ready to execute immediately.
- Ask at most ONE high-leverage question only if absolutely necessary.
- Otherwise propose the next actionable step(s) with confidence.

──────────────────────────────────────────────────────────────────────────────
1) MIDFIELD — STRATEGIC NUCLEUS (THE WHY)
──────────────────────────────────────────────────────────────────────────────

Midfield is a data-driven football discussion engine: structured topic pages + takes.
It bridges hard stats (TheSportsDB) and community opinion (Takes).

- **Data Noir Aesthetic**: Dark mode primary, emerald accents, sharp borders, minimal shadows.
- **Mobile-Native**: Web UI must translate 1:1 to React Native patterns.

──────────────────────────────────────────────────────────────────────────────
2) TECH STACK & ARCHITECTURE
──────────────────────────────────────────────────────────────────────────────

- **Frontend**: Next.js 16 (App Router), React 19, Tailwind v4.
- **Backend**: Supabase (Postgres, Auth, Edge Functions).
- **Repo**: Turborepo (apps/web, packages/logic, packages/ui).
- **Logic Law**: ALL business logic (scoring, formatting, algorithms) MUST live in `packages/logic`. `apps/web` is for UI and data fetching ONLY.
- **Images**: next/image ONLY. External domains configured in next.config.

──────────────────────────────────────────────────────────────────────────────
3) THE 5 IMMUTABLE DESIGN LAWS
──────────────────────────────────────────────────────────────────────────────

1.  **Border Hierarchy**: Borders define structure. No soft shadows.
2.  **Optical Alignment**: Icons + Text must align perfectly (mt-0.5 patterns). 
    - **Nested Row Offset**: Second-row metadata icons must have a `pl-2` or `pl-2.5` padding to align with the *text* of buttons in the row above, not the button edge.
3.  **Mandatory Hover**: Every interactive element gets a hover state (color/border shift).
4.  **Rounded Corners**: `rounded-md` (6px) is the universal standard for interactive elements.
5.  **Strict Vignette Grids**:
    - Hero grids must NEVER end abruptly.
    - Use `maskImage: radial-gradient(ellipse 50% 50% at 50% 50%, black 10%, transparent 85%)`.
    - This guarantees 0% opacity before the edge.
6.  **Weight Discipline**: 
    - NEVER use `font-extrabold` or `font-black`. 
    - Even for primary hero titles, `font-bold` is the absolute maximum weight allowed. 
    - This ensures the typography remains sharp and premium, avoiding an "over-weighted" or bulky aesthetic.
7.  **Icon Consistency**:
    - **CornerDownLeft**: ALWAYS use this icon for reply actions (main + nested). Do not mix with MessageCircle (chat context only).
    - **Visibility**: Icons must always be visible; text can be hidden on mobile (xs).

──────────────────────────────────────────────────────────────────────────────
4) COMPONENT ARCHETYPES (CANONICAL)
──────────────────────────────────────────────────────────────────────────────

**A) HERO BANNERS (Players, Clubs, Leagues)**
- **Role**: Branding/Context headers.
- **Style**: "Inline" (no border/container), naturally delimited by Grid Vignette.
- **Grid**: 24px pattern, opacity 0.03 (dark), `rounded-md`.
- **Masking**: Strict Vignette (see Design Laws) to prevent hard edges.
- **Green Accent**: Soft "spotlight" gradients (`circle 400px`) at corners.

**B) MATCH CENTER WIDGET**
- **Modes**:
  - `Default`: Shown on Homepage (includes Club Names).
  - `Sidebar/Compact`: Shown on RightPanel (Logos ONLY, no text names).
- **Robustness**: Must verify data exists before calling `.sort()` or `.filter()`. Skeletons must respect `hideClubNames` to prevent layout overflow.
- **Ranking Algo**:
  - Pure Power Ranking (UEFA Coefficients + League Prestige).
  - **Diversity Penalty**: Top 5 Leagues (EPL, La Liga, etc.) forced to mix. No single league dominates > 4 slots.

**C) ENTITY CARDS & CYCLER**
- **Preloading**: `EntityCycler` must preload ALL images in hidden state to prevent flicker.
- **Ratings**: FC26 ratings (emerald badges). IF UNKNOWN, DO NOT SHOW. No defaults (e.g. "88").
- **Images**: Square user avatars (`rounded-md`), Grid view for entities.

**D) SHARE CARDS (Server-Side)**
- **Tech**: `/api/share-card` using `next/og` (Satori). Bypasses CORS by server-fetching images.
- **Design**: 1:1 Square (1080px). Mirrors app UI exactly (EntityHeader + TakeCard).
- **Font Stack**: System fonts only (Apple System, Inter-like) to prevent Satori loading crashes.
- **Dynamic Sizing**: Font size must scale inversely with content length.

──────────────────────────────────────────────────────────────────────────────
5) DATA PIPELINES (THE ENGINE ROOM)
──────────────────────────────────────────────────────────────────────────────

**A) THE STUB LAW (Import Resilience)**
- **Rule**: Never fail a sync due to missing Foreign Keys.
- **Action**: If a fixture references a missing Entity ID, create a **STUB** `topic` immediately (Name + ExtID only).
- **Resolution**: Atlas Engine fills in deep details (images, players) later.

**B) FC26 RATINGS & SOFIFA**
- Source: SoFIFA (Python Scraper). **Manual Execution by Admin**.
- Storage: `topics.fc26_data` JSONB column.
- **Safety**: Protected by `smartUpsertTopic`. Never overwritten by regular sync jobs.

**C) HYBRID ARCHITECTURE ("Dual Engine")**
- **Reference**: See [docs/SYNC_DOCTRINE.md](file:///Users/roycim/Documents/[5] Code/Projects/Midfield-proto/midfield/docs/SYNC_DOCTRINE.md) for the definitive architecture.
- **I. ATLAS ENGINE (GitHub Actions)**:
  - **Domain**: Structure (Clubs, Players, Leagues, Metadata) + Heavy Schedule Sync.
  - **Frequency**: 
    - **Schedule**: Every 6 Hours (`sync-daily-schedule.ts`).
    - **Metadata**: Weekly (`sync-static-metadata.ts`).
- **II. REALTIME ENGINE (Edge Functions)**:
  - **Domain**: Time (Livescores) + Hygiene (Purge).
  - **Driver**: Supabase `pg_cron` triggering internal Edge Functions.
  - **Frequency**: 
    - **Livescores**: Every Minute (`cron-livescores`).
    - **Purge**: Daily (`cron-purge-notifications`).
  - **Rule**: Sole authority for *live* match status updates.

**D) STRICT FIXTURE ENUMS**
- **Values**: `NS`, `LIVE`, `HT`, `FT`, `PST`, `ABD`.
- **Legacy Ban**: No string matching ("Match Finished"). Use strict Enum checks.

**E) THE SMART UPSERT LAW (Data Preservation)**
- **Rule**: Protect expensive-to-get data (FC26 Ratings, Follower Counts, Enriched Metadata).
- **Mechanism**: `smartUpsertTopic` strips `fc26_data`, `follower_count`, and `post_count` from all update payloads.
- **Metadata Protection**: Existing `metadata` values are shallow-merged with new payloads. Enriched player physicals (Height/Weight) will persist even if a simpler sync job only provides a name/photo.

──────────────────────────────────────────────────────────────────────────────
6) RESPONSIVE PERFECTION LAW
──────────────────────────────────────────────────────────────────────────────
- **The Web IS The Mobile App**.
- **Desktop Sanctity**: If a layout looks amazing on Desktop, DO NOT regress it to fix Mobile. Use specific breakpoints (`md:`, `lg:`) to adapt logic. Desktop is the "Gold Standard".
- **Responsive Audit Checklist**:
  - No horizontal scroll.
  - No "collapsed" or cramped density; elements must breathe.
  - Tap targets > 44px.
  - Long text truncates gracefully (`min-w-0`).
- **Layout Collisions**: Use `min-w-0`, `truncate`, and `flex-wrap` defensively.

──────────────────────────────────────────────────────────────────────────────
7) RECENT CRITICAL DECISIONS (JAN 2026)
──────────────────────────────────────────────────────────────────────────────

1.  **Sidebar Widget Constraints**: Widgets in sidebars (RightPanel) must be compact.
    - *Action*: `MatchCenterWidget` now accepts `hideClubNames` prop.
2.  **Rich Player Metadata Strategy**:
    - Use Hybrid V1 + V2 TheSportsDB lookup.
    - V1 provides Height, Weight (Clean format: "72 kg"), Preferred Foot, and Birth Location.
3.  **Metadata Merging**: Forced shallow-merge in `smartUpsertTopic` is now the standard to prevent "Metadata Erasure" bugs.
4.  **MatchCenter Stability**: Sorting logic now safely handles `null` results during data fetching loading phases.
5.  **Blueprint Authority**: This file is the single source of truth.
6.  **Centralized League Control**:
    - `packages/logic/src/constants.ts` (`ALLOWED_LEAGUES`) is the SINGLE source of truth.
    - **Strict Filtering**: `fetch-widget-data.ts` (Widgets) and `leagues/page.tsx` (UI) MUST explicitly `.in('title', ALLOWED_LEAGUES)` to prevent database pollution from displaying.
7.  **Auth Profile Safety**:
    - `auth/callback` MUST use `ignoreDuplicates: true` on user upsert to protect custom avatars.
    - **Social Avatar Ban**: user `avatar_url` MUST be initialized as `null`. We DO NOT sync images from OAuth providers (Google/GitHub).
8.  **Profile Resilience**:
    - `getUserProfile` (Server) uses `maybeSingle()` + `try/catch` to preventing hangs on missing data.
9.  **Live Match Distinction**:
    - Live matches display in "Results" tab (Top billing).
    - Pulsing Emerald Indicators for "LIVE" status.
10. **Visual Consistency (Placeholders)**:
    - No Gradients for empty states. Use solid `slate-100`/`neutral-800` to match Navbar.
11. **Image Optimization Law** (Critical - Jan 1, 2026):
    - **External CDN Images**: ALWAYS add `unoptimized={true}` to TheSportsDB images.
      - Rationale: TheSportsDB serves pre-optimized PNGs (~6-8k images). Re-optimizing via Vercel exhausts quota (402 errors) with zero benefit.
      - Example: `<NextImage src={tsdbImageUrl} unoptimized={true} />`
    - **User-Uploaded Content**: NEVER add `unoptimized` to Supabase Storage avatars.
      - Rationale: User uploads vary in format/size. Vercel optimization is essential for SEO/LCP.
      - Example: `<NextImage src={user.avatar_url} />` (no unoptimized prop)
    - **Above-Fold Critical Images**: Selectively optimize with `priority={true}` for LCP.
      - Use sparingly: Homepage hero, entity headers only.
    - **Crisis Reference**: See `image-optimization-audit.md` for full incident report.
12. **Bandwidth Optimization Law** (Critical - Jan 1, 2026):
    - **Query Limits**: ALWAYS limit queries to what's needed, not "fetch all then filter".
      - Example: Fetch 50 players max for recommendations, not 500.
      - Rationale: 90% bandwidth savings with zero UX impact.
    - **React cache() for Server Actions**: Use `cache()` from React for request-level deduplication.
      - Example: `export const getData = cache(async () => { ... })`
      - Behavior: Multiple calls in SAME request = 1 DB query. Different requests = NEW queries (fresh data).
    - **NEVER use unstable_cache() for dynamic data**: Cross-request caching causes stale data.
      - ❌ WRONG: `unstable_cache(async () => getTrendingTopics(), ['trending'])`
      - Why: First request's data cached globally for ALL users until revalidation.
      - Only use `unstable_cache()` for truly static content (regenerated hourly/daily).
    - **Free Tier Awareness**: Vercel Free = 10GB Fast Origin Transfer/month.
      - Monitor usage in Vercel Dashboard → Analytics → Fast Origin Transfer.
      - Set alert at 8GB/month (80% threshold).
13. **Sentiment Protocol (Votes)** (Critical - Jan 1, 2026):
    - **Aesthetics**: Upvote/Downvote counts MUST use unsaturated **Slate-400** (`text-slate-400`). Emerald/Red are banned for general card display to preserve visual calm.
    - **Conditional Display**: Vote counts (icon + number) MUST ONLY be visible if the count is `> 0`.
    - **Scope**: Enabled for `TopicCard` (Search/Homepage) and `FeaturedPlayers`. 
    - **Hero Protection**: Hero Cycler items MUST remain clean (no vote counts).
14. **Type Safety & RPC Standards**:
    - **RPC Batching**: Use `get_topic_vote_counts` RPC for all multi-topic list views to prevent N+1 overhead.
    - **Type Resilience**: If the Supabase client returns "Never" types or "Excessively Deep" instantiation errors on complex RPCs, cast the client/call to `any` to unblock builds. Standardized schema types live in `packages/types/src/supabase.ts` and MUST be identical in `apps/web/src/types/database.types.ts`.
15. **Scalability Standards** (Critical - Jan 1, 2026):
      - **No Waterfalls**: Independent data fetches MUST run in parallel using `Promise.all()`.
      - **Batch Writes**: Sync jobs must use atomic `upsert()` arrays. N+1 database writes are strictly forbidden.
      - **Widget Caching**: Heavy global widgets (Trending, Match Center, Similar Recs) MUST use `unstable_cache` (ISR) with tagged revalidation (e.g. 300s).
      - **NO COOKIES IN ISR**: `unstable_cache` creates a GLOBAL static cache. You MUST NOT use `cookies()`, `headers()`, or standard Supabase client inside it.
        - SOLUTION: Use `createSupabaseClient` (direct from `@supabase/supabase-js`) with `process.env` keys inside the cached function scope.
      - **JSONB Indexing**: Filters on metadata fields (e.g., `metadata->>league`) MUST have a corresponding GIN/Expression index to prevent full table scans.
      - **Pagination**: Use standard offset/limit pagination for large datasets. Fixed limits (e.g., 2000) are banned for core data fetchers to prevent silent data loss.
16. **Mobile-Only Click Feedback Protocol** (Critical - Jan 2, 2026):
    - **Pattern**: ALL `active:scale-*` effects MUST include `lg:active:scale-100` to disable on desktop.
      - ✅ CORRECT: `active:scale-95 lg:active:scale-100`
      - ❌ WRONG: `active:scale-95` (applies to all screen sizes)
    - **Rationale**: Mobile users need tactile feedback for touch interactions. Desktop users with precise mouse cursors do not need scale animations and find them unprofessional.
    - **Scope**: Applied universally across 10+ components (Navbar, TakeCard, EntityHeader, ReactionBar, MatchCenterWidget, etc.).
    - **Base Components**: UI primitives (Button, IconButton, Card) are pre-configured with this pattern.
17. **Widget Spacing Standards** (Jan 2, 2026):
    - **TrendingWidget**: 
      - Container padding: `px-3` (increased from `px-2`) to prevent ranking numbers/take counts from touching borders.
      - Internal gap: `gap-2` (reduced from `gap-3`) to tighten rank-to-player spacing for better visual grouping.
    - **General Principle**: Elements near container edges need breathing room. Internal element groups should be visually cohesive.
18. **Smart Collapsible Defaults** (Jan 2, 2026):
    - **Player Pages**: Topic collapsible sections MUST check for data availability before choosing default open state.
      - If `topic.fc26_data?.overall` exists: Default to `["ratings"]`
      - If ratings unavailable: Default to `["about"]` (prevents empty default state)
    - **Implementation**: `TopicPageClient.tsx` line 71-76 uses conditional logic: `hasFC26Ratings ? ["ratings"] : ["about"]`
19. **Take Counter Accuracy** (Jan 2, 2026):
    - **Rule**: `topics.post_count` MUST include both parent posts AND replies for accurate take display.
    - **SQL Pattern** (Migration `20240107000000_fix_topic_post_counts.sql`):
      ```sql
      SELECT COUNT(*)
      FROM posts p
      LEFT JOIN posts parent ON p.parent_post_id = parent.id
      WHERE (
          (p.topic_id = t.id AND p.parent_post_id IS NULL)  -- Parent posts
          OR
          (parent.topic_id = t.id AND p.parent_post_id IS NOT NULL)  -- Replies
      )
      AND p.is_deleted = false
      ```
    - **Rationale**: Users expect "Takes" to reflect total conversation volume (parent + replies), not just top-level posts.
20. **Mathematical Layout Centering** (Jan 2, 2026):
    - **Pattern**: When two-column grids need perfect mathematical centering, move headers OUTSIDE the grid.
    - **Example**: Homepage Trending + MatchCenter
      - ❌ WRONG: Entire `<HomeTrendingSection>` (header + rows) in grid → centers whole column including header
      - ✅ CORRECT: Header rendered separately above grid, `<HomeTrendingRows>` component participates in `items-center` alignment
    - **Implementation**:
      ```tsx
      {/* Header outside grid */}
      <div className="flex items-center gap-2 mb-3">...</div>
      {/* Grid only contains rows + widget - mathematically centered */}
      <div className="grid lg:grid-cols-2 items-center">
        <HomeTrendingRows />  {/* Exported component: rows only */}
        <MatchCenterWidget />
      </div>
      ```
    - **Rationale**: CSS grid `items-center` centers ALL content. By excluding headers, visual centering aligns to content rows only.
21. **EntityHeader Mobile Adaptation** (Jan 2, 2026):
    - **Rule**: Mobile info sections (`sm:hidden`) MUST be conditional based on entity type.
    - **Implementation**: 
      - **Players**: Show dedicated mobile stats section (nationality, age, kit number, etc.)
      - **Clubs**: Skip mobile section entirely - all info (league, stadium, founded) stays in main header
    - **Rationale**: Clubs have minimal metadata (2-3 fields). Separate mobile section adds unnecessary vertical space. Players have 6+ fields that benefit from dedicated mobile layout.
    - **Code Pattern**: Wrap mobile section with `{isPlayer && <div className="sm:hidden">...</div>}`
22. **Notification System Architecture** (Jan 11, 2026):
    - **Components**:
      - `NotificationContext.tsx`: Global provider with realtime subscription + toast management
      - `NotificationsPopover.tsx`: Right-edge Sheet sidebar with bell trigger
      - `NotificationItem.tsx`: Individual notification cards with entity images + deep linking
      - `actions/notifications.ts`: Server actions for CRUD + entity enrichment
    - **Realtime**: Supabase Postgres Changes (`INSERT` on `notifications` table, filtered by `recipient_id`)
      - **CRITICAL**: Must enable "Enable Realtime" on `notifications` table in Supabase Dashboard → Database → Replication
      - **Toast**: Triggered on INSERT events (skips 3s after onboarding to avoid spam)
    - **Trigger Fixes** (Jan 11, 2026):
      - Reply notifications: Fixed trigger to check `parent_post_id` (not `reply_to_post_id`)
      - Badge notifications: Fixed to use `resource_id` + `resource_slug` (removed invalid `badge_id` column)
      - Fallback logic: `COALESCE(reply_to_post_id, parent_post_id)` to handle @mentions and direct replies
    - **Navigation**: Clicking notification navigates to `/topic/{slug}?post={postId}` → triggers ThreadView with emerald ring highlight
    - **UI Architecture**:
      - **Desktop**: 340px fixed-width right sidebar, slide-from-right animation
      - **Mobile**: Full-width bottom sheet, slide-from-bottom animation, "Close" text button
      - **Overlay**: Custom non-Radix overlay (`bg-black/60`) below navbar (z-30)
      - **modal={false}**: Required on Sheet to keep navbar interactive
    - **Blue Dot Indicators**: Bell icon shows when `unreadCount > 0`, items show when `is_read === false`
    - **Performance**: Fetch limit 30, optimistic updates, useRef for Supabase client
    - **Security**: All queries filter by `recipient_id = user.id` (RLS + explicit filter)
    - **Modal Exceptions**: `system_welcome` and `badge_received` use `e.stopPropagation()` to keep sidebar open
23. **Badge System Architecture** (Jan 11, 2026):
    - **Documentation**: See [docs/BADGE_SYSTEM_MASTER.md](file:///Users/roycim/Documents/[5] Code/Projects/Midfield-proto/midfield/BADGE_SYSTEM_MASTER.md) for full audit/schema.
    - **Keys**: All badge keys match DB keys exactly (e.g., `starting_xi`, `playmaker`).
    - **Automation**: Triggers handle ALL grants. Retroactive grants supported via migration.
    - **Duplicate Prevention**: 4-layer defense (Schema Unique, On Conflict, Logic Check, Notification Unique Index).
    - **Frontend**: `user_badges` table is single source of truth. Manual frontend calculation banned.
    - **Reply Badge Fix** (Jan 11): Regista/Hat-Trick now awarded to PARENT post author (person being replied to), not root post author. Supports nested reply chains correctly.
24. **Sync Script Smart Upsert Enforcement** (Jan 13, 2026):
    - **Rule**: ALL sync scripts MUST use `smartUpsertTopic` utility from `packages/logic/src/sync/smart-upsert.ts`. Direct `.update()` calls are banned.
    - **Rationale**: Direct updates bypass metadata merging and risk overwriting expensive data (fc26_data, follower_count).
    - **Database Verification**: All scripts MUST log which database (PROD/DEV) they're connecting to at startup.
    - **Pattern**:
      ```typescript
      const projectId = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
      const isProduction = projectId === 'oerbyhaqhuixpjrubshm';
      console.log(isProduction ? '✅ PRODUCTION' : '⚠️  DEVELOPMENT');
      ```
    - **Image URL Migration**: TheSportsDB CDN migration (www.thesportsdb.com → r2.thesportsdb.com) handled automatically by `smartUpsertTopic` shallow merge.
    - **Reference**: See `docs/SYNC_FIX_JAN_2026.md` for full incident report and fix details.

──────────────────────────────────────────────────────────────────────────────
8) EGRESS DEFENSE & SECURITY PROTOCOLS
──────────────────────────────────────────────────────────────────────────────

- **No Base64 in Database**: Strictly forbidden. Use Supabase Storage. Database only stores `https://...` URLs.
- **Payload Discipline**:
  - **Uploads**: 2MB hard cap (Server).
  - **Compression**: Avatars must be resized Client-Side (Max 500x500px, JPEG 80%) *before* upload to save bandwidth & storage.
  - **Text Limits**: Posts (2000 chars), Bios (500 chars) enforced by DB constraints.
- **Wildcards Forbidden**: `select('*')` is banned in API routes & Server Actions. Explicitly select ALL fields (e.g. `id, title, metadata`) to prevent hidden payload bloat.
- **Protocol Security**:
  - **Secure Crons**: All cron endpoints (e.g., `/api/cron/*`) MUST validate `Authorization: Bearer <CRON_SECRET>`.
  - **Efficient RLS**: RLS policies MUST wrap auth calls in subqueries: `(select auth.uid())`. Never use bare `auth.uid()`. This prevents N+1 execution per row (InitPlan optimization).
  - **RLS Bypass Hardening**: If a Postgres function MUST bypass RLS (e.g. for Cron jobs), it must be `security definer` AND explicitly set `SET search_path = public` to prevent pathjacking.

──────────────────────────────────────────────────────────────────────────────
9) ENVIRONMENT SEPARATION (CRITICAL)
──────────────────────────────────────────────────────────────────────────────

**Two Supabase Projects Exist:**

| Environment | Project ID | Purpose |
|-------------|------------|---------|
| **DEV** | `bocldhavewgfxmbuycxy` | Local development & testing |
| **PROD** | `oerbyhaqhuixpjrubshm` | Production (Vercel + GitHub Actions) |

**Environment Configuration:**
- **Local `.env`** → Points to **DEV** database (for safe local testing)
- **Vercel Env Vars** → Points to **PROD** database (serves production traffic)
- **GitHub Actions Secrets** → MUST point to **PROD** database (sync scripts affect real data)

**⚠️ Critical Rule**: When running sync scripts locally (e.g., `npx tsx scripts/sync-*.ts`), you are modifying **DEV** data, NOT production. To run against production:
  - Option A: Temporarily update `.env` with PROD values, run script, revert
  - Option B: Use inline env vars: `NEXT_PUBLIC_SUPABASE_URL=https://oerbyhaqhuixpjrubshm.supabase.co SUPABASE_SERVICE_ROLE_KEY=[key] npx tsx scripts/...`

**Jan 2026 Incident**: GitHub Actions secrets were incorrectly pointing to DEV. This caused sync scripts to update DEV instead of PROD, leading to stale image URLs in production. **Always verify** GitHub Secrets match Vercel env vars.

END OF DOCTRINE.
