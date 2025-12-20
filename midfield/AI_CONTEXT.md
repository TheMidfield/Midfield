# 🧠 Midfield Project Context & AI Primer

This document serves as the **Single Source of Truth** for AI agents working on the Midfield codebase. Read this first to understand the architecture, design system, and patterns.

---

## 1. Project Identity: **Midfield**
Midfield is a **data-driven social network for football (soccer)**. It combines deep statistical data (players, clubs, matches) with community discussion ("Takes").

### Core Core Values
- **Data-First**: Every conversation is anchored to a real entity (Player, Club, League).
- **Premium Aesthetic**: "Sleek Isometric", high-contrast, premium sports analytics feel.
- **Speed**: Optimistic UI, fast loads, instant feedback.

---

## 2. Tech Stack (Bleeding Edge)
- **Framework**: Next.js 16.0.8 (App Router)
- **Language**: TypeScript 5.x
- **Styling**: Tailwind CSS 4 (CSS-first config)
- **UI Primitives**: Radix UI (headless) + Lucide React (icons)
- **Backend/DB**: Supabase (PostgreSQL + Auth + Edge Functions)
- **Monorepo**: Turborepo + pnpm
- **State/Data**: Server Components (RSC) + Supabase SSR

---

## 3. Design System: "Midfield Premium"

The design system is strictly enforced. It relies on **Slate (Light Mode)** and **Neutral (Dark Mode)** grays with **Emerald Green** as the sole accent.

### 🎨 The 4 Immutable Design Laws
1.  **Mandatory Hover**: Every clickable element MUST have visible hover feedback (color shift, border darken). **Never** use scale or shadow lifts; only color/border changes.
2.  **Visual Congruence**: Similar elements must look identical across the app.
3.  **Harmonious Spacing**: Strict 4px scale. Margins and paddings are generous.
4.  **Neutral & Emerald**:
    - **Primary**: Emerald Green (`#059669` / `emerald-600`).
    - **Background**: Off-white (`#f8fafc`) or Deep Black/Gray (`#1A1A1A`).
    - **Borders**: Strong, visible borders (`slate-300` / `neutral-700`) define structure instead of shadows.

### 🧩 Design Refinements & Micro-Details
-   **Corners**: Use `rounded-md` (0.375rem) consistently for cards, modals, and buttons. Avoid mixing radii.
-   **Modals**:
    -   **Layout**: Strict Header (Icon + Title) -> Body (Full width Text) flow. Never indent text under icons.
    -   **Buttons**: Footer buttons **MUST** be visually equal. Use `min-w-[80px]` on Ghost buttons to match Solid buttons.
-   **Feedback**: **NEVER** use `window.alert()`. Use the `Toast` component for all user feedback (Success/Error). Toasts must be non-intrusive.
-   **Buttons & Colors**:
    -   **Primary/Destructive Logic**:
        -   **Light Mode**: Base `600`, Hover `500`.
        -   **Dark Mode**: Base `650`, Hover `550`.
        -   *Note*: Custom `emerald-650`/`red-650` are defined in `globals.css` for this exact purpose.
-   **Cursors**: All interactive elements (including close buttons) **MUST** have `cursor-pointer`.
-   **Alignment**: Use `items-start` with `mt-0.5` for icons next to multi-line text to ensure optical alignment.

### 🔠 Typography
- **Headings**: `Onest` (Variable, Geometric, Modern)
- **Body**: `DM Sans` (Clean, highly readable)

### 🧩 Key Components (`apps/web/src/components/ui`)
- **Buttons**: Variants: `default` (solid green), `ghost` (text only), `outline` (bordered), `pill` (rounded for navbar/actions).
- **Cards**: `TopicCard`, `TakeCard` (discussion), `PlayerCard`, `ClubCard`.
- **Search**: `SearchInput` (available in box or pill variants).

---

## 4. Architecture & Directory Structure

### Monorepo Layout
- **`apps/web`**: The main Next.js application.
    - `src/app`: App Router pages (`layout.tsx`, `page.tsx`).
    - `src/components`: Feature components (`EntityHeader`, `TakeCard`).
    - `src/components/ui`: Design system primitives (Button, Input).
    - `src/lib`: Utilities (`utils.ts`, `supabase.ts`).
- **`packages/logic`**: Shared business logic, Supabase queries, and utility functions.
- **`packages/types`**: Shared TypeScript interfaces (Database types, Domain models).
- **`packages/ui`**: Shared UI configuration (currently minimal).

### Key Routes
- `/`: Home (Feed + Discover).
- `/leagues`: All Leagues page.
- `/leagues/[slug]`: League detail (e.g., Premier League).
- `/topic/[slug]`: Universal entity page (Club or Player).
    - **Club Layout**: Header -> Squad List (grouped by position).
    - **Player Layout**: Header -> Stats/Bio.

---

## 5. Data Model (Supabase)

The database uses a **Unified Entity Model** to keep things flexible.

### Key Tables
1.  **`topics`**: The heart of the DB. Represents any entity.
    - `type`: 'club', 'player', 'league', 'competition'.
    - `metadata`: JSONB field containing specifics (e.g., `{ "position": "Striker", "league": "EPL" }`).
    - `slug`: Unique URL identifier.
2.  **`posts`**: User discussions ("Takes").
    - Linked to a `topic_id`.
3.  **`topic_relationships`**: Graph connections.
    - `parent_topic_id` (Club) <-> `child_topic_id` (Player).
    - `relationship_type`: 'plays_for', 'competed_in', etc.

---

## 6. Developer Workflow

### Common Commands (Run from Root)
- **Start Dev Server**: `pnpm dev:web` (Starts Next.js on localhost:3000).
- **Seed Database**: `pnpm seed` (Populates local/remote DB with sample data).
- **Generate Types**: `pnpm types:generate` (Updates `packages/types` from Supabase schema).

### Working on the Codebase
- **New Components**: Place in `apps/web/src/components/ui` if primitive, or `apps/web/src/components` if feature-specific.
- **Styling**: Use Tailwind utility classes. Avoid custom CSS unless absolutely necessary (add to `globals.css`).
- **Icons**: Use `lucide-react` imports.
- **Design Showcase**: When creating new UI primitives, YOU MUST add them to `apps/web/src/app/design-system/page.tsx` for documentation.

---

## 7. Current Status (Dec 2025)
- **Frontend**: "Database-Driven Ready". Real data flows from Supabase.
- **Integration**: TheSportsDB data is partially imported.
- **Missing/Upcoming**: Auth flows (Sign up/Login), Post creation (Writing takes), Advanced Search.

---

## 8. Security Patterns

### Database Triggers (`SECURITY DEFINER`)
When updating aggregate data (like `post_count` on `topics`) based on user actions:
1.  **NEVER** grant `UPDATE` permissions on the parent table (`topics`) to the `authenticated` role.
2.  **ALWAYS** use a `SECURITY DEFINER` trigger function.
3.  **MANDATORY**: The function must include `SET search_path = public` to prevent Search Path Hijacking.
4.  **Scope**: The function logic must be hardcoded and deterministic (e.g., simplistic `+1` / `-1` math). Do not accept dynamic arguments.

This pattern ensures users can only affect the system via strictly defined, atomic side-effects of their own permitted actions (e.g., inserting a post), without having direct write access to sensitive system tables.
