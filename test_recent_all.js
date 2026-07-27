const { createClient } = require('@supabase/supabase-js');
const s = createClient(
  'https://loynmwmaujdauqzamjkc.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxveW5td21hdWpkYXVxemFtamtjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQyMTc5ODUsImV4cCI6MjA5OTc5Mzk4NX0.t1I5wobyS-q3lQ7DwY2vVnZ3w8j_ADoeY_HEkaczwoU'
);

(async () => {
  const { data, error } = await s
      .from('messages')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

  if (error) {
    console.log('Fetch Error:', error);
  } else {
    console.log('Recent 10 Messages in DB:');
    data.forEach(m => console.log(`From: ${m.sender_name} | To ID: ${m.receiver_id} | Text: ${m.text}`));
  }
})();
