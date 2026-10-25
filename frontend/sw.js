const CACHE_NAME = 'ninja-sifir-3d-webapk-v6';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './public/manifest.webmanifest',
  './public/icon.svg'
];

// Generate real binary PNG Blob inside Service Worker using OffscreenCanvas
async function generateNinjaPngBlob(size) {
  if (typeof OffscreenCanvas === 'undefined') {
    return null;
  }
  const canvas = new OffscreenCanvas(size, size);
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const s = size / 512;

  // 1. Full Bleed Background for Maskable & Any Icon (No transparent corners so Android never adds white plate or badge)
  const bg = ctx.createRadialGradient(256 * s, 160 * s, 30 * s, 256 * s, 256 * s, 380 * s);
  bg.addColorStop(0, '#312e81');
  bg.addColorStop(0.55, '#1e1b4b');
  bg.addColorStop(1, '#090d16');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, size, size);

  // Gold Inner Frame
  ctx.strokeStyle = '#fbbf24';
  ctx.lineWidth = 14 * s;
  ctx.strokeRect(18 * s, 18 * s, (size - 36 * s), (size - 36 * s));

  // 2. Moon Halo
  ctx.fillStyle = 'rgba(254, 249, 195, 0.16)';
  ctx.beginPath();
  ctx.arc(256 * s, 200 * s, 145 * s, 0, Math.PI * 2);
  ctx.fill();

  // 3. Crossed Katanas
  function drawKatana(angleDeg) {
    ctx.save();
    ctx.translate(256 * s, 235 * s);
    ctx.rotate((angleDeg * Math.PI) / 180);
    ctx.fillStyle = '#bae6fd';
    ctx.fillRect(-14 * s, -210 * s, 28 * s, 290 * s);
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(-32 * s, 80 * s, 64 * s, 14 * s);
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(-12 * s, 94 * s, 24 * s, 75 * s);
    ctx.restore();
  }
  drawKatana(-38);
  drawKatana(38);

  // 4. 3D Pixar Royal Blue Ninja Hood
  const hood = ctx.createRadialGradient(210 * s, 150 * s, 20 * s, 256 * s, 232 * s, 155 * s);
  hood.addColorStop(0, '#60a5fa');
  hood.addColorStop(0.4, '#2563eb');
  hood.addColorStop(1, '#0f172a');
  ctx.fillStyle = hood;
  ctx.beginPath();
  ctx.arc(256 * s, 232 * s, 142 * s, 0, Math.PI * 2);
  ctx.fill();

  // 5. Face Opening
  ctx.fillStyle = '#ffedd5';
  ctx.fillRect(132 * s, 175 * s, 248 * s, 98 * s);

  // 6. Pixar Eyes
  function drawEye(cx) {
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(cx * s, 224 * s, 26 * s, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#0284c7';
    ctx.beginPath();
    ctx.arc(cx * s, 226 * s, 18 * s, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#090d16';
    ctx.beginPath();
    ctx.arc(cx * s, 226 * s, 10 * s, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc((cx - 6) * s, 218 * s, 6 * s, 0, Math.PI * 2);
    ctx.fill();
  }
  drawEye(196);
  drawEye(316);

  // 7. Red Ninja Headband & Silver Plate
  ctx.fillStyle = '#ef4444';
  ctx.fillRect(108 * s, 162 * s, 296 * s, 38 * s);
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(206 * s, 160 * s, 100 * s, 42 * s);

  // 8. Golden Sifir Banner at Bottom
  ctx.fillStyle = '#0f172a';
  ctx.strokeStyle = '#fbbf24';
  ctx.lineWidth = 10 * s;
  ctx.fillRect(96 * s, 372 * s, 320 * s, 82 * s);
  ctx.strokeRect(96 * s, 372 * s, 320 * s, 82 * s);

  ctx.fillStyle = '#fef08a';
  ctx.font = '900 ' + Math.round(44 * s) + 'px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('7 × 8 = 56', 256 * s, 415 * s);

  return await canvas.convertToBlob({ type: 'image/png' });
}

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      await cache.addAll(ASSETS_TO_CACHE).catch(() => {});
      // Pre-generate and cache real PNG 192 & 512 responses so WebAPK Minter always gets 200 OK image/png
      try {
        const blob192 = await generateNinjaPngBlob(192);
        if (blob192) {
          const res192 = new Response(blob192, { headers: { 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=31536000' } });
          await cache.put('./public/icon-192.png', res192.clone());
          await cache.put('./icon-192.png', res192);
        }
        const blob512 = await generateNinjaPngBlob(512);
        if (blob512) {
          const res512 = new Response(blob512, { headers: { 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=31536000' } });
          await cache.put('./public/icon-512.png', res512.clone());
          await cache.put('./icon-512.png', res512);
        }
      } catch (e) {
        // Fallback to SVG icon in manifest
      }
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Intercept requests for icon-192.png and icon-512.png
  if (url.pathname.endsWith('icon-192.png') || url.pathname.endsWith('icon-512.png')) {
    const size = url.pathname.endsWith('icon-192.png') ? 192 : 512;
    event.respondWith(
      caches.match(event.request).then(async (cached) => {
        if (cached) return cached;
        const blob = await generateNinjaPngBlob(size);
        if (blob) {
          return new Response(blob, { headers: { 'Content-Type': 'image/png' } });
        }
        return fetch('./public/icon.svg');
      })
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(() => cachedResponse || caches.match('./index.html'));
      return cachedResponse || fetchPromise;
    })
  );
});
