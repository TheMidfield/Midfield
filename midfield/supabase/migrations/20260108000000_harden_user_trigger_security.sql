-- Migration: Harden handle_new_user trigger security
-- Date: 2026-01-08
-- Purpose: Add SET search_path to prevent path-jacking attacks
-- Reference: MIDFIELD_BLUEPRINT.md Line 319

-- Recreate the handle_new_user function with security hardening
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public  -- 🔒 Prevents path-jacking attacks
as $$
begin
  -- Create user profile record automatically on auth.users insert
  insert into public.users (id, username, avatar_url, created_at)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    NULL, -- User must upload their own avatar (no social sync)
    now()
  )
  on conflict (id) do nothing; -- Idempotent: prevents duplicate errors
  
  return new;
end;
$$;

-- Ensure trigger exists (idempotent)
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Add comment for documentation
comment on function public.handle_new_user() is 
  'Auto-creates public.users profile when auth.users row is inserted. 
   Security definer with search_path set for path-jacking protection.';
