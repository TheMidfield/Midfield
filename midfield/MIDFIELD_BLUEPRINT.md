# ⚡ MIDFIELD_BLUEPRINT.md — THE LIVING DOCTRINE (v7.5)

<!--
UPDATE LOG (Jan 1, 2026):
- **Smart Upsert Hardening**: Implemented "Safety Locks" in `smartUpsertTopic` to protect `fc26_data`, `follower_count`, and `post_count` from accidental overwrite.
- **Metadata Merging**: Sync jobs now shallow-merge `metadata` JSONB. Enriched fields (Height, Weight, Foot) are preserved even if simpler syncs run later.
- **Rich Player Metadata**: Implemented V1 + V2 Hybrid lookup for high-fidelity player profiles (Birth Location, Preferred Foot, Clean Weight strings).
- **Match Center Stability**: Added sort-on-null safety and loading skeleton overflow fixes for the Sidebar widget.
- **Design Alignment**: Added 10px standard left-padding to nested metadata rows to align icons with parent button text.
-->

STATUS: ACTIVE // DEFINITIVE SINGLE SOURCE OF TRUTH
OPERATIONAL PHASE: OPTIMIZATION → MOBILE-NATIVE PREP → SCALE
FORGE DATE: JAN 1, 2026 (Updated)
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
- **Tech**: `/api/share-card` using `next/og`.
- **Design**: 1:1 Square. Mirrors app UI. Server-side rendering purely.

──────────────────────────────────────────────────────────────────────────────
5) DATA PIPELINES (THE ENGINE ROOM)
──────────────────────────────────────────────────────────────────────────────

**A) THE STUB LAW (Import Resilience)**
- **Rule**: Never fail a sync due to missing Foreign Keys.
- **Action**: If a fixture references a missing Entity ID, create a **STUB** `topic` immediately (Name + ExtID only).
- **Resolution**: Atlas Engine fills in deep details (images, players) later.

**B) FC26 RATINGS & SOFIFA**
- Source: SoFIFA (Python Scraper -> Edge Function).
- Storage: `topics.fc26_data` JSONB column.
- **Safety**: Protected by `smartUpsertTopic`. Never overwritten by regular sync jobs.

**C) HYBRID ARCHITECTURE ("Realtime & Atlas")**
- **I. ATLAS ENGINE (Legacy Edge)**:
  - **Domain**: Structure (Clubs, Players, Leagues, Standings).
  - **Frequency**: Deep/Heavy. Weekly runs.
- **II. REALTIME ENGINE (V2 Next.js)**:
  - **Domain**: Time (Fixtures, Live Scores, Match Status).
  - **Frequency**: Surgical/Light. Daily (Schedule) & Minutely (Scores).
  - **Rule**: Sole authority for `fixtures` table.

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
- Test 320px, 375px, 768px, 1024px.
- **Layout Collisions**: Use `min-w-0`, `truncate`, and `flex-wrap` defensively.
- **Touch Targets**: 44px min height for mobile interactions.

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
7.  **Auth Profile Safety**:
    - `auth/callback` MUST use `ignoreDuplicates: true` on user upsert to protect custom avatars.
8.  **Profile Resilience**:
    - `getUserProfile` (Server) uses `maybeSingle()` + `try/catch` to preventing hangs on missing data.
9.  **Live Match Distinction**:
    - Live matches display in "Results" tab (Top billing).
    - Pulsing Emerald Indicators for "LIVE" status.
10. **Visual Consistency (Placeholders)**:
    - No Gradients for empty states. Use solid `slate-100`/`neutral-800` to match Navbar.

──────────────────────────────────────────────────────────────────────────────
8) EGRESS DEFENSE & SECURITY PROTOCOLS
──────────────────────────────────────────────────────────────────────────────

- **No Base64 in Database**: Strictly forbidden. Use Supabase Storage. Database only stores `https://...` URLs.
- **Payload Discipline**:
  - **Uploads**: 2MB hard cap (Server).
  - **Compression**: Avatars must be resized Client-Side (Max 500x500px, JPEG 80%) *before* upload to save bandwidth & storage.
  - **Text Limits**: Posts (2000 chars), Bios (500 chars) enforced by DB constraints.
- **Wildcards Forbidden**: `select('*')` is banned in API routes & Server Actions. Explicitly select ALL fields (e.g. `id, title, metadata`) to prevent hidden payload bloat.


END OF DOCTRINE.
