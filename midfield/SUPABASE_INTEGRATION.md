# Supabase Integration Guide

## ✅ Setup Complete

Your Midfield project is now fully integrated with Supabase! Here's what's been configured:

### 📁 Files Created/Updated

1. **`packages/types/src/supabase.ts`** - Auto-generated TypeScript types from your Supabase schema
2. **`packages/types/src/index.ts`** - Clean type exports (User, Topic, Post, etc.)
3. **`packages/logic/src/supabase.ts`** - Typed Supabase client
4. **`packages/logic/src/mock-data.ts`** - Sample data for testing
5. **`scripts/seed-supabase.ts`** - Database seeding script
6. **`apps/web/.env.local`** - Environment variables (⚠️ gitignored)

### 🚀 Quick Start

#### 1. Seed the Database

```bash
pnpm seed
```

This will populate your database with sample data:
- 3 users (football_fanatic, tactical_genius, goal_scorer)
- 11 topics (clubs, players, competitions, matches, transfers)
- 10 topic relationships (players → clubs, clubs → competitions, etc.)
- 6 posts with threading
- 8 follows

#### 2. Start the Dev Server

```bash
pnpm dev:web
```

Your app is now connected to Supabase with fully typed queries!

### 📊 Database Philosophy

The schema follows these principles:

**topics** = Canonical entities (club, player, competition, match, transfer)
- Rich metadata stored in JSONB
- Examples: Liverpool FC, Mohamed Salah, Premier League

**posts** = Takes/discussions tied to exactly one topic
- Clean discussion anchor
- Threading via `parent_post_id` and `root_post_id`

**topic_relationships** = Graph layer for unified feeds
- Enables queries like "all players for a club" without denormalizing
- Temporal validity with `valid_from` and `valid_until`

**follows** = User subscriptions to topics
- Users follow topics, not other users (for now)

**users** = Extends `auth.users`
- Profile info (username, display_name, avatar, bio)

### 🔧 Common Tasks

#### Regenerate Types After Schema Changes

```bash
pnpm types:generate
```

#### Query Example (Fully Typed)

```typescript
import { supabase } from '@midfield/logic';

// Get all players for Liverpool FC
const { data: relationships } = await supabase
  .from('topic_relationships')
  .select('child_topic:topics!child_topic_id(*)')
  .eq('parent_topic_id', 'liverpool-fc-id')
  .eq('relationship_type', 'plays_for');

// Type-safe! Auto-complete works everywhere
```

#### Insert Example

```typescript
import { supabase } from '@midfield/logic';
import type { PostInsert } from '@midfield/types';

const newPost: PostInsert = {
  topic_id: 'some-topic-id',
  author_id: 'some-user-id',
  content: 'Great match today!',
};

const { data, error } = await supabase
  .from('posts')
  .insert(newPost)
  .select()
  .single();
```

### 🎯 Next Steps

1. **Test the integration** - Run `pnpm seed` and verify data in Supabase Dashboard
2. **Update existing components** - Swap out mock data with real Supabase queries
3. **Add auth flows** - Implement sign-up/login using Supabase Auth
4. **Integrate TheSportsDB API** - Gradually replace mock data with real sports data

### 📚 Resources

- [Supabase Docs](https://supabase.com/docs)
- [Supabase Dashboard](https://app.supabase.com/project/bocldhavewgfxmbuycxy)
- [TypeScript Support](https://supabase.com/docs/reference/javascript/typescript-support)

---

**Database Philosophy Summary:**
- Topics = canonical entities (derive behavior from structure)
- Posts = takes on topics (single anchor)
- Relationships = graph layer (unified feeds)
- JSONB metadata = flexible rich data
- Simple, scalable, composable 🚀
