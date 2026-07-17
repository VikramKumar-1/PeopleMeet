// Stay & Dine Radar India — Background Geolocation Service Worker
const CACHE_NAME = 'stay-dine-radar-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Periodic Background Sync for live location tracking along roads / anywhere
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'radar-location-sync') {
    event.waitUntil(syncUserLocationToSupabase());
  }
});

// Push Notification receiver when nearby students match within 100 meters
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : { title: '📡 Radar Alert!', body: 'A student matches your study goals within 100 meters!' };
  
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      vibrate: [100, 50, 100],
      data: { url: '/' }
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url || '/')
  );
});

async function syncUserLocationToSupabase() {
  try {
    console.log('[Background SW] Syncing user live coordinates while app is closed/minimized...');
    if ('geolocation' in self.navigator) {
      self.navigator.geolocation.getCurrentPosition(async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        console.log('[Background SW] Captured live background coordinates:', lat, lng);
      }, (err) => {
        console.warn('[Background SW] Could not get background GPS:', err);
      }, { enableHighAccuracy: true, timeout: 5000 });
    }
  } catch (err) {
    console.error('[Background SW] Sync failed:', err);
  }
}
