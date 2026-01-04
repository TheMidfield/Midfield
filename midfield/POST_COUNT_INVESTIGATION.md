# Post Count & Live Update Issues

## 🐛 Bug 1: Counter Iterates x2 When Posting a Take

### Symptoms
When a user posts a take on an entity, the `post_count` increases by **2** instead of 1.

### Root Cause Analysis
The `post_count` is managed by a database trigger in migration `20260104000000_auto_update_topic_post_count.sql`:

```sql
CREATE TRIGGER on_post_created_increment_count
    AFTER INSERT ON public.posts
    FOR EACH ROW
    WHEN (NEW.is_deleted = false)
    EXECUTE FUNCTION increment_topic_post_count();
```

This trigger should fire ONCE per insert. If it's incrementing twice, possible causes:

1. **Duplicate Trigger**: The trigger might be registered twice in production DB
2. **Legacy Trigger**: Old trigger from previous database still exists
3. **RPC/Function Also Incrementing**: Another function might also be updating post_count

### Investigation Steps

**Step 1: Check for duplicate triggers**
Run this SQL in Supabase dashboard:
```sql
SELECT 
    trigger_name,
    event_manipulation,
    action_statement,
    action_timing,
    action_orientation
FROM information_schema.triggers
WHERE event_object_table = 'posts'
AND trigger_name LIKE '%post%count%'
ORDER BY trigger_name;
```

**Expected Result**: Should show exactly 2 triggers:
- `on_post_created_increment_count` (AFTER INSERT)
- `on_post_deleted_decrement_count` (AFTER UPDATE)

**If you see duplicate names**, drop the duplicates:
```sql
DROP TRIGGER on_post_created_increment_count ON public.posts;
DROP TRIGGER on_post_deleted_decrement_count ON public.posts;

-- Then re-run the migration
```

**Step 2: Check the trigger function**
```sql
SELECT prosrc 
FROM pg_proc 
WHERE proname = 'increment_topic_post_count';
```

Make sure it only updates post_count ONCE.

**Step 3: Add debugging to the trigger**
Temporarily modify the trigger to log executions:
```sql
CREATE OR REPLACE FUNCTION increment_topic_post_count()
RETURNS TRIGGER AS $$
DECLARE
    target_topic_id UUID;
BEGIN
    -- Log that trigger fired
    RAISE NOTICE 'INCREMENT TRIGGER FIRED for post_id: %, parent_post_id: %', NEW.id, NEW.parent_post_id;
    
    -- For root posts (Takes), use the post's topic_id directly
    IF NEW.parent_post_id IS NULL THEN
        target_topic_id := NEW.topic_id;
    ELSE
        -- Get topic_id from the root post
        SELECT topic_id INTO target_topic_id
        FROM posts
        WHERE id = NEW.root_post_id;
    END IF;

    -- Increment the count
    IF target_topic_id IS NOT NULL THEN
        RAISE NOTICE 'Incrementing post_count for topic_id: %', target_topic_id;
        UPDATE topics
        SET post_count = post_count + 1
        WHERE id = target_topic_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

Then post a take and check Supabase logs to see if the NOTICE appears twice.

---

## 🐛 Bug 2: EntityHeader Counter Doesn't Update Live

### Symptoms
After posting a take, the counter in `EntityHeader` doesn't update until page refresh.

### Root Cause
The `EntityHeader` component receives `postCount` as a **static prop** from SSR. It's not reactive to new posts.

```tsx
<EntityHeader
    postCount={topic.post_count || 0}  // ❌ Static value from server
    // ...
/>
```

### Solutions

#### Option 1: Optimistic Update (Quick Fix)
When a take is posted, increment the displayed counter immediately:

**TopicPageClient.tsx**:
```tsx
const [displayPostCount, setDisplayPostCount] = useState(topic.post_count || 0);

const handlePostSuccess = (newPost: any) => {
    // Increment the displayed count
    setDisplayPostCount(prev => prev + 1);
    
    // Add to feed
    addPostRef.current?.(newPost);
};

// Pass displayPostCount to EntityHeader
<EntityHeader
    postCount={displayPostCount}
    // ...
/>
```

#### Option 2: SWR/Realtime (Proper Fix)
Make `postCount` reactive using Supabase Realtime:

**Create a hook:**
```tsx
// useTopicPostCount.ts
export function useTopicPostCount(topicId: string, initialCount: number) {
    const [count, setCount] = useState(initialCount);
    const supabase = createBrowserClient();

    useEffect(() => {
        const channel = supabase
            .channel(`topic-${topicId}-count`)
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'topics',
                filter: `id=eq.${topicId}`
            }, (payload) => {
                if (payload.new && 'post_count' in payload.new) {
                    setCount(payload.new.post_count);
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [topicId]);

    return count;
}
```

**Use in TopicPageClient:**
```tsx
const livePostCount = useTopicPostCount(topic.id, topic.post_count || 0);

<EntityHeader
    postCount={livePostCount}
    // ...
/>
```

---

## 🔍 Similar Risk: Reactions & Votes

You mentioned checking if there's a similar problem with reactions and upvote/downvote. Let me check:

### Reactions
Reactions use a different system - they're stored in the `reactions` table and counted via:
1. `reaction_count` column on `posts` table (denormalized)
2. Likely has its own trigger

**Check for duplicate reaction triggers:**
```sql
SELECT trigger_name, event_manipulation
FROM information_schema.triggers  
WHERE event_object_table = 'reactions'
ORDER BY trigger_name;
```

### Topic Votes  
Topic upvotes/downvotes are stored in `topic_votes` table and managed by the `voteTopic` action.

**Check vote triggers:**
```sql
SELECT trigger_name, event_manipulation
FROM information_schema.triggers
WHERE event_object_table = 'topic_votes'
ORDER BY trigger_name;
```

---

## 🛠️ Recommended Fix Priority

1. **Immediate**: Check for duplicate triggers (SQL query above)
2. **Quick Win**: Implement optimistic update for EntityHeader counter
3. **Proper Fix**: Implement realtime subscription for post_count
4. **Audit**: Check reaction and vote triggers for similar issues

---

## 📝 Testing Checklist

After fixes:
- [ ] Post a take → counter increments by exactly 1
- [ ] EntityHeader updates without refresh
- [ ] Delete a take → counter decrements by exactly 1  
- [ ] React to a post → reaction count updates correctly
- [ ] Upvote/downvote → vote counts update correctly
- [ ] Post a reply → parent post count doesn't change (only root topic count)

---

**Status**: Investigation required - run SQL queries to identify duplicate triggers
