// The Fit Lab — service worker (v10)
// Shows pop-up notifications on phones and computers, opens the right page
// when one is tapped, shows a proper screen when the device is offline, and
// receives photos and links shared from other apps ("Share to Fit Lab").
// Pages are never cached, so the site is always the latest version.

const OFFLINE = 'fl-offline-v10';
const SHARE = 'fl-share';
const OFFLINE_FILES = ['offline.html', 'assets/logo-600.png', 'assets/logo-600-light.png', 'assets/icon-192.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(OFFLINE).then((c) => c.addAll(OFFLINE_FILES)).catch(() => {}).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => k.startsWith('fl-offline-') && k !== OFFLINE).map((k) => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // "Share to Fit Lab" from another app: keep the shared text and photo, then open the post box
  if (req.method === 'POST' && url.pathname.endsWith('/share-target')) {
    event.respondWith((async () => {
      try {
        const form = await req.formData();
        const text = [form.get('title'), form.get('text'), form.get('url')].map((v) => (v || '').toString().trim()).filter(Boolean);
        const uniq = text.filter((v, i) => text.indexOf(v) === i).join('\n');
        const cache = await caches.open(SHARE);
        await cache.put('shared-text', new Response(JSON.stringify({ text: uniq, at: Date.now() }), { headers: { 'Content-Type': 'application/json' } }));
        const file = form.get('image');
        if (file && typeof file === 'object' && file.size) await cache.put('shared-image', new Response(file, { headers: { 'Content-Type': file.type || 'image/jpeg' } }));
        else await cache.delete('shared-image');
      } catch (_) {}
      return Response.redirect(new URL('feed.html?shared=1', self.registration.scope).href, 303);
    })());
    return;
  }

  // pages: always from the network; the offline screen only when there is no connection
  if (req.mode === 'navigate') {
    event.respondWith(fetch(req).catch(async () => (await caches.match('offline.html', { cacheName: OFFLINE })) || Response.error()));
  }
});

self.addEventListener('push', (event) => {
  let d = {};
  try { d = event.data ? event.data.json() : {}; } catch (_) { d = { body: event.data ? event.data.text() : '' }; }
  const title = d.title || 'The Fit Lab';
  const options = {
    body: d.body || '',
    icon: d.icon || 'assets/icon-192.png',
    badge: d.badge || 'assets/badge-96.png',
    tag: d.tag || undefined,
    renotify: !!d.tag,
    data: { url: d.url || 'notifications.html' },
  };
  event.waitUntil((async () => {
    await self.registration.showNotification(title, options);
    // a dot on the app icon until The Fit Lab is opened again
    try { if (self.navigator.setAppBadge) await self.navigator.setAppBadge(); } catch (_) {}
    // let open tabs refresh their counters straight away
    const tabs = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    tabs.forEach((c) => c.postMessage({ type: 'fl-push', title, body: options.body, url: options.data.url }));
  })());
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const rel = (event.notification.data && event.notification.data.url) || 'notifications.html';
  const url = new URL(rel, self.registration.scope);
  if (url.origin !== self.location.origin) return;
  event.waitUntil((async () => {
    const tabs = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const c of tabs) {
      if (new URL(c.url).origin === url.origin && 'focus' in c) {
        await c.focus();
        if ('navigate' in c) return c.navigate(url.href);
        return;
      }
    }
    return self.clients.openWindow(url.href);
  })());
});
