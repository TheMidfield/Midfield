-- Clear any existing avatar URLs that might be set to default/placeholder images
UPDATE public.users
SET avatar_url = NULL
WHERE avatar_url IS NOT NULL 
  AND (
    avatar_url LIKE '%placeholder%' 
    OR avatar_url LIKE '%default%'
    OR avatar_url LIKE '%avatar%'
    OR avatar_url NOT LIKE '%supabase%'
  );
