const { createClient } = require('@supabase/supabase-js');
const s = createClient(
  'https://loynmwmaujdauqzamjkc.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxveW5td21hdWpkYXVxemFtamtjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQyMTc5ODUsImV4cCI6MjA5OTc5Mzk4NX0.t1I5wobyS-q3lQ7DwY2vVnZ3w8j_ADoeY_HEkaczwoU'
);

(async () => {
  const { data, error } = await s
    .from('profiles')
    .select('id, full_name, city_id, is_online, last_lat, last_lng, email, location_source')
    .order('last_seen_at', { ascending: false })
    .limit(10);

  if (error) {
    console.log('Error:', error.message);
  } else {
    console.log('--- DB PROFILES ---');
    data.forEach(p => console.log(`Name: ${p.full_name} | City: ${p.city_id} | Online: ${p.is_online} | Email: ${p.email} | ID: ${p.id} | Coords: ${p.last_lat}, ${p.last_lng}`));
  }
})();
