/*
  # Update user_profiles table schema

  1. Changes
    - Rename `users` table to `user_profiles` 
    - Add missing fields: education, work, relationshipStatus, phone, website, isVerified, familyStatus, location, hobbies, languages, email_verified, birthday
    - Rename fields to match schema: lastName -> last_name, birthDate -> birth_date, date -> created_at
    - Add updated_at field with trigger
    - Add proper indexes

  2. Security
    - Update RLS policies to reference new table name
    - Maintain same security model
*/

-- First, create the new user_profiles table with correct schema
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id uuid not null default gen_random_uuid (),
  auth_user_id uuid null,
  name text not null,
  last_name text not null,
  email text not null,
  avatar text null,
  bio text null,
  city text null,
  birth_date date null,
  email_verified boolean null default false,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  notifications jsonb null default '{"email": true, "messages": true, "friendRequests": true}'::jsonb,
  privacy jsonb null default '{"showEmail": false, "showBirthDate": true, "profileVisibility": "public"}'::jsonb,
  education text null,
  work text null,
  "relationshipStatus" text null,
  phone text null,
  hobbies text[] null,
  languages text[] null,
  website text null,
  "isVerified" boolean null default false,
  "familyStatus" text null,
  location text null,
  birthday date null,
  constraint user_profiles_pkey primary key (id),
  constraint user_profiles_email_key unique (email),
  constraint user_profiles_auth_user_id_fkey foreign KEY (auth_user_id) references auth.users (id)
);

-- Migrate data from users table to user_profiles if users table exists
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users' AND table_schema = 'public') THEN
    -- Insert data from users to user_profiles
    INSERT INTO public.user_profiles (
      auth_user_id, name, last_name, email, avatar, bio, city, birth_date, 
      created_at, notifications, privacy
    )
    SELECT 
      auth_user_id, 
      name, 
      COALESCE("lastName", lastname, ''), -- Handle both possible column names
      email, 
      avatar, 
      bio, 
      city, 
      COALESCE("birthDate", birthdate), -- Handle both possible column names
      COALESCE(date, created_at, now()), -- Handle both possible column names
      COALESCE(notifications, '{"email": true, "messages": true, "friendRequests": true}'::jsonb),
      COALESCE(privacy, '{"showEmail": false, "showBirthDate": true, "profileVisibility": "public"}'::jsonb)
    FROM public.users
    ON CONFLICT (email) DO NOTHING;
    
    -- Drop the old users table
    DROP TABLE IF EXISTS public.users CASCADE;
  END IF;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS user_profiles_auth_user_id_idx ON public.user_profiles USING btree (auth_user_id);
CREATE INDEX IF NOT EXISTS user_profiles_email_idx ON public.user_profiles USING btree (email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_auth_user_id ON public.user_profiles USING btree (auth_user_id);

-- Enable Row Level Security
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Drop old policies if they exist
DROP POLICY IF EXISTS "Users can view their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Authenticated users can view all profiles" ON public.user_profiles;

-- Create RLS policies
CREATE POLICY "Users can view their own profile"
  ON public.user_profiles FOR SELECT
  USING (auth_user_id = auth.uid());

CREATE POLICY "Users can update their own profile"
  ON public.user_profiles FOR UPDATE
  USING (auth_user_id = auth.uid());

CREATE POLICY "Users can insert their own profile"
  ON public.user_profiles FOR INSERT
  WITH CHECK (auth_user_id = auth.uid());

CREATE POLICY "Authenticated users can view all profiles"
  ON public.user_profiles FOR SELECT
  USING (auth.role() = 'authenticated');

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_user_profiles_updated_at_trigger ON public.user_profiles;
CREATE TRIGGER update_user_profiles_updated_at_trigger
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_user_profiles_updated_at();

-- Update existing table references in other tables
DO $$
BEGIN
  -- Update posts table foreign key if it exists
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'posts' AND table_schema = 'public') THEN
    -- Update the foreign key constraint name if needed
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints 
      WHERE constraint_name = 'posts_user_id_fkey' 
      AND table_name = 'posts'
    ) THEN
      ALTER TABLE posts ADD CONSTRAINT posts_user_id_fkey 
      FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE;
    END IF;
  END IF;

  -- Update groups table foreign key if it exists
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'groups' AND table_schema = 'public') THEN
    -- Update the foreign key constraint
    ALTER TABLE groups DROP CONSTRAINT IF EXISTS groups_created_by_fkey;
    ALTER TABLE groups ADD CONSTRAINT groups_created_by_fkey 
    FOREIGN KEY (created_by) REFERENCES user_profiles(id) ON DELETE CASCADE;
  END IF;

  -- Update group_members table foreign key if it exists
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'group_members' AND table_schema = 'public') THEN
    -- Update the foreign key constraint
    ALTER TABLE group_members DROP CONSTRAINT IF EXISTS group_members_user_id_fkey;
    ALTER TABLE group_members ADD CONSTRAINT group_members_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE;
  END IF;
END $$;