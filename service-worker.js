const CACHE_NAME = "traffic-sign-cache-v1";
const urlsToCache = [
  "/hello-world/index.html",
  "/hello-world/style.css",
  "/hello-world/script.js",
  "/hello-world/manifest.json",
  "/hello-world/icons/icon-192.png",
  "/hello-world/icons/icon-512.png",
  "/hello-world/model/model.json",
  "/hello-world/model/labels.json",
  "/hello-world/model/traffic_sign_model.weights.bin"
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

