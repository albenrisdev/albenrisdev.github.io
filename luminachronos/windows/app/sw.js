// Offline cache. Bump VERSION on every release so installed copies pick up new files.
const VERSION = "lc-1.3.0-1";
const FILES = [
  "./",
  "index.html",
  "styles.css",
  "app.js",
  "ticker.js",
  "strings.js",
  "strings-windows.js",
  "other-stores.js",
  "qr/app-store.svg",
  "qr/google-play.svg",
  "manifest.webmanifest",
  "fonts/SpecialElite.ttf",
  "sounds/complete.wav",
  "sounds/tick.wav",
  "sounds/button_click.wav",
  "sounds/ding.wav",
  "icons/icon-48.png",
  "icons/icon-192.png",
  "icons/icon-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(VERSION).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  // Stale-while-revalidate: answer from the cache (works offline), refresh it in the
  // background so the next launch gets any update.
  const url = new URL(event.request.url);
  if (url.origin !== location.origin) return;
  event.respondWith(
    caches.open(VERSION).then(async (cache) => {
      const key = url.pathname.endsWith("/") ? url.pathname : event.request;
      const hit = await cache.match(key, { ignoreSearch: true });
      const refresh = fetch(event.request)
        .then((res) => { if (res.ok) cache.put(key, res.clone()); return res; })
        .catch(() => hit);
      if (hit) { event.waitUntil(refresh); return hit; }
      return refresh;
    })
  );
});

// Clicking the "session complete" notification brings the app window forward.
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
      for (const c of list) if ("focus" in c) return c.focus();
      return self.clients.openWindow("./");
    })
  );
});
