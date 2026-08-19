/* Mette in cache il guscio dell'app. Le chiamate all'AI e le immagini vanno sempre in rete. */
const CACHE="forgia-v1";
const FILES=["./","./index.html","./manifest.json","./icons/icon-192.png","./icons/icon-512.png"];
self.addEventListener("install",e=>{
  e.waitUntil(caches.open(CACHE).then(c=>Promise.allSettled(FILES.map(f=>c.add(f)))).then(()=>self.skipWaiting()));
});
self.addEventListener("activate",e=>{
  e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(n=>n!==CACHE).map(n=>caches.delete(n)))).then(()=>self.clients.claim()));
});
self.addEventListener("fetch",e=>{
  const u=new URL(e.request.url);
  if(u.pathname.startsWith("/api/")||u.hostname.includes("pollinations")){ return; }
  e.respondWith(caches.match(e.request).then(hit=>hit||fetch(e.request).catch(()=>caches.match("./index.html"))));
});
