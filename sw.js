// OneSignal push notifications support
try {
  importScripts("https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js");
} catch (e) {}

const CACHE_NAME = "sissan-v2";
const ASSETS = [
  "./",
  "./index.html",
  "./theory.html",
  "./study/study.html",
  "./study/study.css",
  "./study/js/storage.js",
  "./study/js/app.js",
  "./study/js/pomodoro.js",
  "./study/js/todo.js",
  "./study/js/stats.js",
  "./study/js/gamification.js",
  "./study/js/mood.js",
  "./study/js/calendar.js",
  "./study/js/confetti.js",
];

self.addEventListener("install", function (e) {
  e.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(ASSETS);
    }),
  );
  self.skipWaiting();
});

self.addEventListener("activate", function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys
          .filter(function (k) {
            return k !== CACHE_NAME;
          })
          .map(function (k) {
            return caches.delete(k);
          }),
      );
    }),
  );
  self.clients.claim();
});

self.addEventListener("fetch", function (e) {
  e.respondWith(
    caches
      .match(e.request)
      .then(function (cached) {
        return (
          cached ||
          fetch(e.request).then(function (response) {
            return caches.open(CACHE_NAME).then(function (cache) {
              cache.put(e.request, response.clone());
              return response;
            });
          })
        );
      })
      .catch(function () {
        if (e.request.mode === "navigate") {
          return caches.match("./index.html");
        }
      }),
  );
});
