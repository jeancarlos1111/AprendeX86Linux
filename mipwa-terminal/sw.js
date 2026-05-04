const CACHE_NAME = 'terminal-v7';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './styles.css',
  './lib/v86.js',
  './lib/v86.wasm',
  './lib/xterm.js',
  './lib/xterm.css',
  './lib/seabios.bin',
  './lib/vgabios.bin',
  './assets/buildroot-bzimage.bin'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter(name => name !== CACHE_NAME)
        .map(name => caches.delete(name))
      );
    })
  );
});
