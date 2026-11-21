// Viagens Bíblicas — service worker v3.7.0
// Rede primeiro (as atualizações do GitHub aparecem logo); sem internet, usa o que está guardado.
// Os mapas ficam guardados para a aula funcionar mesmo sem Wi-Fi. Os PDFs são guardados depois do primeiro download.
const CACHE = 'viagens-biblicas-3.7.0';
const BASICOS = ['./', 'index.html', 'porteiro.js', 'manifest.json', 'icon-192.png', 'icon-512.png', 'apple-touch-icon.png', 'icon-maskable.png', 'mapas/abraao.jpg', 'mapas/exilio.jpg', 'mapas/exodo.jpg', 'mapas/jesus.jpg', 'mapas/v1.jpg', 'mapas/v2.jpg', 'mapas/v3.jpg', 'mapas/v4.jpg'];
const SUPA = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(BASICOS).then(() => c.add(SUPA).catch(() => {}))).catch(() => {}).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => e.waitUntil(
  caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())
));
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET') return;
  const proprio = u.origin === location.origin, supa = u.href.startsWith(SUPA);
  if (!proprio && !supa) return;
  if (u.search.includes('nocache=')) return;   // verificação de versão: sempre da rede
  e.respondWith(fetch(e.request).then(res => {
    if (res.ok) { const c = res.clone(); caches.open(CACHE).then(x => x.put(e.request, c)); }
    return res;
  }).catch(() => caches.match(e.request, { ignoreSearch: true }).then(r => r || (proprio ? caches.match('index.html') : undefined))));
});
