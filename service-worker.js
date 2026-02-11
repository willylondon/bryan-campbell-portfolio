/**
 * Service Worker for Bryan Campbell Portfolio
 * Offline caching (SAFE: ignores chrome-extension:// and all non-site assets)
 */

const CACHE_NAME = "gm-campbell-v5";
const OFFLINE_URL = "/index.html";

// Only cache your own site files (same-origin)
const CORE_ASSETS = [
  "/",
  "/index.html",
  "/css/styles.css",
  "/js/main.js",
  "/manifest.json",
  "/images/favicon.ico",
  "/images/apple-touch-icon.png",
  "/images/social-preview.png",
  "/images/profile.jpg"
];

// INSTALL — cache core assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS))
  );
  self.skipWaiting();
});

// ACTIVATE — delete old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => (k !== CACHE_NAME ? caches.delete(k) : null)))
    )
  );
  self.clients.claim();
});

// FETCH — network-first for HTML, cache-first for static assets
self.addEventListener("fetch", (event) => {
  const req = event.request;

  // Only handle GET
  if (req.method !== "GET") return;

  const url = new URL(req.url);

  // Only handle requests from YOUR DOMAIN
  // This blocks caching of chrome-extension://, fonts.googleapis.com, cdnjs, etc.
  if (url.origin !== self.location.origin) return;

  const isHtmlRequest =
    req.mode === "navigate" ||
    req.headers.get("accept")?.includes("text/html") ||
    url.pathname === "/" ||
    url.pathname.endsWith("/index.html");

  if (isHtmlRequest) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (!res || res.status !== 200) return res;
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req).then((cached) => cached || caches.match(OFFLINE_URL)))
    );
    return;
  }

  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;

      return fetch(req)
        .then((res) => {
          if (!res || res.status !== 200) return res;
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
          return res;
        })
        .catch(() => caches.match(OFFLINE_URL));
    })
  );
});
