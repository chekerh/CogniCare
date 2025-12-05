-- Fix: Auto-create user profile when auth user is created
-- Run this in Supabase SQL Editor if users can't login

-- Function to auto-create user profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role, display_name, language_preference, is_verified)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    COALESCE((NEW.raw_user_meta_data->>'role')::text, 'mother')::user_role,
    COALESCE(NEW.raw_user_meta_data->>'display_name', SPLIT_PART(COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'), ' ', 1)),
    COALESCE((NEW.raw_user_meta_data->>'language_preference')::text, 'ar')::language_preference,
    false
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Fix existing users without profiles
-- This creates profiles for users who exist in auth.users but not in public.users
INSERT INTO public.users (id, email, full_name, role, display_name, language_preference, is_verified)
SELECT 
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'full_name', 'User'),
  COALESCE((au.raw_user_meta_data->>'role')::text, 'mother')::user_role,
  COALESCE(au.raw_user_meta_data->>'display_name', SPLIT_PART(COALESCE(au.raw_user_meta_data->>'full_name', 'User'), ' ', 1)),
  COALESCE((au.raw_user_meta_data->>'language_preference')::text, 'ar')::language_preference,
  false
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- Verify fix
SELECT 
  'Auth users' as source,
  COUNT(*) as count
FROM auth.users
UNION ALL
SELECT 
  'Public users' as source,
  COUNT(*) as count
FROM public.users;

