const { createClient } = require('@supabase/supabase-js');
const s = createClient(
  'https://loynmwmaujdauqzamjkc.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxveW5td21hdWpkYXVxemFtamtjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQyMTc5ODUsImV4cCI6MjA5OTc5Mzk4NX0.t1I5wobyS-q3lQ7DwY2vVnZ3w8j_ADoeY_HEkaczwoU'
);

(async () => {
  console.log('Connecting to Realtime...');
  
  const channel = s.channel('test_live_channel');
  
  channel.on(
    'postgres_changes',
    { event: 'INSERT', schema: 'public', table: 'messages' },
    (payload) => {
      console.log('REALTIME PAYLOAD RECEIVED:', payload);
    }
  ).subscribe((status, err) => {
    console.log('Subscription Status:', status);
    if (err) console.log('Error:', err);
    
    if (status === 'SUBSCRIBED') {
      console.log('Inserting test message to trigger realtime...');
      // Insert a dummy message
      s.from('messages').insert({
        id: `test-rt-${Date.now()}`,
        sender_id: 'ee046250-74ef-4dac-a542-c25fc11c8b63',
        receiver_id: 'd17363cd-eb89-439d-b3c5-55c80c0eb092',
        text: 'Realtime Trigger Test',
        timestamp: '11:00 PM',
        is_read: false
      }).then(({error}) => {
        if(error) console.log('Insert Error:', error.message);
      });
    }
  });

  // Wait 10 seconds to see if payload arrives
  setTimeout(() => {
    console.log('Timeout reached. Exiting.');
    process.exit(0);
  }, 10000);
})();
