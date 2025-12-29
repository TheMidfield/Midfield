# ⚡ MIDFIELD_BLUEPRINT.md — THE LIVING DOCTRINE (v7.4)

<!--
UPDATE LOG (Dec 29, 2025):
- **Hero/Grid Aesthetics**: Implemented "Strict Vignette" masking for grids (no abrupt edges).
- **Match Center Widget**: Added "Compact/Sidebar Mode" (no club names) for narrow columns.
- **Match Ranking Algo**: Replaced round-robin with Power Ranking + Diversity Penalty (Top 5 Leagues).
- **Performance**: EntityCycler now preloads all images to prevent flickering.
- **Bug Fix**: Removed default "88" rating fallback; now hides badge if unknown.
-->

STATUS: ACTIVE // DEFINITIVE SINGLE SOURCE OF TRUTH
OPERATIONAL PHASE: OPTIMIZATION → MOBILE-NATIVE PREP → SCALE
FORGE DATE: DEC 29, 2025 (Updated)
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
- **Images**: next/image ONLY. External domains configured in next.config.

──────────────────────────────────────────────────────────────────────────────
3) THE 5 IMMUTABLE DESIGN LAWS
──────────────────────────────────────────────────────────────────────────────

1.  **Border Hierarchy**: Borders define structure. No soft shadows.
2.  **Optical Alignment**: Icons + Text must align perfectly (mt-0.5 patterns).
3.  **Mandatory Hover**: Every interactive element gets a hover state (color/border shift).
4.  **Rounded Corners**: `rounded-md` (6px) is the universal standard for interactive elements.
5.  **Strict Vignette Grids**:
    - Hero grids must NEVER end abruptly.
    - Use `maskImage: radial-gradient(ellipse 50% 50% at 50% 50%, black 10%, transparent 85%)`.
    - This guarantees 0% opacity before the edge.

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
- **Ranking Algo**:
  - Pure Power Ranking (UEFA Coefficients + League Prestige).
  - **Diversity Penalty**: Top 5 Leagues (EPL, La Liga, etc.) forced to mix. No single league dominates > 4 slots.

**C) ENTITY CARDS & CYCLER**
- **Preloading**: `EntityCycler` must preload ALL images in hidden state to prevent flicker.
- **Ratings**: FC26 ratings (emerald badges). IF UNKNOWN, DO NOT SHOW. No defaults (e.g. "88").
- **Images**: Square user avatars (`rounded-md`), Grid view for entities.

**D) SHARE CARDS (Server-Side)**
- **Tech**: `/api/share-card` using `next/og`.
- **Design**: 1:1 Square. Mirrors app UI. Server-side rendering purely.

──────────────────────────────────────────────────────────────────────────────
5) DATA PIPELINES (THE ENGINE ROOM)
──────────────────────────────────────────────────────────────────────────────

**A) IMPORT PIPELINE ("The Stub Law")**
- If a fixture refers to a missing team, create a STUB immediately.
- Never fail an import for missing relations.

**B) FC26 RATINGS**
- Source: SoFIFA (Python Scraper -> Edge Function).
- Storage: `topics.fc26_data` JSONB column.
- Display: 80+ Emerald, 70+ Dark Emerald, 60+ Yellow.

**C) SYNC SCHEDULING**
- **Static**: Weekly (Sundays).
- **Dynamic**: Daily/Hourly (Fixtures, Scores).
- **Queue**: `sync_jobs` table (Scheduler-Worker pattern) for reliability.

──────────────────────────────────────────────────────────────────────────────
6) RESPONSIVE PERFECTION LAW
──────────────────────────────────────────────────────────────────────────────
- **The Web IS The Mobile App**.
- Test 320px, 375px, 768px, 1024px.
- **Layout Collisions**: Use `min-w-0`, `truncate`, and `flex-wrap` defensively.
- **Touch Targets**: 44px min height for mobile interactions.

──────────────────────────────────────────────────────────────────────────────
7) RECENT CRITICAL DECISIONS (DEC 2025)
──────────────────────────────────────────────────────────────────────────────

1.  **Sidebar Widget Constraints**: Widgets in sidebars (RightPanel) must be compact.
    - *Action*: `MatchCenterWidget` now accepts `hideClubNames` prop.
2.  **Grid Fade Perfection**: Replaced complex composite masks with simple, strict radial ellipses (`transparent 85%`) to guarantee no edge clipping.
3.  **Homepage Performance**:
    - Entity preloading implemented.
    - `SplitHero` runs client-side fetching to avoid RSC serialization depth limits.
4.  **Rating Integrity**: Removed "Default 88" bug.
5.  **Blueprint Authority**: This file is the single source of truth.

END OF DOCTRINE.
