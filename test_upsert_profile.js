const { createClient } = require('@supabase/supabase-js');
const s = createClient(
  'https://loynmwmaujdauqzamjkc.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxveW5td21hdWpkYXVxemFtamtjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQyMTc5ODUsImV4cCI6MjA5OTc5Mzk4NX0.t1I5wobyS-q3lQ7DwY2vVnZ3w8j_ADoeY_HEkaczwoU'
);

(async () => {
  const testProf = {
    id: `u-${Date.now()}`,
    full_name: 'Test Upsert User',
    email: `test_${Date.now()}@example.com`,
    gender: 'Boys',
    bio: 'Testing profile upsert',
    city_id: 'ranchi',
    locality_hub: 'Lalpur Chowk',
    lat: 23.3645,
    lng: 85.3195,
    last_lat: 23.3645,
    last_lng: 85.3195,
    last_location_at: new Date().toISOString(),
    location_source: 'signup',
    is_online: true,
    last_seen_at: new Date().toISOString(),
    status: 'Online',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
  };

  const { data, error } = await s.from('profiles').upsert(testProf, { onConflict: 'id' });
  if (error) {
    console.log('UPSERT ERROR:', error.message, error.details, error.hint);
  } else {
    console.log('UPSERT SUCCESS!');
  }
})();
