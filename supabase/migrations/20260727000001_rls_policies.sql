-- ============================================================
-- PeopleMeet: Enterprise Security & RLS Policies
-- Run this ENTIRE script in Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. Enable RLS on all main tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE friend_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE pg_listings ENABLE ROW LEVEL SECURITY;

-- If messages table exists, enable RLS
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'messages') THEN
    EXECUTE 'ALTER TABLE messages ENABLE ROW LEVEL SECURITY';
  END IF;
END $$;

-- 2. PROFILES POLICIES
-- Drop existing if any to avoid errors
DROP POLICY IF EXISTS "profiles_public_read" ON profiles;
DROP POLICY IF EXISTS "profiles_self_insert" ON profiles;
DROP POLICY IF EXISTS "profiles_self_update" ON profiles;

-- Anyone can read profiles (Radar needs this)
CREATE POLICY "profiles_public_read" ON profiles
  FOR SELECT USING (true);

-- Users can only insert their own profile
CREATE POLICY "profiles_self_insert" ON profiles
  FOR INSERT WITH CHECK (
    -- If using Supabase Auth, id must match auth.uid(). 
    -- If not using Auth, we temporarily allow all inserts until full Auth is enforced.
    -- Assuming full Auth is enforced:
    auth.uid()::text = id::text
  );

-- Users can only update their own profile
CREATE POLICY "profiles_self_update" ON profiles
  FOR UPDATE USING (
    auth.uid()::text = id::text
  );

-- 3. INDEXES FOR PERFORMANCE (For 10,000+ users)
-- Drop if exists to avoid conflicts
DROP INDEX IF EXISTS idx_profiles_city_id;
DROP INDEX IF EXISTS idx_profiles_last_seen;

-- Create indexes
CREATE INDEX idx_profiles_city_id ON profiles(city_id);
CREATE INDEX idx_profiles_last_seen ON profiles(last_seen_at DESC);

-- Done! Your database is now secure from unauthorized edits.
