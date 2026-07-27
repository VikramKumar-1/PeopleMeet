const { createClient } = require('@supabase/supabase-js');
const s = createClient(
  'https://loynmwmaujdauqzamjkc.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxveW5td21hdWpkYXVxemFtamtjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQyMTc5ODUsImV4cCI6MjA5OTc5Mzk4NX0.t1I5wobyS-q3lQ7DwY2vVnZ3w8j_ADoeY_HEkaczwoU'
);

(async () => {
  const { data, error } = await s.from('messages').insert({
    id: `msg-${Date.now()}`,
    sender_id: 'ee046250-74ef-4dac-a542-c25fc11c8b63', // Vikram Kumar's ID
    receiver_id: 'd17363cd-eb89-439d-b3c5-55c80c0eb092', // Viki Kumar's ID
    text: 'Test message from server',
    timestamp: new Date().toISOString(),
    is_read: false,
    sender_name: 'Vikram Kumar',
    sender_avatar: ''
  });

  if (error) {
    console.log('Insert Error:', error.message, error.details, error.hint);
  } else {
    console.log('Insert Success!');
    
    // Test fetch
    const { data: d2, error: e2 } = await s.from('messages').select('*').limit(5);
    if (e2) console.log('Select Error:', e2.message);
    else console.log('Messages in DB:', d2);
  }
})();
