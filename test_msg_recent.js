const { createClient } = require('@supabase/supabase-js');
const s = createClient(
  'https://loynmwmaujdauqzamjkc.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxveW5td21hdWpkYXVxemFtamtjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQyMTc5ODUsImV4cCI6MjA5OTc5Mzk4NX0.t1I5wobyS-q3lQ7DwY2vVnZ3w8j_ADoeY_HEkaczwoU'
);

(async () => {
  const { data, error } = await s.from('messages').select('*').order('created_at', { ascending: false }).limit(3);
  if (error) {
    console.log('Error fetching messages:', error);
  } else {
    console.log('--- RECENT MESSAGES IN DB ---');
    console.log(data);
  }
})();
