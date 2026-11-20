// Busca sempre a versão mais nova na internet. Sem sinal (ou se demorar mais de 4 s),
// usa a cópia guardada, assim o app funciona offline e as atualizações chegam na hora.
const CACHE = 'contador-cantos-v18';
const ASSETS = [
  './', 'index.html', 'styles.css', 'app.js', 'logic.js', 'offers.js', 'manifest.webmanifest',
  'logo-96.png', 'icon-180.png', 'icon-192.png', 'icon-512.png', 'icon-maskable-512.png',
];
const TIMEOUT_MS = 4000;

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE)
      .then((c) => c.addAll(ASSETS.map((a) => new Request(a, { cache: 'reload' }))))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

function fetchFresh(req) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('timeout')), TIMEOUT_MS);
    fetch(new Request(req.url, { cache: 'no-cache' })).then(
      (res) => { clearTimeout(timer); resolve(res); },
      (err) => { clearTimeout(timer); reject(err); },
    );
  });
}

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith((async () => {
    const cache = await caches.open(CACHE);
    try {
      const res = await fetchFresh(req);
      if (res.ok) cache.put(req, res.clone());
      return res;
    } catch {
      const cached = await cache.match(req, { ignoreSearch: true })
        || (req.mode === 'navigate' ? await cache.match('index.html') : undefined);
      return cached || Response.error();
    }
  })());
});
