const CACHE_NAME = "traffic-sign-cache-v1";
const urlsToCache = [
  "./index.html",
  "./style.css",
  "./script.js",
  "./manifest.json",
  "./model/model.json",
  "./model/labels.json",
  "./model/traffic_sign_model.weights.bin"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});