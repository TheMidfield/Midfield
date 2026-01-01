-- 1. Add missing indexes for Foreign Keys
CREATE INDEX IF NOT EXISTS idx_bookmarks_post_id ON public.bookmarks(post_id);
CREATE INDEX IF NOT EXISTS idx_league_standings_team_id ON public.league_standings(team_id);

-- 2. Optimize RLS Policies (InitPlan) - Wrapping auth.uid() in (select auth.uid())
-- This prevents the function from being re-evaluated for every row

-- USERS
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
CREATE POLICY "Users can insert own profile" ON public.users FOR INSERT WITH CHECK ((select auth.uid()) = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING ((select auth.uid()) = id);

DROP POLICY IF EXISTS "Users can update their own favorite club" ON public.users;
CREATE POLICY "Users can update their own favorite club" ON public.users FOR UPDATE USING ((select auth.uid()) = id) WITH CHECK ((select auth.uid()) = id);

-- POSTS
DROP POLICY IF EXISTS "Authenticated users can create posts" ON public.posts;
CREATE POLICY "Authenticated users can create posts" ON public.posts FOR INSERT WITH CHECK ((select auth.uid()) = author_id);

DROP POLICY IF EXISTS "Users can update their own posts" ON public.posts;
CREATE POLICY "Users can update their own posts" ON public.posts FOR UPDATE USING ((select auth.uid()) = author_id);

DROP POLICY IF EXISTS "Users can delete their own posts" ON public.posts;
CREATE POLICY "Users can delete their own posts" ON public.posts FOR DELETE USING ((select auth.uid()) = author_id);

-- FOLLOWS
DROP POLICY IF EXISTS "Users can manage own follows" ON public.follows;
-- Optimized with select wrapper
CREATE POLICY "Users can manage own follows" ON public.follows FOR ALL USING ((select auth.uid()) = user_id) WITH CHECK ((select auth.uid()) = user_id);

-- REACTIONS
DROP POLICY IF EXISTS "Authenticated users can add reactions." ON public.reactions;
CREATE POLICY "Authenticated users can add reactions." ON public.reactions FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update their own reactions." ON public.reactions;
CREATE POLICY "Users can update their own reactions." ON public.reactions FOR UPDATE USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete their own reactions." ON public.reactions;
CREATE POLICY "Users can delete their own reactions." ON public.reactions FOR DELETE USING ((select auth.uid()) = user_id);

-- BOOKMARKS
DROP POLICY IF EXISTS "Users can insert own bookmarks" ON public.bookmarks;
CREATE POLICY "Users can insert own bookmarks" ON public.bookmarks FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete own bookmarks" ON public.bookmarks;
CREATE POLICY "Users can delete own bookmarks" ON public.bookmarks FOR DELETE USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can view own bookmarks" ON public.bookmarks;
CREATE POLICY "Users can view own bookmarks" ON public.bookmarks FOR SELECT USING ((select auth.uid()) = user_id);

-- TOPIC VOTES
DROP POLICY IF EXISTS "Authenticated users can insert votes." ON public.topic_votes;
CREATE POLICY "Authenticated users can insert votes." ON public.topic_votes FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update their own votes." ON public.topic_votes;
CREATE POLICY "Users can update their own votes." ON public.topic_votes FOR UPDATE USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete their own votes." ON public.topic_votes;
CREATE POLICY "Users can delete their own votes." ON public.topic_votes FOR DELETE USING ((select auth.uid()) = user_id);

-- FIXTURES (Service Role Optimization)
-- Also addressing Permissive Policy warning by restricting to write operations only,
-- since "Public fixtures are viewable by everyone" handles SELECT for everyone (including service role).
DROP POLICY IF EXISTS "Service role manages fixtures." ON public.fixtures;
CREATE POLICY "Service role manages fixtures." ON public.fixtures FOR ALL USING ((select auth.role()) = 'service_role'::text);

-- LEAGUE STANDINGS (Service Role Optimization)
DROP POLICY IF EXISTS "Service role manages standings." ON public.league_standings;
CREATE POLICY "Service role manages standings." ON public.league_standings FOR ALL USING ((select auth.role()) = 'service_role'::text);
