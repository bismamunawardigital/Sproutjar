const CACHE = "sproutjar-offline-v1";
const OFFLINE = "/offline.html";

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.add(OFFLINE)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.filter((key) => key.startsWith("sproutjar-offline-") && key !== CACHE)
        .map((key) => caches.delete(key)),
    )).then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (event.request.method !== "GET" || event.request.mode !== "navigate" ||
      url.origin !== self.location.origin ||
      /^\/(api|sign-in|sign-up|onboarding|demo|__clerk|\.well-known)(\/|$)/.test(url.pathname)) return;

  event.respondWith(fetch(event.request).catch(async () => {
    const offline = await caches.match(OFFLINE);
    return offline || Response.error();
  }));
});
