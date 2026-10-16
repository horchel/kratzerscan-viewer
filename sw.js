// KratzerScan Viewer: App-Dateien offline vorhalten, per „Teilen“ (Android) empfangene Berichte übernehmen.
const CACHE = "kratzerscan-viewer-v2";
const FILES = ["./", "./index.html", "./manifest.webmanifest", "./model-viewer.min.js",
  "./icon-192.png", "./icon-512.png", "./icon-maskable-512.png", "./apple-touch-icon.png"];
const STORE = "kratzerscan-bericht", KEY = "./_bericht";  // wie in index.html

self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES))); self.skipWaiting(); });
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(k => Promise.all(k.filter(n => n !== CACHE && n !== STORE).map(n => caches.delete(n)))));
  self.clients.claim();
});
self.addEventListener("fetch", e => {
  const u = new URL(e.request.url);
  if (e.request.method === "POST" && u.pathname.endsWith("/teilen")) {
    e.respondWith((async () => {
      const f = (await e.request.formData()).get("bericht");
      if (f && f.size) await (await caches.open(STORE)).put(KEY, new Response(f, { headers: { "x-name": encodeURIComponent(f.name || "") } }));
      return Response.redirect("./?geteilt=1", 303);
    })());
    return;
  }
  if (e.request.method !== "GET") return;
  e.respondWith(caches.match(e.request, { ignoreSearch: true }).then(r => r || fetch(e.request)));
});
