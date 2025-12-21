-- Fix RLS policy for post updates
-- For UPDATE, we only need USING clause to check existing rows
-- WITH CHECK would validate new row state which causes issues with soft deletes

DROP POLICY IF EXISTS "Users can update own posts" ON posts;
DROP POLICY IF EXISTS "Users can update their own posts." ON posts;
DROP POLICY IF EXISTS "Users can update their own posts" ON posts;

CREATE POLICY "Users can update their own posts" 
ON posts 
FOR UPDATE 
USING (auth.uid() = author_id);
