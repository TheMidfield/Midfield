# Midfield Badge System - Master Documentation

## 1. System Overview

The Badge System is a fully automated, database-driven gamification layer designed to reward user engagement and early adoption. It consists of 7 unique badges across 2 categories (Membership & Engagement).

**Key Principles:**
- **Automated**: Triggers handle all grants.
- **Idempotent**: Safe to re-run; duplicate-proof.
- **Retroactive**: Works for past and future actions.
- **Real-time**: Badges and notifications appear instantly.

---

## 2. Badge Definitions

All badge keys match their display titles exactly. Legacy names (`trendsetter`, `influencer`) have been purged.

| Badge Key | Title | Category | Requirement | Trigger Source |
|-----------|-------|----------|-------------|----------------|
| `starting_xi` | Starting XI | Membership | First 11 users | Signup Trigger |
| `club_100` | Club 100 | Membership | First 100 users | Signup Trigger |
| `club_1k` | Club 1k | Membership | First 1,000 users | Signup Trigger |
| `playmaker` | Playmaker | Engagement | First take on a topic | Post Trigger |
| `crowd_provoker` | Crowd Provoker | Social | Receive 1st reaction | Reaction Trigger |
| `regista` | Regista | Social | Receive 1st reply | Reply Trigger |
| `hat-trick` | Hat-Trick | Social | Receive 3 replies | Reply Trigger |

---

## 3. Technical Architecture

### Database Schema
- **`user_badges`**: Stores earned badges. Composite unique key `(user_id, badge_id)`.
- **`notifications`**: Unique index on `(recipient_id, type, resource_slug)` for badges to prevent double notifications.

### Automation Triggers
1. **`on_user_created_welcome`**: Checks user count on signup.
2. **`handle_post_badges`**: Checks if post is first on topic.
3. **`handle_crowd_provoker_badge`**: Counts reactions received.
4. **`handle_regista_badge`**: Counts replies received (depth 1).
5. **`handle_hat_trick_badge`**: Counts total replies received (depth 1).

### Duplicate Prevention (4-Layer Defense)
1. **Schema**: `UNIQUE(user_id, badge_id)` blocks duplicate badges.
2. **Query**: `ON CONFLICT DO NOTHING` in all insert queries.
3. **Logic**: `IF FOUND` checks ensure notifications only send for *new* grants.
4. **Safety**: `UNIQUE INDEX` on notifications blocks duplicate alerts.

### Frontend Integration
- **Source of Truth**: `user_badges` table (accessed via `getUserProfile`).
- **Profile Display**: Logic in `ProfileClient.tsx` ensures only the *highest* membership badge is shown per category (e.g., Starting XI hides Club 100).
- **Modals**: `BadgeModal.tsx` always shows unlock requirements, but only reveals the celebratory description if earned.

---

## 4. Migration History (Execution Order)

1. **`20240102_notifications_system.sql`**
   - Initial schema setup.
2. **`20260106000000_fix_badge_names.sql`**
   - Renamed legacy badges (`trendsetter` → `playmaker`).
3. **`20260107000000_add_reaction_reply_badges.sql`**
   - Added missing social triggers (Crowd Provoker, Regista, Hat-Trick).
4. **`20260108000000_retroactive_badge_grant.sql`**
   - Retroactively granted badges to existing eligible users.
5. **`20260109000000_fix_duplicate_badge_notifications.sql`**
   - **CRITICAL**: Removed duplicate trigger, added unique index on notifications.

---

## 5. Deployment Status

- ✅ **Backend**: All migrations applied. Triggers active.
- ✅ **Frontend**: Profile page aligned with DB. Modal UX improved.
- ✅ **Data**: Retroactive grant completed. Legacy data cleaned.
- ✅ **Safety**: Duplicate prevention fully audited and verified.

**System is 100% Production Ready.**
