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

### 📱 Mobile-Native Strategy (Universal Code)
**CRITICAL**: This project is a Monorepo designed to deploy to **Web (Next.js)** and **Mobile (Expo/React Native)**.
- **Future-Proofing**: Every architectural decision MUST imply a future mobile implementation.
- **Responsiveness**: "Mobile-First" is not just a buzzword; it is a hard constraint. Complex desktop UIs must have elegant mobile simplifications.
- **Portability**:
    - **Logic**: All business logic (fetching, mutations, state) MUST live in `packages/logic` or shared hooks, platform-agnostic (no `window` dependencies).
    - **UI**: While Web uses HTML/Tailwind, designs must be "React Native compatible" in spirit (avoid complex CSS layout tricks that don't translate to Flexbox).

---

## 2. Tech Stack Setup (Dec 2025)
- **Framework**: Next.js 16.0.8 (App Router)
- **Mobile**: Expo (React Native) [Planned/In-Repo]
- **Language**: TypeScript 5.x (Strict Mode)
- **Styling**: Tailwind CSS 4 (CSS-first config)
- **Icons**: Lucide React
- **Backend**: Supabase (PostgreSQL + Auth + Edge Functions + Realtime)
- **Monorepo**: Turborepo + pnpm
- **Package Structure**:
    - `apps/web`: Next.js Client
    - `apps/expo`: React Native Client (Future/Current)
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
2.  **Server Actions**: All mutations (create/update) MUST be Server Actions to be easily callable from Mobile via API or shared SDK in future.
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

## 7. Operational Context & Resources

### 🧠 AI Knowledge Context (Dec 2025)
- **Operating Timeframe**: December 21st, 2025.
- **Technology Standard**: Bleeding-edge. Next.js 16 (React 19 RC), Tailwind v4 (Oxide engine), Server Actions as default.
- **Behavioral Rule**: Assume modern capabilities first (e.g., use `useActionState` over manual form handling where applicable).

### 📚 Strategic Foundation
> **Source Material**: `Midfield – Market Analysis and Strategic Plan.txt` (Project Root)

This analysis is the **initial market research and ideation report**. It provides vital context on strategy and potential features but is **NOT the technical Single Source of Truth** (this file is). Read it to understand the "Why" and the psychological drivers of our users.
- **Target Persona**: The "Online Super-Fan" — knowledgeable, data-literate, but tired of the noise on X/Twitter and the clumsy UX of legacy forums.
- **Core Pillars**:
    1.  **Structure over Chaos**: Topic-based pages (Player/Club/Match) create permanent homes for discussion, unlike ephemeral social feeds.
    2.  **Data as Context**: "Data Noir" isn't just aesthetic; it empowers fans to debate with facts (stats/ratings) visible instantly.
    3.  **Civility via UX**: A premium, organized environment subconsciously encourages better behavior than generic "shouting into the void."
- **Differentiation**: Midfield is NOT a news site (OneFootball) or a game database (SoFIFA) — it is a **Discussion Engine** powered by data.

### 🚦 Current Integration Status

#### 🌍 Universal Code (Mobile/Web)
- **Logic Pillars**: ✅ `Search` and ✅ `Posts/Reactions` logic have been extracted to `packages/logic`. The Web App now consumes them as a client.
- **Shared Types**: ✅ `packages/types` exports standard Supabase definitions (`User`, `Topic`, `Post`).
- **Pending Debt**:
    - Shared Logic currently uses looser typing (`any` for supabase client) to speed up migration. Needs strict typing later.
    - UI Components are still Web-bound (`apps/web/components`). `packages/ui` is waiting for a unified design system extraction.

#### 🏗️ Active Features
- **Feature**: Player/Club Profiles & Search.
- **Latest Changes**:
    - **Logic Refactor**: Migrated core business logic to shared packages to enable Mobile scalability.
    - **KPI Shift**: Switched from "Followers" to **"Takes"** (Post Count) to emphasize active discussion over passive following.
    - **Security**: Implemented secure `SECURITY DEFINER` triggers for post counts with `search_path` hardening.
- **Next Up**:
    - Advanced match statistics.
    - User authentication flows (Sign up/Login).
