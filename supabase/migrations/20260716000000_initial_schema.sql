
-- 1. Users Profile & Snapshot Location Table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  full_name TEXT NOT NULL,
  gender TEXT NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  city_id TEXT NOT NULL,
  locality_hub TEXT NOT NULL,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  status TEXT DEFAULT 'Online',
  last_active_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. PG & Hostel Listings Table
CREATE TABLE IF NOT EXISTS pg_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES profiles(id),
  title TEXT NOT NULL,
  city_id TEXT NOT NULL,
  locality_hub TEXT NOT NULL,
  rent_per_month INTEGER NOT NULL,
  type TEXT NOT NULL,
  food_included BOOLEAN DEFAULT true,
  image_url TEXT
);

-- 3. Friend Requests & Waves Table
CREATE TABLE IF NOT EXISTS friend_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID REFERENCES profiles(id),
  receiver_id UUID REFERENCES profiles(id),
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
