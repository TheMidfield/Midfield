-- Fix posts table schema and RLS policies
-- This migration resolves the RLS policy mismatch and adds missing columns

-- 1. Add missing columns to posts table
ALTER TABLE public.posts 
ADD COLUMN IF NOT EXISTS is_deleted boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS reaction_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS reply_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now(),
ADD COLUMN IF NOT EXISTS parent_post_id uuid REFERENCES public.posts(id),
ADD COLUMN IF NOT EXISTS root_post_id uuid REFERENCES public.posts(id);

-- 2. Rename user_id to author_id for consistency
ALTER TABLE public.posts RENAME COLUMN user_id TO author_id;

-- 3. Update the foreign key constraint
ALTER TABLE public.posts DROP CONSTRAINT IF EXISTS posts_user_id_fkey;
ALTER TABLE public.posts ADD CONSTRAINT posts_author_id_fkey 
    FOREIGN KEY (author_id) REFERENCES public.users(id);

-- 4. Fix the UPDATE policy (now author_id exists)
DROP POLICY IF EXISTS "Users can update own posts" ON posts;
DROP POLICY IF EXISTS "Users can update their own posts." ON posts;
DROP POLICY IF EXISTS "Users can update their own posts" ON posts;

CREATE POLICY "Users can update their own posts" 
ON posts 
FOR UPDATE 
USING (auth.uid() = author_id);

-- 5. Add the missing DELETE policy
CREATE POLICY "Users can delete their own posts"
ON posts
FOR DELETE
USING (auth.uid() = author_id);

-- 6. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_posts_author_id ON public.posts(author_id);
CREATE INDEX IF NOT EXISTS idx_posts_topic_id ON public.posts(topic_id);
CREATE INDEX IF NOT EXISTS idx_posts_parent_post_id ON public.posts(parent_post_id);
CREATE INDEX IF NOT EXISTS idx_posts_root_post_id ON public.posts(root_post_id);
CREATE INDEX IF NOT EXISTS idx_posts_is_deleted ON public.posts(is_deleted) WHERE is_deleted = false;

-- 7. Fix the security definer function to use SET search_path (Blueprint mandate)
DROP FUNCTION IF EXISTS public.update_post_reaction_count();

CREATE OR REPLACE FUNCTION public.update_post_reaction_count()
RETURNS trigger 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    UPDATE posts
    SET reaction_count = reaction_count + 1
    WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF (TG_OP = 'DELETE') THEN
    UPDATE posts
    SET reaction_count = reaction_count - 1
    WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;
