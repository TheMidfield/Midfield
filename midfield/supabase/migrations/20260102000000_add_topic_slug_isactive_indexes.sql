-- Add indexes to improve query performance for topics
CREATE INDEX IF NOT EXISTS idx_topics_slug ON public.topics (slug);
CREATE INDEX IF NOT EXISTS idx_topics_is_active ON public.topics (is_active);
CREATE INDEX IF NOT EXISTS idx_posts_topic_id ON public.posts (topic_id);
