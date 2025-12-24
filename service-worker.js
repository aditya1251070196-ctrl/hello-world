const CACHE_NAME = "traffic-sign-cache-v1";
const urlsToCache = [
  "/traffic-sign-recognition-app/index.html",
  "/traffic-sign-recognition-app/style.css",
  "/traffic-sign-recognition-app/script.js",
  "/traffic-sign-recognition-app/manifest.json",
  "/traffic-sign-recognition-app/icons/icon-192.png",
  "/traffic-sign-recognition-app/icons/icon-512.png",
  "/traffic-sign-recognition-app/model/model.json",
  "/traffic-sign-recognition-app/model/labels.json",
  "/traffic-sign-recognition-app/model/traffic_sign_model.weights.bin"
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
