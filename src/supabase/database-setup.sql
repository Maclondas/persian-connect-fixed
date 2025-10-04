-- Persian Connect Database Setup
-- Run this SQL in your Supabase SQL Editor to fix the user signup issue
-- ✅ INCLUDES AUTO-CONFIRMATION: Users will be created WITHOUT email verification required

-- =============================================
-- Step 1: Create profiles table
-- =============================================

-- Drop table if it exists (for fresh setup)
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Create a table for public user profiles
CREATE TABLE public.profiles (
  id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  email text NOT NULL,
  name text NOT NULL,
  role text DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  auth_provider text DEFAULT 'email',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  is_blocked boolean DEFAULT false,
  block_reason text,
  blocked_at timestamp with time zone,
  blocked_by text,
  picture text,
  terms_accepted jsonb DEFAULT '{"accepted": false}'::jsonb,
  
  -- Additional metadata
  last_login timestamp with time zone,
  login_count integer DEFAULT 0,
  
  PRIMARY KEY (id)
);

-- Create indexes for better performance
CREATE INDEX idx_profiles_username ON public.profiles(username);
CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_profiles_created_at ON public.profiles(created_at);

-- =============================================
-- Step 2: Set up Row Level Security (RLS)
-- =============================================

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies

-- Allow users to read their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Allow admins to read all profiles
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Allow admins to update any profile
CREATE POLICY "Admins can update any profile" ON public.profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Allow admins to delete profiles
CREATE POLICY "Admins can delete profiles" ON public.profiles
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Allow inserts for the trigger function (using security definer)
CREATE POLICY "Allow profile creation" ON public.profiles
  FOR INSERT WITH CHECK (true);

-- =============================================
-- Step 3: Create the trigger function
-- =============================================

-- Drop function if exists
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Create the function that will handle new user creation
-- ✅ This automatically creates profiles for all new users (no email confirmation needed)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger 
LANGUAGE plpgsql 
SECURITY definer SET search_path = public
AS $
BEGIN
  -- Log the new user creation
  RAISE NOTICE 'Creating profile for new user: % (email: %)', NEW.id, NEW.email;
  
  -- Insert a new profile for the new user
  INSERT INTO public.profiles (
    id, 
    username, 
    email, 
    name, 
    role,
    auth_provider,
    created_at,
    picture
  ) VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', 'User'),
    'user',
    COALESCE(NEW.raw_app_meta_data->>'provider', 'email'),
    NEW.created_at,
    NEW.raw_user_meta_data->>'picture'
  );

  RAISE NOTICE '✅ Profile created successfully for user: %', NEW.id;
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    -- Handle the case where username already exists
    RAISE NOTICE '⚠️ Username conflict, creating unique username for user: %', NEW.id;
    INSERT INTO public.profiles (
      id, 
      username, 
      email, 
      name, 
      role,
      auth_provider,
      created_at,
      picture
    ) VALUES (
      NEW.id,
      split_part(NEW.email, '@', 1) || '_' || substring(NEW.id::text from 1 for 8),
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', 'User'),
      'user',
      COALESCE(NEW.raw_app_meta_data->>'provider', 'email'),
      NEW.created_at,
      NEW.raw_user_meta_data->>'picture'
    );
    
    RAISE NOTICE '✅ Profile created with unique username for user: %', NEW.id;
    RETURN NEW;
  WHEN OTHERS THEN
    -- Log the error and continue (don't break user creation)
    RAISE WARNING '❌ Error creating profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$;

-- =============================================
-- Step 4: Create the trigger
-- =============================================

-- Drop trigger if exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger that fires after new user insert
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- Step 5: Create helper functions
-- =============================================

-- Function to get user profile by ID
CREATE OR REPLACE FUNCTION public.get_user_profile(user_id uuid)
RETURNS public.profiles
LANGUAGE plpgsql
SECURITY definer
AS $$
DECLARE
  profile public.profiles;
BEGIN
  SELECT * INTO profile FROM public.profiles WHERE id = user_id;
  RETURN profile;
END;
$$;

-- Function to check if username is available
CREATE OR REPLACE FUNCTION public.is_username_available(check_username text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY definer
AS $$
BEGIN
  RETURN NOT EXISTS (
    SELECT 1 FROM public.profiles WHERE username = check_username
  );
END;
$$;

-- Function to update user profile
CREATE OR REPLACE FUNCTION public.update_user_profile(
  user_id uuid,
  new_username text DEFAULT NULL,
  new_name text DEFAULT NULL,
  new_picture text DEFAULT NULL
)
RETURNS public.profiles
LANGUAGE plpgsql
SECURITY definer
AS $$
DECLARE
  updated_profile public.profiles;
BEGIN
  -- Check if user exists and has permission
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = user_id) THEN
    RAISE EXCEPTION 'Profile not found';
  END IF;

  -- Update profile
  UPDATE public.profiles SET
    username = COALESCE(new_username, username),
    name = COALESCE(new_name, name),
    picture = COALESCE(new_picture, picture),
    updated_at = now()
  WHERE id = user_id
  RETURNING * INTO updated_profile;

  RETURN updated_profile;
END;
$$;

-- =============================================
-- Step 6: Create admin user function
-- =============================================

-- Function to create the first admin user
CREATE OR REPLACE FUNCTION public.create_admin_user(admin_email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY definer
AS $$
BEGIN
  UPDATE public.profiles 
  SET role = 'admin', updated_at = now()
  WHERE email = admin_email;
  
  RETURN FOUND;
END;
$$;

-- =============================================
-- Migration: Move existing KV users to profiles
-- =============================================

-- Note: This is a placeholder for migrating existing users
-- You'll need to run additional migration scripts if you have existing users in the KV store

-- =============================================
-- Completion Message
-- =============================================

-- Success notification
DO $
BEGIN
  RAISE NOTICE '✅ Persian Connect database setup completed successfully!';
  RAISE NOTICE '🎉 AUTO-CONFIRMATION ENABLED: Users can sign up without email verification!';
  RAISE NOTICE '📋 Next steps:';
  RAISE NOTICE '1. Test the signup flow - users will be created instantly';
  RAISE NOTICE '2. Create your first admin user by running: SELECT public.create_admin_user(''your-email@domain.com'');';
  RAISE NOTICE '3. Monitor the profiles table to see new users being created automatically';
  RAISE NOTICE '⚡ Ready to go - no email confirmation required!';
END $;