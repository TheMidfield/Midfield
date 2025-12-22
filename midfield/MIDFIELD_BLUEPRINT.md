# ⚡ MIDFIELD_BLUEPRINT.md — THE LIVING DOCTRINE (v7.1)
STATUS: ACTIVE // DEFINITIVE SINGLE SOURCE OF TRUTH
OPERATIONAL PHASE: OPTIMIZATION → MOBILE-NATIVE PREP → SCALE
FORGE DATE: DEC 21, 2025
OWNER: Developer is the master of this repo. Standards are non-negotiable.

This file is designed to enable “fresh context window” resets at any time.
If the developer starts a new chat and says: “Read @MIDFIELD_BLUEPRINT.md”
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
“Doctrine read and internalized. I’m aligned on Data Noir, performance/SEO 100/100, mobile-native portability, and zero-regression desktop UI. Ready to execute. Give me the next objective.”

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
  - any “we always do it this way” decision
Goal: baton must be passable at any moment.

──────────────────────────────────────────────────────────────────────────────
1) MIDFIELD — STRATEGIC NUCLEUS (THE WHY)
──────────────────────────────────────────────────────────────────────────────

Midfield is a data-driven football discussion engine: structured topic pages + takes.
It bridges hard stats (TheSportsDB) and community opinion (Takes).

Product pillars:
- STRUCTURE OVER CHAOS: Topic pages are permanent homes for discussion (vs ephemeral feeds).
- DATA AS CONTEXT (“DATA NOIR”): UI feels like premium sports analytics; debate anchored in facts.
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
- Supabase (Postgres + Auth + Edge Functions + Realtime)
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

A) UNIFIED ENTITY MODEL: “topics”
- Every entity is a Topic: club, player, league, match, etc.
- topics.type discriminates entity type
- topics.metadata (JSONB) stores flexible fields (position, kit, etc.)
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

F) SEO LAW (100/100 DISCOVERABILITY)
- Every page must have correct metadata:
  - metadataBase
  - openGraph (title/description/url/images/siteName)
  - twitter (cards; still used by X)
- Sharing previews must never be broken.
- Crawlability requires fast SSR and stable structure.
- SEO is not keyword spam; it’s structure + speed + clean metadata.

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


──────────────────────────────────────────────────────────────────────────────
4) DESIGN SYSTEM — “MIDFIELD PREMIUM / DATA NOIR”
──────────────────────────────────────────────────────────────────────────────

Design objective:
- Premium sports analytics vibe: high contrast, sharp borders, minimal shadows.
- “Sleek, data-first, intentional.” If it looks generic, it fails.

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
- Avoid “accidental layout”: spacing rhythm must feel designed.
- Long names must not break layout:
  - use line-clamp / truncation intentionally
- Keep visual hierarchy strong:
  - primary info must remain primary at all breakpoints
- No random shadows; borders are the language.
- Corner radius standard: rounded-md (8px) for ALL components
  - Cards, buttons, inputs, modals, badges, avatars, etc.
  - Consistent radius creates visual harmony
  - Exceptions only when explicitly justified

D) COMPONENT ARCHETYPES (CANONICAL)
1) Player / Entity avatars (fallback silhouette):
   - /player-silhouette.png
   - Mask science:
     - mask-position: center 8px (reduces top gap)
     - mask-size: 130% (headshot zoom)
   - Note: next/image fill requires a relative parent container.

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

5) TakeCard / Reply Spine System:
   - Uses 3-column grid for replies: [spine_col | avatar_col | content_col]
   - Spine termination: explicit height values (not bottom:0) on last element
   - Height must be responsive: different values for mobile vs desktop breakpoints
   - Pattern: `h-[Xpx] sm:h-[Ypx]` with matching `-top-N sm:-top-M` offsets
   - Curve uses border-l-2 + border-b-2 + rounded-bl-lg
   - Reply button icon: CornerDownLeft (consistent with main reply action)
   - Reply button text: hidden on mobile (<xs), visible on xs+ breakpoints

F) ICON CONSISTENCY LAW
- Reply actions: ALWAYS use CornerDownLeft icon (main post + nested replies)
- Do not mix MessageCircle for replies - that's for chat/DM contexts
- Icon + text pattern: icon always visible, text hidden below xs breakpoint

E) “MOBILE-FIRST” RESPONSIVENESS LAW (DESIGN, NOT JUST CSS)
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
Nothing should feel “collapsed” or “just wrapped.”

Non-negotiable constraint:
- If it looks amazing on desktop, do not modify that desktop layout.
- Fix responsiveness by adapting at smaller breakpoints only.

Responsive audit checklist (mental model):
- No horizontal scroll
- Consistent gutters/padding across breakpoints
- Typography remains readable (line length, truncation, hierarchy)
- Tap targets are usable on mobile (spacing, hit areas)
- Cards/lists don’t become dense unreadable blocks
- Modals/drawers behave correctly and are reachable
- Long text edge cases behave gracefully

──────────────────────────────────────────────────────────────────────────────
6) PERFORMANCE + SEO “FREE WINS” CHECKLIST (ALWAYS APPLY)
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
7) CURRENT SITREP (WHAT’S DONE / WHAT’S NEXT)
──────────────────────────────────────────────────────────────────────────────

Completed (as of Dec 22, 2025):
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
