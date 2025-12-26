-- Make username nullable since it's set during onboarding
ALTER TABLE public.users ALTER COLUMN username DROP NOT NULL;
