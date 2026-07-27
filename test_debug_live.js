const { createClient } = require('@supabase/supabase-js');
const s = createClient(
  'https://loynmwmaujdauqzamjkc.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxveW5td21hdWpkYXVxemFtamtjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQyMTc5ODUsImV4cCI6MjA5OTc5Mzk4NX0.t1I5wobyS-q3lQ7DwY2vVnZ3w8j_ADoeY_HEkaczwoU'
);

(async () => {
  console.log('=== RECENT MESSAGES ===');
  const { data: msgs, error: e1 } = await s
    .from('messages')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10);
  
  if (e1) console.log('Messages error:', e1);
  else console.log(msgs);

  console.log('=== RECENT PROFILES ===');
  const { data: profs, error: e2 } = await s
    .from('profiles')
    .select('id, full_name, is_online, last_seen_at')
    .order('last_seen_at', { ascending: false })
    .limit(10);

  if (e2) console.log('Profiles error:', e2);
  else console.log(profs);
})();
