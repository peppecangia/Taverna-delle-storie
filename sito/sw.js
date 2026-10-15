/*
 * Funzionamento offline: l'app si apre anche senza rete.
 * Prima prova la rete (così gli aggiornamenti arrivano subito), se manca usa la copia salvata.
 * Le chiamate /api/ non vengono mai salvate.
 */
const VERSIONE = "taverna-v1";
const FILE = [
  "./", "index.html", "privacy.html", "manifest.json", "css/app.css",
  "js/main.js", "js/config.js", "js/ui.js", "js/api.js", "js/archivio.js", "js/regole.js", "js/tabelle.js", "js/caso.js",
  "js/mappe.js", "js/immagini.js", "js/musica.js", "js/dadi.js",
  "js/viste/crea.js", "js/viste/risultati.js", "js/viste/tavolo.js", "js/viste/altro.js",
  "icons/icona-192.png", "icons/icona-512.png",
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(VERSIONE).then((c) => c.addAll(FILE)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((chiavi) => Promise.all(chiavi.filter((k) => k !== VERSIONE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.pathname.startsWith("/api/")) return;
  const stessoSito = url.origin === location.origin;
  const caratteri = url.hostname.endsWith("fonts.googleapis.com") || url.hostname.endsWith("fonts.gstatic.com");
  if (!stessoSito && !caratteri) return;
  e.respondWith(
    fetch(e.request)
      .then((r) => {
        if (r.ok || r.type === "opaque") {
          const copia = r.clone();
          caches.open(VERSIONE).then((c) => c.put(e.request, copia));
        }
        return r;
      })
      .catch(() => caches.match(e.request).then((r) => r || caches.match("index.html")))
  );
});
