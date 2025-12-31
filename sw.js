// This is the Service Worker
self.addEventListener('install', (e) => {
  console.log('Service Worker: Installed');
});

self.addEventListener('fetch', (e) => {
  // This allows the app to work offline later
  e.respondWith(fetch(e.request));
});