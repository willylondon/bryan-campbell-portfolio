/**
 * Service Worker for Bryan Campbell Portfolio
 * Enables offline functionality and caching
 */

const CACHE_NAME = "gm-campbell-v3";

const urlsToCache = [
  "/",
  "/index.html",
  "/css/styles.css",
  "/js/main.js",
  "/manifest.json",
  "https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;600&family=Russo+One&display=swap",
  "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
];

// INSTALL — cache core assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

// ACTIVATE — clean old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => (key !== CACHE_NAME ? caches.delete(key) : null))
      )
    )
  );
  self.clients.claim();
});

// FETCH — serve cached, fallback to network (SAFE: ignores chrome-extension:// etc.)
self.addEventListener("fetch", (event) => {
  const req = event.request;

  // Only cache GET requests
  if (req.method !== "GET") return;

  // Only handle http/https requests (ignore chrome-extension://, blob:, data:, etc.)
  const url = new URL(req.url);
  if (url.protocol !== "http:" && url.protocol !== "https:") return;

  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;

      return fetch(req)
        .then((res) => {
          // Cache only successful same-origin responses
          if (!res || res.status !== 200 || res.type !== "basic") return res;

          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
          return res;
        })
        .catch(() => caches.match("/index.html"));
    })
  );
});
