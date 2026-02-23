// public/sw-map.js

const CACHE_NAME = "anzen-map-v1";
const MAP_TILE_HOSTS = [
  "https://{s}.tile.openstreetmap.org",
  "https://{s}.basemaps.cartocdn.com",
];

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const url = event.request.url;

  // 地図タイルだけキャッシュ対象にする
  if (url.includes("tile.openstreetmap.org") || url.includes("basemaps.cartocdn.com")) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const cached = await cache.match(event.request);
        if (cached) return cached;

        try {
          const res = await fetch(event.request);
          cache.put(event.request, res.clone());
          return res;
        } catch (e) {
          // オフラインでキャッシュもない場合はそのまま失敗
          return new Response("", { status: 504 });
        }
      })
    );
  }
});
