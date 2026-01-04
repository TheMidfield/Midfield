# Club Logo Investigation - LiveFeed Issue

## Problem
Club logos don't display in LiveFeed TakeCards (both desktop and mobile), but they work perfectly in EntityHeader.

## What We Know

### ✅ Working: EntityHeader
```tsx
// TopicPageClient.tsx line 303
badgeUrl={isLeague ? (metadata?.logo_url) : metadata?.badge_url}
```
- For clubs: uses `metadata?.badge_url`
- This works perfectly - club logo displays

### ❌ Not Working: LiveFeed  
```tsx
// hero-data.ts line 355
imageUrl: topic.type === 'player'
    ? topic.metadata?.photo_url
    : (leagueLogos?.imageUrl || topic.metadata?.badge_url || topic.metadata?.logo_url)
```
- For clubs: should use `topic.metadata?.badge_url || topic.metadata?.logo_url`
- Same property access as EntityHeader
- But logos don't show!

## Data Flow Comparison

### EntityHeader Data Flow:
1. `getTopicBySlug()` from `@midfield/logic`
2. Returns topic with `metadata` JSONB column
3. Passes to EntityHeader: `badgeUrl={metadata?.badge_url}`
4. ✅ Works

### LiveFeed Data Flow:
1. `getAnyRecentTakes()` in hero-data.ts
2. Fetches topics: `.select('id, title, slug, type, metadata')`
3. Maps: `imageUrl: topic.metadata?.badge_url || topic.metadata?.logo_url`
4. ❌ Doesn't work

## Debug Logs Added

### Server-side (hero-data.ts after line 326):
```typescript
if (topic.type === 'club') {
    console.log('[Hero Feed DEBUG] Club topic:', {
        title: topic.title,
        slug: topic.slug,
        metadata: topic.metadata,
        badge_url: topic.metadata?.badge_url,
        logo_url: topic.metadata?.logo_url,
        final_imageUrl: topic.metadata?.badge_url || topic.metadata?.logo_url
    });
}
```

### Client-side (LiveFeed.tsx TakeCard):
```typescript
if (isClub) {
    console.log('[LiveFeed TakeCard DEBUG] Club rendering:', {
        title: take.topic.title,
        slug: take.topic.slug,
        imageUrl: take.topic.imageUrl,
        hasImage: !!take.topic.imageUrl
    });
}
```

## Hypotheses

### 1. Metadata JSONB not parsed correctly
- Maybe Supabase returns metadata differently in different queries
- The `topicMap` (line 296) stores raw topic objects, not serialized
- EntityHeader might be getting metadata parsed differently

### 2. Property name mismatch
- Maybe the actual property is NOT `badge_url`
- Could be `badgeUrl` (camelCase) vs `badge_url` (snake_case)
- Or a completely different property name

### 3. Null/undefined metadata
- Maybe for posts, the topic doesn't have metadata loaded
- Even though the SELECT includes 'metadata', it might be null

### 4. Caching issue
- The `cache()` wrapper on `getHeroTakes` might be serving stale data
- Old data might not have badge_url populated

## Next Steps

1. **Check console logs** after deployment
2. **Server logs**: Look for `[Hero Feed DEBUG]` in Vercel function logs
3. **Browser logs**: Look for `[LiveFeed TakeCard DEBUG]` in browser console
4. **Compare**: See what metadata looks like vs what EntityHeader receives

## Expected Console Output

If metadata is correct:
```
[Hero Feed DEBUG] Club topic: {
  title: "Paris Saint-Germain",
  slug: "paris-saint-germain",
  metadata: { badge_url: "https://...", ... },
  badge_url: "https://...",
  logo_url: null,
  final_imageUrl: "https://..."
}

[LiveFeed TakeCard DEBUG] Club rendering: {
  title: "Paris Saint-Germain",
  slug: "paris-saint-germain",
  imageUrl: "https://...",
  hasImage: true
}
```

If metadata is broken:
```
[Hero Feed DEBUG] Club topic: {
  title: "Paris Saint-Germain",
  slug: "paris-saint-germain",
  metadata: null,  // ❌ or {}
  badge_url: undefined,
  logo_url: undefined,
  final_imageUrl: undefined
}

[LiveFeed TakeCard DEBUG] Club rendering: {
  title: "Paris Saint-Germain",
  imageUrl: undefined,  // ❌
  hasImage: false
}
```

---

**Status**: Waiting for deployment and console logs
