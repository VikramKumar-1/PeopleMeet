-- 4. Messages Table for Real Chat History Persistence
CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  sender_id UUID REFERENCES profiles(id) NOT NULL,
  receiver_id TEXT NOT NULL,
  text TEXT NOT NULL,
  timestamp TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  sender_name TEXT,
  sender_avatar TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
