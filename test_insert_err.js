const { createClient } = require('@supabase/supabase-js');
const s = createClient(
  'https://loynmwmaujdauqzamjkc.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxveW5td21hdWpkYXVxemFtamtjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQyMTc5ODUsImV4cCI6MjA5OTc5Mzk4NX0.t1I5wobyS-q3lQ7DwY2vVnZ3w8j_ADoeY_HEkaczwoU'
);

(async () => {
  // We can't run raw SQL from the JS client easily without a stored procedure.
  // I will just check if there's any error inserting with 'me' as sender_id.
  const { error } = await s.from('messages').insert({
    id: `test-error-${Date.now()}`,
    sender_id: 'me', // invalid UUID
    receiver_id: 'd17363cd-eb89-439d-b3c5-55c80c0eb092',
    text: 'Test Invalid UUID',
    timestamp: '11:00 PM',
    is_read: false
  });
  console.log('Error when sending "me":', error?.message);
})();
