# 🧠 Midfield Project Blueprint & Architecture

> **Single Source of Truth** for AI agents working on Midfield.
> This document defines the architectural standards, design system rules, and security patterns that MUST be followed.

---

## 1. Project Core: **Midfield**
Midfield is a **data-driven social network for football (soccer)**. It specifically bridges the gap between hard statistical data (TheSportsDB) and community "Takes" (Opinionated Posts).

### 🌟 Core Design Philosophy: "Data Noir"
- **Aesthetic**: "Sleek Isometric" & "Premium Sports Analytics". High contrast, sharp borders, minimal shadows.
- **Data-First**: Every UI element should feel anchored to real-world data (Player Stats, Match Scores).
- **Speed**: Optimistic UI updates, instant feedback, Skeleton loading states.

---

## 2. Tech Stack Setup (Dec 2025)
- **Framework**: Next.js 16.0.8 (App Router)
- **Language**: TypeScript 5.x (Strict Mode)
- **Styling**: Tailwind CSS 4 (CSS-first config)
- **Icons**: Lucide React
- **Backend**: Supabase (PostgreSQL + Auth + Edge Functions + Realtime)
- **Monorepo**: Turborepo + pnpm
- **Package Structure**:
    - `apps/web`: Next.js Client
    - `packages/logic`: Shared business logic & DB queries
    - `packages/types`: Shared TypeScript definitions
    - `packages/ui`: Shared UI config

---

## 3. Design System: "Midfield Premium"
**Strict Enforcement Required**. Deviations are considered bugs.

### 🎨 The 5 Immutable Design Laws
1.  **Mandatory Hover**: EVERY interactive element (buttons, cards, links) MUST have a specific, visible hover state. Prefer color shifts (`bg-slate-100`) and border updates (`border-slate-400`) over scaling or shadows.
2.  **No Native Alerts**: **NEVER** use `window.alert()` or `confirm()`. Use the custom `Toast` component for all user feedback.
3.  **Strict Border Hierarchy**: Use borders (`border-slate-200` light / `border-neutral-800` dark) to define structure. Avoid soft shadows.
4.  **Optical Alignment**: Icons next to multi-line text must use `items-start` and `mt-0.5` (or `mt-1`) to align with the first line of text.
5.  **Theme Consistency**:
    - **Light Mode**: `slate-50` to `slate-900`.
    - **Dark Mode**: `neutral-900` background, `neutral-100` text.
    - **Primary Accent**: Emerald Green (`emerald-600` base, `emerald-500` hover).

### 🧩 Micro-Patterns & Components
- **Buttons**:
    - **Primary**: Solid Emerald. Light: `bg-emerald-600` hover `500`. Dark: `bg-emerald-650` hover `550`.
    - **Destructive**: Solid Red. Light: `bg-red-600` hover `500`. Dark: `bg-red-650` hover `550`.
    - **Ghost**: Text-only, but MUST maintain `min-w-[80px]` in modal footers for symmetry.
- **Modals**:
    - Layout: Header (Icon + Title) -> Body (Full width text) -> Footer (Symmetrical Actions).
    - NEVER indent body text under the header icon.
- **Cards**:
    - Use `overflow-hidden` to contain corner content.
    - **Player Cards**: Fallback image is a generic silhouette (`public/player-silhouette.png`). It MUST be masked with `mask-position: top center` and `mask-size: 130%` (or similar) to create a clean "headshot" crop.
- **Cursors**: Explicitly set `cursor-pointer` on all interactive non-button elements.

---

## 4. Architecture & Data Flow

### 📂 Unified Entity Model (`topics`)
The database does not have separate tables for Clubs/Players. Everything is a **Topic**.
- **Table**: `topics`
- **Discriminator**: `type` ('club', 'player', 'league', 'match')
- **Flexibility**: Specifics live in a JSONB `metadata` column (e.g., `{ "position": "Striker", "kit_number": 9 }`).
- **Graph**: `topic_relationships` table maps everything (e.g., Parent: Club -> Child: Player, Relationship: 'plays_for').

### 🔄 Data Fetching Pattern
1.  **Server Components**: Fetch data directly using `supabase/server`.
2.  **Client Components**: If interactive, pass data as initial props or use Server Actions.
3.  **Search**: Located in `apps/web/src/app/api/search` or `actions.ts`.
    - **Threshold**: Search results MUST have a relevance score `>= 50` (server-side filter) to avoid noise.

---

## 5. Security Protocols

### 🛡️ Row Level Security (RLS) & Triggers
1.  **Principle of Least Privilege**: Users NEVER get direct `UPDATE` access to system tables (like `topics` or `post_counts`).
2.  **Atomic Updates**: Use **Triggers** for side effects (e.g., updating a post count when a post is created).
3.  **Security Definer Rules**:
    - Triggers running with elevated privileges must use `SECURITY DEFINER`.
    - **CRITICAL**: Must include `SET search_path = public` to prevent Search Path Hijacking.
    - Logic must be deterministic and hardcoded (no dynamic SQL execution from user input).

---

## 6. Developer Cheatsheet
- **Run Dev**: `pnpm dev:web` (Starts on localhost:3000)
- **Linting**: `pnpm lint` (Fixes simple style issues)
- **New Assets**: Static images go to `apps/web/public/`. Icons use `lucide-react`.
- **Debugging**: check `apps/web/.next/` for build artifacts.

---

## 7. Current Project State (Live)
- **Active Feature**: Player/Club Profiles & Search.
- **Latest Changes**:
    - Implemented secure `SECURITY DEFINER` triggers for post counts.
    - Standardized Player Silhouette fallback with CSS masking.
    - Refined Search logic to filter low-quality matches.
- **Next Up**:
    - Advanced match statistics.
    - User authentication flows (Sign up/Login).
