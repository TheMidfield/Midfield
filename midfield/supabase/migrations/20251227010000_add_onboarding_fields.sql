-- Add favorite_club_id to users table
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS favorite_club_id uuid REFERENCES public.topics(id);

-- Add onboarding_completed flag
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS onboarding_completed boolean DEFAULT false;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_favorite_club ON public.users(favorite_club_id);

-- Add policy to allow users to update their own favorite club
CREATE POLICY IF NOT EXISTS "Users can update their own favorite club"
  ON public.users
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
