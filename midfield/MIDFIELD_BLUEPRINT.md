# ⚡ MIDFIELD_BLUEPRINT.md — THE LIVING DOCTRINE (v7.3)

<!--
UPDATE LOG (Dec 28, 2025):
- LiveFeed animation now uses fixed column assignment to prevent reshuffling on new takes (no more column-flip bug)
- Tactical SVG (X/O/arrows) overlay removed from hero; defer tactical aesthetics until a future design pass
- Design System Law reinforced: Any decorative/visual motif must be removable without breaking layout or performance
- All hero/LiveFeed changes must be 100% responsive, mobile-native compatible, and desktop-perfect (see RESPONSIVE PERFECTION LAW)
-->

STATUS: ACTIVE // DEFINITIVE SINGLE SOURCE OF TRUTH
OPERATIONAL PHASE: OPTIMIZATION → MOBILE-NATIVE PREP → SCALE
FORGE DATE: DEC 28, 2025 (Updated)
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

Example readiness response style (template):
"Doctrine read and internalized. I'm aligned on Midfield's Design System, performance/SEO 100/100, mobile-native portability, and zero-regression desktop UI. Ready to execute. Give me the next objective."

Non-negotiables:
1) DESKTOP IS SACRED: If it's amazing on full-width laptop/PC, do not 'improve' it.
2) PERFORMANCE IS RELIGION: No waterfalls. No bloat. No accidental heavy client JS.
3) SEO IS A GROWTH WEAPON: Sharing previews + crawlability + speed signals must be excellent.
4) MOBILE-NATIVE IS LAW: Web decisions must translate to Expo/RN patterns.
5) NO OVERENGINEERING: Prefer boring, proven solutions. Complexity must justify itself.
6) RESPONSIVE FROM DAY 1: Test 320px/640px/768px/1024px/1920px BEFORE shipping. See RESPONSIVE_CHECKLIST.md.

╔══════════════════════════════════════════════════════════════════════════════╗
║  🚨 RESPONSIVE PERFECTION LAW — READ THIS BEFORE WRITING ANY FRONTEND CODE   ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                                                                              ║
║  THE WEB VERSION IS THE MOBILE VERSION. Users browse on phones, tablets,    ║
║  laptops with browser windows at ANY size. There is no "desktop-only" path. ║
║                                                                              ║
║  EVERY SINGLE LINE of frontend code must be designed for:                   ║
║  • ANY window width from 320px to 2560px+ (continuous, not just breakpoints)║
║  • ANY interactive state (menus open, modals visible, loading, expanded)    ║
║  • ANY content length (long usernames, long dates, long titles, edge cases) ║
║  • ANY combination of the above simultaneously                              ║
║                                                                              ║
║  BEFORE committing frontend code, mentally (or actually) test:              ║
║  1. Drag browser window from 320px → 1920px slowly. Any collision? Wrap?    ║
║  2. Toggle every interactive state at EACH size. Does layout break?         ║
║  3. Use extreme content (30-char username, longest date format). Overflow?  ║
║  4. Test frontier sizes: 375px, 390px, 428px, 768px, 1024px, 1440px         ║
║                                                                              ║
║  COMMON BUGS TO PREVENT:                                                    ║
║  • Text truncation without "..." ellipsis                                   ║
║  • Elements overlapping when state changes (e.g., menu opens)               ║
║  • Content pushing other content off-screen                                 ║
║  • Flex items wrapping unexpectedly                                         ║
║  • Touch targets too small (<44px) on mobile                                ║
║  • Horizontal scroll appearing at certain widths                            ║
║                                                                              ║
║  SOLUTION PATTERNS:                                                         ║
║  • Use unified text blocks with text-ellipsis for graceful truncation       ║
║  • Prefer collision-based truncation over fixed pixel breakpoints           ║
║  • Test interactive states (hover, open, selected) at ALL viewport sizes    ║
║  • Use min-w-0 + overflow-hidden on flex children that must truncate        ║
║  • Inline styles for width/max-width in flex containers (Tailwind v4 bug)   ║
║                                                                              ║
║  If it looks broken at ANY size or state combination, it ships broken.      ║
║  There are no acceptable edge cases. Fix it before moving on.               ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝

LIVING DOCTRINE REQUIREMENT:
- You MUST update this file as work progresses whenever you discover:
  - a new non-obvious design law
  - a performance/SEO rule or recurring pitfall
  - a solved regression pattern
  - a finalized component archetype
  - a security mandate
  - any "we always do it this way" decision
Goal: baton must be passable at any moment.

──────────────────────────────────────────────────────────────────────────────
1) MIDFIELD — STRATEGIC NUCLEUS (THE WHY)
──────────────────────────────────────────────────────────────────────────────

Midfield is a data-driven football discussion engine: structured topic pages + takes.
It bridges hard stats (TheSportsDB) and community opinion (Takes).

Product pillars:
- STRUCTURE OVER CHAOS: Topic pages are permanent homes for discussion (vs ephemeral feeds).
- DATA AS CONTEXT ("DATA NOIR"): UI feels like premium sports analytics; debate anchored in facts.
- CIVILITY VIA UX: Premium organized UI nudges better behavior than generic social streams.

Target persona:
- Online Super-Fan: data-literate, high engagement, tired of noise, wants organized debate.

Strategic truth:
- Every shared link is a growth surface → previews must look perfect (OG/Twitter).
- Speed is a feature (perceived quality + SEO + retention).

──────────────────────────────────────────────────────────────────────────────
2) TECH STACK & REPO TOPOLOGY (DEC 2025)
──────────────────────────────────────────────────────────────────────────────

Stack:
- Next.js 16.x (App Router), React 19, TypeScript strict
- Tailwind CSS v4 (CSS-first config)
- Supabase (Postgres + Auth + Edge Functions + Realtime + Storage)
- Turborepo + pnpm
- Icons: lucide-react (tree-shakeable)

Monorepo structure:
- apps/web        → Next.js app (UI + routing)
- apps/expo       → Expo/RN app (planned/in-repo)
- packages/logic   → shared business logic (platform-agnostic)
- packages/types   → shared TypeScript types
- packages/ui      → shared design tokens (Tailwind v4 tokens, utilities)

Operating rule:
- Anything that must exist on mobile later must NOT be trapped inside apps/web UI code.

──────────────────────────────────────────────────────────────────────────────
3) ARCHITECTURAL CODEX (THE HOW)
──────────────────────────────────────────────────────────────────────────────

A) UNIFIED ENTITY MODEL: "topics"
- Every entity is a Topic: club, player, league, match, etc.
- topics.type discriminates entity type
- topics.metadata (JSONB) stores flexible fields (position, kit, etc.)
- **topics.fc26_data (JSONB)** stores FC26/SoFIFA ratings data separately
  - **CRITICAL**: TheSportsDB sync writes to `metadata`; FC26 sync writes to `fc26_data`
  - **NEVER** merge external data sources into same column (causes overwrites)
  - Pattern: Separate column per external data source to prevent sync conflicts
  - Migration: `20250128000000_add_fc26_data_column.sql`
- topic_relationships stores graph links (club→player, league→club, etc.)

B) UNIVERSAL CODE RELIGION (MOBILE-NATIVE LAW)
- Business logic belongs in packages/logic:
  - fetching queries, transformations, ranking, search, server action helpers
- UI belongs in apps/web; avoid mixing UI layer with query/business rules.
- Logic must be platform-agnostic:
  - no window/document assumptions
  - accept typed SupabaseClient where appropriate

C) DATA FLOW RULES (NEXT.JS APP ROUTER)
- Prefer Server Components for data fetching
- Mutations should be Server Actions (portable and consistent)
- Avoid client-side fetch waterfalls and client-only data dependency chains

D) PERFORMANCE HARD LAWS
- NO sequential awaits for independent fetches: use Promise.all
- Avoid unnecessary client components; keep client JS minimal
- Memoize expensive derivations (sorting, scoring, grouping) where it matters
- Zero bloat discipline: no heavy libs without explicit justification

I) TAILWIND V4 LAYOUT LAW (CRITICAL)
- width/max-width/margin:auto MUST use inline styles (not Tailwind classes)
- Tailwind v4 width classes (w-full, max-w-*) collapse in flex containers
- See: .agent/workflows/prevent-layout-bugs.md for full details
- This is a KNOWN BUG pattern - always use style={{ width: '100%' }}

E) IMAGE LAW (100/100 PERFORMANCE KILLER)
- next/image ONLY for entity/user content (no raw <img> tags)
- Configure next.config for remotePatterns:
  - supabase storage domain
  - r2.thesportsdb.com / www.thesportsdb.com
  - api.dicebear.com (if used)
- Ensure images use appropriate sizing (sizes prop / width/height)
- This is a core Core Web Vitals lever (LCP).
- **LEAGUE/COUNTRY FLAGS**: Use actual flag images from Supabase Storage (league-logos bucket):
  - england.png, spain.png, italy.png, germany.png, france.png
  - NO emoji flags (inconsistent rendering, poor quality on certain systems)
  - Pattern: `<img src={flagUrl} className="h-5 w-auto object-contain rounded border" />`
  - Natural dimensions preserved (w-auto), subtle border for definition

F) SEO LAW (100/100 DISCOVERABILITY)
- Every page must have correct metadata:
  - metadataBase
  - openGraph (title/description/url/images/siteName)
  - twitter (cards; still used by X)
- Sharing previews must never be broken.
- Crawlability requires fast SSR and stable structure.
- SEO is not keyword spam; it's structure + speed + clean metadata.

K) AUTH FLOW (PRODUCTION-CRITICAL)
- Middleware must EXCLUDE /auth/callback from processing:
  - config.matcher must skip /auth/callback to prevent OAuth code consumption
  - Pattern: `'/((?!_next/static|_next/image|favicon.ico|auth/callback|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'`
- URL resolution for Vercel: use apps/web/src/lib/url.ts getURL() utility
  - Prioritizes: NEXT_PUBLIC_SITE_URL → NEXT_PUBLIC_VERCEL_URL → VERCEL_URL → localhost
  - Auth actions read origin header with validation fallback to getURL()
- Supabase Dashboard: Site URL + all deployment domains must be in Redirect URLs list
- Navbar auth UX pattern (when logged out):
  - Desktop/Tablet (≥768px): "Log in" (ghost) + "Join Midfield" (primary emerald)
  - Small tablet (640-767px): "Join Midfield" only
  - Mobile (<640px): User icon only
  - Rationale: Dual CTA follows modern SaaS standard; "Join" emphasizes community
- **AUTH PAGE COPY**:
  - Signup tagline: "Your home for intelligent football discussion" (not clichéd/academic)
  - Login: Google button FIRST, then divider with "or continue with email"
  - Divider text has solid background (bg-white dark:bg-neutral-900) so line doesn't show through

G) SEARCH QUALITY BASELINE
- Server-side filter: relevance score must be >= 50
- Low-score results are noise; do not show them.

H) SECURITY CITADEL (NON-NEGOTIABLE)
- RLS: principle of least privilege
- Triggers / privileged DB functions:
  - SECURITY DEFINER
  - MUST include: SET search_path = public (prevents search path hijacking)
- Avoid dynamic SQL from user input inside privileged functions

J) SUPABASE MCP SERVER (USE WITH EXTREME CARE)
- We have access to Supabase MCP server for database operations
- Usage philosophy: SPARINGLY and with extreme caution
- Prefer migrations in supabase/migrations/ for all schema changes
- Only use MCP for:
  - Emergency fixes (like RLS policy hotfixes)
  - One-off data corrections
  - Quick diagnostic queries
- NEVER use for:
  - Regular development workflow
  - Bulk data operations without review
  - Production schema changes without migration files
- Every MCP operation should be followed by a proper migration file
- Rationale: Migration files are version controlled, reviewable, and portable


L) SYNC INFRASTRUCTURE ("THE TICKET SYSTEM")
- Architecture: "Scheduler-Worker" Job Queue to bypass serverless timeouts.
- Scheduler (04:00 UTC): Enqueues jobs -> `sync_jobs` table (<1s).
- Worker (Every Minute): Processes 5 pending jobs from queue.
- Integrity:
  - Smart Upsert: Preserves slugs/IDs via `thesportsdb_id` identity.
  - History: Closes old relationships (valid_until) on transfer; never overwrites.
- Security: `sync_jobs` table protected by RLS (Service Role Only).
- Resilience: Scheduler automatically resets "Zombie" jobs (stuck in 'processing' > 1h) to 'pending' before queuing new work.

M) HYBRID SYNC STRATEGY ("STATIC VS DYNAMIC")
- **Problem**: Metadata (height, founded date) rarely changes, but dynamic data (scores, ratings) changes daily.
- **Solution**: Split sync schedules to save API costs and reduce noise.
- **1. Static Metadata (Weekly via GitHub Actions)**:
  - **Script**: `scripts/sync-static-metadata.ts`
  - **Schedule**: Every Sunday at 03:00 UTC
  - **Method**: "Team-Based V1 Lookup"
    - Fetches *all* clubs, then calls `lookup_all_players.php?id={teamId}` (V1 API)
    - Why: V1 team lookup returns FULL player metadata (kit, height, etc.); V2 list does not.
    - Reliability: 100% success rate on test; zero errors.
- **2. Dynamic Data (Daily via Edge Functions)**:
  - **Fixtures/Scores**: Scalable V2 API (Edge Functions + Cron)
  - **FC26 Ratings**: On-demand scraper

N) FC26 RATINGS INTEGRATION
- **Data Source**: SoFIFA (via custom scraper)
- **Storage**: `topics.fc26_data` JSONB column (Isolated from `metadata`)
- **Pipeline**:
  1. `scripts/fc26-scraper/scrape.py`: Python scraper (Dockerized) bypasses 403s
  2. `supabase/functions/sync-ratings`: Edge function receives JSON payload
  3. **Smart Matching**: Matches by ID -> DOB+Name -> Fuzzy Name
- **UI Policy**:
  - **Badge Colors**:
    - 80+ (Elite): Emerald (`text-emerald-500`)
    - 70-79 (Good): Dark Emerald (`text-emerald-700/80`)
    - 60-69 (Average): Yellow
    - <60: Orange/Red
  - **Data Noir**: No "FC26" text label on badges; numbers speak for themselves.

N) ONBOARDING WIZARD ("ZERO FRICTION")
- Trigger: New users without `username` or `onboarding_completed = false`
- Flow:
  - Step 1: Username + Optional Avatar
    - Real-time validation (checks uniqueness)
    - Auto-generated avatar fallback (DiceBear)
    - Formatted input (lowercase, alphanumeric + underscore)
  - Step 2: Favorite Club Selection
    - Searchable club grid (by name/league)
    - Visual badges for recognition
    - Optional (can skip)
- Implementation:
  - `OnboardingWizard.tsx`: 2-step modal (can't dismiss)
  - `OnboardingProvider.tsx`: Auto-detects need, triggers wizard
  - Auth callback: Creates user record with `onboarding_completed = false`
- Schema:
  - `users.favorite_club_id`: UUID FK to topics(id)
  - `users.onboarding_completed`: Boolean (default false)
  - RLS: Users can update own profile
- UX:
  - Progress bar, smooth transitions
  - Mobile-responsive grid
  - Never shows again after completion


P) PARTIAL DATA STRATEGY ("THE STUB LAW")
- Problem: Strict Foreign Keys (FK) block imports when minor entities (e.g., lower-league Cup opponents) are missing.
- Doctrine: "The Import Must Flow." Never fail an entire batch for one missing team.
- Solution: **Just-in-Time Stubs**.
  - If a fixture references "Crawley Town" and they don't exist:
  - IMMEDIATELY create a valid `topics` record (type=club, title="Crawley Town").
  - Metadata is minimal (`is_stub: true`).
  - Cache the ID in memory to prevent duplicate inserts.
- Result: Zero FK constraint errors. 100% fixture coverage. Future agents: DO NOT try to pre-import every team in the world. Use Stubs.


Q) DEEP TECHNICAL DOCTRINE: DATA PIPELINES (THE ENGINE ROOM)
This section allows a future agent to rebuild or debug the data ingestion engine without re-reading 100 logs.

### 1. FC26 RATINGS PIPELINE (`sync-ratings.yml` → `scripts/fc26-scraper/`)
- **Core Engine**: Python (pandas, soccerdata, requests).
- **Driver Script**: `scrape.py`
- **Key Mechanics**:
  - **Threaded Scraping**: Uses `concurrent.futures.ThreadPoolExecutor(max_workers=5)` to fetch 5 players simultaneously.
    - *Why?* Sequential scraping is too slow (hours vs minutes).
  - **Anti-Bot Countermeasure**:
    - **Problem**: SoFIFA returns `403 Forbidden` to default Python User-Agents.
    - **Solution**: We **Monkey-Patch** `requests.Session` at script initialization to inject a Chrome/Mac User-Agent + Referer headers.
    - *Code pointer*: See `patched_session` function in `scrape.py`.
  - **Dockerization**:
    - Uses a multi-stage `python:3.11-slim` build.
    - Installs system deps (`gcc`, `libpq-dev`) for pandas compilation.
    - GitHub Actions builds this container ephemerally for every run.
- **Edge Function Handoff**:
  - The script does NOT write to DB directly. It POSTs JSON batches to a Supabase Edge Function (`sync-ratings`).
  - *Why?* Decouples scraping logic from database schema constraints.

### 2. FIXTURE IMPORT PIPELINE (`sync-fixtures.yml` → `scripts/import-thesportsdb-v2.ts`)
- **Core Engine**: TypeScript (Node.js 20, tsx).
- **Driver Script**: `import-thesportsdb-v2.ts`
- **Optimization Strategy**:
  - **Concurrent Teams**: Process 5 teams in parallel blocks (`chunkArray` utility).
  - **Batch Upserts**: Fixtures are collected in memory array and sent in ONE `upsert()` call per team (vs 40 calls per team). ~90% IO reduction.
- **The "Stub" Cache (Critical/Complex)**:
  - **Problem**: Import crashes if HomeTeam exists but AwayTeam (e.g., "Wrexham") is missing in `topics`.
  - **Solution**: `ensureStubTopic(uuid, name)` function.
  - **Optimization**: Uses a `Set<string>` (in-memory cache) to track created/existing topics.
    - *Logic*: Check Cache -> If hit, Skip. -> Else, Check DB -> If hit, Add to Cache, Skip. -> Else, Insert Stub & Add to Cache.
- **Secrets**:
  - `THESPORTSDB_API_KEY`: Required for API V2 (Premium).
  - `SUPABASE_SERVICE_ROLE_KEY`: Required for bypassing RLS during bulk import.

### 3. GITHUB ACTIONS SCHEDULING (CRON)
- **Fixtures**: `0 6 * * *` (Daily 6am UTC).
- **Ratings**: `0 4 * * 6` (Saturdays 4am UTC).
- **Secrets Mapping**:
  - GitHub Secret `SUPABASE_URL` -> Mapped to Env `NEXT_PUBLIC_SUPABASE_URL` for script compatibility.
  - GitHub Secret `THESPORTSDB_API_KEY` -> Env `THESPORTSDB_API_KEY`.
- **Debugging**:
  - If jobs fail with "Forbidden", check the User-Agent patch in `scrape.py`.
  - If jobs fail with "Database Error", check the `stubCache` logic in `import-thesportsdb-v2.ts`.


S) ENTITY HELPER UNIFICATION (`src/lib/entity-helpers.ts`)
- **Single Source of Truth**: Document created to centralize dispersed logic.
- **Components**: `FeaturedPlayers`, `TopicCard`, `SimilarWidget`, `EntityHeader`, `TopicPageClient`, `EntityCycler`.
- **Exports**:
  - `POSITION_MAPPING`: Standardized FIFA/Standard positions to Abbr/Colors.
  - `getPositionInfo(pos)`: Returns `{ abbr, full, color }` with consistent styling.
  - `getRatingColor(rating)`: Returns Emerald/Yellow/Red classes based on 80/60/50 thresholds.
  - `PLAYER_IMAGE_STYLE`: Canonical image styling (scale, filter, position).
- **Rule**: NEVER hardcode position colors or rating thresholds in components. Import from helper.


R) RECENT TECHNICAL CONTEXT (DEC 2025 TRANSITION LOG)
**CRITICAL READ FOR NEXT AGENT**: The system is in active transition to full automation.

1. **FC26 SCRAPER (`scripts/fc26-scraper`)**:
   - **Protection Bypass**: We use `cloudscraper` (Python lib) to bypass SoFIFA's Cloudflare 403s. Standard requests failed.
   - **Architecture**: `GitHub Action` -> `Docker` -> `Python Script` -> `Supabase Edge Function` -> `DB`.
   - **Concurrency**: `ThreadPoolExecutor(max_workers=5)` is TUNED. Do not increase (risk of IP ban). Do not decrease (too slow).
   - **State**: FUNCTIONAL.

2. **FIXTURE AUTOMATION (`scripts/import-thesportsdb-v2.ts`)**:
   - **The "Missing Team" Crisis**: Solved via `ensureStubTopic`. We create minimal club topics on the fly.
   - **Performance**:
     - `stubCache` (Set<string>): Prevents thousands of redundant SELECTs for "Premier League" topic.
     - `Batch Upsert`: 50 fixtures upserted in ONE call per team.
   - **Current Bug/Gap**:
     - **Standings**: User reports `leagues_standings` table exists. We were about to create `standings`. **ACTION**: Check `leagues_standings` schema and use it. Do not duplicate.
     - **Descriptions**: Truncation limit removed. Valid data flow verified.

3. **FRONTEND STATE (`apps/web`)**:
   - **EntityHeader**: Robust, handles multi-type (Club/Player/League) and watermarks appropriately.
     - **Trophy Logic**: Mapped to `metadata.trophy_url`. If missing, API V2 likely didn't return it for that league.
   - **ClubFixtures**: Basic implementation.
     - **MISSING**: "Form" (W/L/D bubbles) and "League Table" snippet.
   - **Design**: "Data Noir" (Emerald/Slate/Neutral) is fully established. Do not deviate.

4. **OPERATIONAL RISKS**:
   - **GitHub PAT**: Needs `workflow` scope to push YAML changes.
   - **Database Permissions**: We cannot write DDL (migrations) directly via MCP. Must provide SQL to user or use `supabase db push` if available.

**IMMEDIATE NEXT OBJECTIVE**: Resolve the Standings table conflict and implement the Frontend Form/Standings UI.




──────────────────────────────────────────────────────────────────────────────
4) DESIGN SYSTEM — "MIDFIELD PREMIUM / DATA NOIR"
──────────────────────────────────────────────────────────────────────────────

Design objective:
- Premium sports analytics vibe: high contrast, sharp borders, minimal shadows.
- "Sleek, data-first, intentional." If it looks generic, it fails.

A) THE 5 IMMUTABLE DESIGN LAWS
1) Mandatory Hover:
   - Every interactive element must have a visible hover state (no invisible click areas).
   - Prefer color/border shifts over scaling.
2) No Native Alerts:
   - NEVER use window.alert/confirm. Use Toast system.
3) Strict Border Hierarchy:
   - Borders define structure; avoid soft shadows.
4) Optical Alignment:
   - Icons beside multi-line text must be items-start + mt-0.5/mt-1 for x-height alignment.
5) Theme Consistency:
   - Light: slate-50 → slate-900
   - Dark: neutral-900 background, neutral-100 text
   - Primary accent: Emerald with precise steps (below)

B) COLOR CODEX (NON-NEGOTIABLE STEPS)
- Primary button:
  - Light: emerald-600 (base), emerald-500 (hover)
  - Dark: emerald-650 (base), emerald-550 (hover)
- Destructive button:
  - Light: red-600 (base), red-500 (hover)
  - Dark: red-650 (base), red-550 (hover)
- Borders:
  - Light: slate-200 / slate-300
  - Dark: neutral-800 / neutral-700
- Backgrounds:
  - Light: slate-50 / slate-100
  - Dark: neutral-900 / neutral-800

C) UI PHYSICS / MICRO-RULES (DETAILS MATTER)
- Every clickable non-button must explicitly have cursor-pointer.
- Avoid "accidental layout": spacing rhythm must feel designed.
- Long names must not break layout:
  - use line-clamp / truncation intentionally
- Keep visual hierarchy strong:
  - primary info must remain primary at all breakpoints
- No random shadows; borders are the language.
- Corner radius standard: rounded-md (6px) for interactive elements
  - Buttons, inputs, badges, small cards.
  - Consistent radius creates visual harmony.
  - **LiveFeed/Hero Cards**: Strictly rounded-md.

D) COMPONENT ARCHETYPES (CANONICAL)
1) Player / Entity avatars (fallback silhouette):
   - /player-silhouette.png
   - Mask science:
     - mask-position: center 8px (reduces top gap)
     - mask-size: 130% (headshot zoom)
   - Note: next/image fill requires a relative parent container.

1b) **USER AVATARS (CRITICAL RULE)**:
   - **ALWAYS SQUARE** - use `rounded-md`, NEVER `rounded-full`
   - Only player headshots are circular (they use special PLAYER_IMAGE_STYLE)
   - Pattern: `<div className="w-8 h-8 rounded-md bg-slate-200 dark:bg-neutral-700 overflow-hidden">`
   - This applies to: TakeCard, LiveHero cards, reply avatars, navbar, everywhere

1c) **REACTION SYSTEM (NO HEARTS)**:
   - Midfield uses EMOJI reactions, not likes/hearts
   - The 4 reactions: 🔥 (fire/hot), 🤔 (hmm/think), 🤝 (fair), 💀 (dead/brutal)
   - NEVER use Heart icon or "likes" terminology
   - Display pattern: emoji + count in rounded-md pill
   - Reference: `ReactionBar.tsx` for canonical implementation

2) Topic cards:
   - Premium, sharp, clean.
   - Watermark badges allowed at extremely low opacity (0.04–0.08).
   - For badge fill containers use padding (e.g., p-1) to avoid clipping.

3) Modals: "Holy Trinity"
   - Header: icon + title aligned perfectly
   - Body: full-width text, NEVER indented under the header icon
   - Footer: symmetrical ghost buttons with minimum width for visual balance

4) EntityHeader (Hero Card):
   - Background watermark visible at ALL viewport sizes (responsive sizing)
   - Watermark scales: w-28/h-28 (mobile) → w-40/h-40 (sm) → w-52/h-52 (md+)
   - Never hide decorative elements on mobile - scale them appropriately
   - **LEAGUE LOGO SUPPORT**: For league entities, display logo with theme switching:
     - Light mode: logo_url
     - Dark mode: logo_url_dark (or fallback to logo_url)
     - Use <img> tags for theme switching, not next/image

5) TakeCard / Reply Spine System:
   - Uses 3-column grid for replies: [spine_col | avatar_col | content_col]
   - Spine termination: explicit height values (not bottom:0) on last element
   - Height must be responsive: different values for mobile vs desktop breakpoints
   - Pattern: `h-[Xpx] sm:h-[Ypx]` with matching `-top-N sm:-top-M` offsets
   - Curve uses border-l-2 + border-b-2 + rounded-bl-lg
   - Reply button icon: CornerDownLeft (consistent with main reply action)
   - Reply button text: hidden on mobile (<xs), visible on xs+ breakpoints

6) **HERO BANNERS (Browse Pages: Players, Clubs, Leagues)**:
   - **PATTERN**: "Data Noir" with discrete grid + radial gradient stain effect
   - **Layout**: Flex container with icon+title left, stats card right
   - **Grid Background**:
     - Single 24×24 grid with radial gradient mask for greenish "stain" effect
     - Opacity: 0.2 (light) / 0.12 (dark)
     - Radial mask: ellipse 800×500px at top-right, emerald fade to 65%
     - Creates elegant greenish accent without dual-layer alignment issues
   - **Icon Container**:
     - OPAQUE backgrounds: `bg-emerald-100 dark:bg-emerald-950/50`
     - Borders: `border-emerald-200 dark:border-emerald-900`
     - Radius: `rounded-md` (consistent with design system)
     - Size: 14/14 (mobile) → 16/16 (desktop)
   - **Stats Card** (right side):
     - OPAQUE backgrounds: `bg-slate-100 dark:bg-neutral-800`
     - Single-row layout: icon + number + label all horizontal
     - Radius: `rounded-md`
   - **Beta Badges** (Leagues only):
     - Small pill: `px-2.5 py-1 text-[10px]`
     - Positioned absolutely: `top-4 right-4 sm:top-6 sm:right-8`
     - Static Sparkles icon (no pulsing animation)
     - Emerald colors matching app style
     - Text: "More Coming Soon!" (enthusiastic, clear)
   - **Color Palette**:
     - Light: `from-slate-50 via-white to-slate-50`
     - Dark: `from-neutral-950 via-neutral-900 to-neutral-950` (NEUTRAL not slate)
     - Borders: `border-slate-200 dark:border-neutral-800/50`

7) **LEAGUE CARDS** (Featured on /leagues page):
   - Larger, more prominent (only 5 leagues total)
   - Grid: `sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5`
   - League logos: 24x24 display, theme-aware switching
   - **Country Flag Badges**:
     - Image-only (no text), natural dimensions: `h-5 w-auto`
     - Smaller radius: `rounded` (not rounded-md)
     - Subtle border: `border-slate-200 dark:border-neutral-700`
   - Club count: "X clubs" with Shield icon in rounded-md container
   - Background gradient accent on hover for depth

8) **SIDEBAR LAYOUTS**:
   - **Sticky Behavior**: Must use `self-start` on sticky containers to prevent full-height stretching bugs.
   - **Collapsibles**: "About" sections should be clean text (no nested cards). Use "Read More" gradients for long text.
   - **Squad Lists**: Managers/Staff must appear at the top. Order: Manager -> GK -> Def -> Mid -> Fwd.

9) **HOMEPAGE SPLIT HERO** (`SplitHero.tsx`):
   - **Concept**: Split-layout hero inviting users into active football conversation
   - **Architecture**: Client component fetching data client-side to AVOID RSC SERIALIZATION ISSUES
   - **Left Column**: `EntityCycler.tsx`
     - Title: "The Home of Football Discussion"
     - One-liner prompt: "What's your take on [Entity]?" with inline mini-badge
     - Entity cycles every 3.5s with smooth y-axis animation
     - Mini-badge shows: avatar (circular for players) + name + "?"
     - CTA: "Join the conversation" (emerald button, no shadows)
   - **Right Column**: `LiveFeed.tsx`
     - Header: Clock icon + "Latest Takes" (uppercase, tracking-wider)
     - Shows 6 proper mini-TakeCards (not table rows)
     - Each card: topic badge (with image), content (2-line clamp), author row
     - Author avatars: SQUARE (rounded-md) per design system
     - Time: relative (just now, 5m ago, 2h ago)
     - Skeleton loading state
   - **Data**: `getHeroEntities()` + `getHeroTakes()` in `hero-data.ts`
   - **Background**: Subtle tactical grid pattern (40x40, opacity 0.025)
   - **CRITICAL LESSON**: Never pass Supabase JSONB `metadata` through RSC
     - Causes "Maximum call stack size exceeded" during serialization
     - Solution: Fetch data client-side OR use JSON.parse(JSON.stringify()) deep clone

10) **BUTTONS - NO SHADOWS**:
   - Primary buttons NEVER have shadow-* classes
   - Clean, flat design is the Midfield aesthetic
   - Hover states use color transitions, not shadow changes

F) ICON CONSISTENCY LAW
- Reply actions: ALWAYS use CornerDownLeft icon (main post + nested replies)
- Do not mix MessageCircle for replies - that's for chat/DM contexts
- Icon + text pattern: icon always visible, text hidden below xs breakpoint

E) "MOBILE-FIRST" RESPONSIVENESS LAW (DESIGN, NOT JUST CSS)
- Desktop full-width is already amazing: DO NOT change it.
- Smaller sizes must be equally intentional:
  - no cramped density
  - no broken hierarchy
  - no accidental stacking
- Prefer breakpoint-scoped changes that do not affect large screens.

──────────────────────────────────────────────────────────────────────────────
5) RESPONSIVENESS DOCTRINE (QUALITY BAR)
──────────────────────────────────────────────────────────────────────────────

Goal:
Every single element must look intentionally placed at every window size.
Nothing should feel "collapsed" or "just wrapped."

Non-negotiable constraint:
- If it looks amazing on desktop, do not modify that desktop layout.
- Fix responsiveness by adapting at smaller breakpoints only.

Responsive audit checklist (mental model):
- No horizontal scroll
- Consistent gutters/padding across breakpoints
- Typography remains readable (line length, truncation, hierarchy)
- Tap targets are usable on mobile (spacing, hit areas)
- Cards/lists don't become dense unreadable blocks
- Modals/drawers behave correctly and are reachable
- Long text edge cases behave gracefully

──────────────────────────────────────────────────────────────────────────────
6) PERFORMANCE + SEO "FREE WINS" CHECKLIST (ALWAYS APPLY)
──────────────────────────────────────────────────────────────────────────────

- next/image used everywhere for entity/user images
- Promise.all for independent server fetches (no waterfalls)
- Keep client components minimal; avoid unnecessary useState in deep trees
- Cache/memoize expensive derived operations when repeated (sort/score/group)
- Proper Open Graph + Twitter metadata everywhere it matters
- metadataBase set so relative OG assets resolve correctly
- Avoid heavy libs by default; justify each dependency

**SHARE CARD IMAGE GENERATION (Server-Side OG Images):**
- Use `/api/share-card` route with `next/og` (ImageResponse) for server-side rendering
- Bypasses all CORS issues by fetching/rendering images server-side
- Design mirrors in-app UI patterns (EntityHeader + TakeCard aesthetics)
- System fonts only (-apple-system, Inter-like stack) — custom font loading in Satori is fragile
- Card specs: 1080×1080 (Square 1:1, optimal for Instagram feed/social)
- Dynamic font sizing based on content length for visual harmony
- Architecture: API-First / "Black Box" generation via server — strictly mobile-native compatible (client just GETs the image)
- Props passed: content, authorUsername, authorAvatar, topicTitle, topicImageUrl, topicType, clubName, clubBadgeUrl, theme
- Renders: entity header (player cutout/club badge + rating + badges), take zone (avatar + @username + content), footer (logo + slogan + domain)

──────────────────────────────────────────────────────────────────────────────
7) CURRENT SITREP (WHAT'S DONE / WHAT'S NEXT)
──────────────────────────────────────────────────────────────────────────────

Completed (as of Dec 26, 2025):
- **API v2 Upgrade**: Migrated to new unlimited `/list` endpoint. +1700 players added.
- **Sync Infrastructure ("The Ticket System")**:
  - `sync_jobs` queue table created (RLS protected).
  - Edge Functions deployed (`sync-scheduler`, `sync-worker`) using shared logic.
  - Manual Dashboard Deployment strategy adopted (Docker-free).
  - Cron automation enabled (Daily + Every Minute).
- Shared logic pillars extracted (packages/logic)
- Strict design language codified (Data Noir)
- Security-definer hardening rule codified (search_path = public)
- Search relevance baseline (>= 50) enforced conceptually
- Performance/SEO priorities identified (images, parallel fetching, metadata)
- **Share card generation** via server-side `next/og` (CORS-free, in-app UI mirroring)
- Club badge/name integration in player share cards
- TakeCard/TakeFeed/TopicPageClient prop threading for club context
- **TakeCard responsive spine system**: 3-col grid, explicit height termination, responsive values
- **EntityHeader watermark**: visible at all viewport sizes with responsive scaling
- **Icon consistency**: CornerDownLeft for all reply actions (main + nested)
- **Hero banners redesigned**: Data Noir style with discrete grids + emerald zones (Players, Clubs, Leagues)
- **League page architecture**: Featured leagues with prominent cards, flag images, beta badges
- **EntityHeader league support**: Theme-aware logo switching for league entities
- **Auth page polish**: Better copy, Google-first layout, proper divider backgrounds
- **Flag image migration**: All emoji flags replaced with actual images from Supabase Storage
- **Homepage section ordering**: Featured Clubs before Leagues for better UX flow
- **Static Metadata Automation**: GitHub Action (`weekly-metadata-sync.yml`) runs Sundays to sync kit numbers/heights/descriptions.
- **Frontend Polish (Dec 28)**:
  - Sticky sidebars (`self-start`)
  - Clickable league badges on club pages
  - Managers added to squad lists
  - FC26 badges refined (emerald tiers w/o text labels)
  - About section redesigned (text-only + gradient)
- **Homepage Hero Redesign (Dec 28)**:
  - `LiveHero.tsx`: Live feed of animated take cards
  - `HeroWidgets.tsx`: Match Center + Trending side-by-side
  - `getHeroLiveFeed()`: Server action for hero data
  - Homepage full-width layout (no sidebar constraint)
  - Design system compliance enforced (square avatars, emoji reactions, no button shadows)
  - See: `docs/HOMEPAGE_HERO_CONTEXT.txt` for detailed handoff docs
  - **Entity Utils Centralization**: `src/lib/entity-helpers.ts` implemented to remove 5+ instances of duplicated logic.
  - **Hero Animation Polish**: LiveFeed column-based animation with fixed column assignment (no reshuffling on new takes)
  - **Tactical Aesthetics**: DEFERRED - X's/O's/arrows SVG overlay removed; to be revisited later with better design

Next objectives (likely):
- Responsiveness hardening for smaller viewports WITHOUT desktop regression
- Expo/Mobile implementation using shared logic
- Advanced match statistics integration
- Engagement features (takes/replies/reactions) with strict performance discipline

──────────────────────────────────────────────────────────────────────────────
8) OPERATOR COMMANDS (DEV CHEATSHEET)
──────────────────────────────────────────────────────────────────────────────

- Dev: pnpm dev:web
- Lint: pnpm lint
- Assets: apps/web/public
- Icons: lucide-react
- Always keep blueprint updated after finalizing a rule or pattern.

END OF DOCTRINE.
Stay sharp. Avoid regressions. Win with speed, taste, and discipline.

