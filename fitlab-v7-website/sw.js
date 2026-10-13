// The Fit Lab — service worker (v9)
// Shows pop-up notifications on phones and computers, and opens the right
// page when one is tapped. It does not cache pages, so the site is always
// the latest version.

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));

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
