-- CRITICAL: This migration MUST be applied to your Supabase database
-- Reply relationships will NOT persist without this column

-- Add reply_to_post_id to posts table for threaded replies
ALTER TABLE public.posts 
ADD COLUMN IF NOT EXISTS reply_to_post_id uuid REFERENCES public.posts(id);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_posts_reply_to_post_id ON public.posts(reply_to_post_id);

-- INSTRUCTIONS:
-- 1. Go to your Supabase Dashboard
-- 2. Navigate to SQL Editor
-- 3. Copy and paste this entire SQL
-- 4. Click "Run"
-- 5. Verify by running: SELECT column_name FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'reply_to_post_id';
