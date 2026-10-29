// DPA TriCore service worker. It only shows browser alerts — no caching, no
// offline mode. Alerts come from background-job through the browser's push
// service; see docs/architecture/Notifications.md.

const APP_NAME = 'DPA TriCore';
const ICON = '/icon-192.png';
const BADGE = '/badge-96.png';

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));

self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { body: event.data ? event.data.text() : null };
  }

  event.waitUntil(
    (async () => {
      // Every push must show something: Safari stops delivering to sites that push silently.
      await self.registration.showNotification(data.title || APP_NAME, {
        body: data.body || undefined,
        tag: data.tag,
        icon: ICON,
        badge: BADGE,
        data: { link: data.link || '/', tag: data.tag },
      });
      // Open DPA tabs refresh the bell straight away instead of waiting for the next poll.
      const windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
      windows.forEach((client) => client.postMessage({ type: 'notification-received' }));
    })(),
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const { link = '/', tag = '' } = event.notification.data || {};
  // Only ever open a page of this app.
  const url = new URL(link, self.location.origin);
  const target = url.origin === self.location.origin ? url : new URL('/', self.location.origin);
  const path = target.pathname + target.search + target.hash;

  event.waitUntil(
    (async () => {
      const windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
      const open = windows.find((client) => new URL(client.url).origin === self.location.origin);
      if (open) {
        // The tab navigates itself, so the page doesn't reload and the alert is marked read.
        await open.focus();
        open.postMessage({ type: 'open-notification', link: path, tag });
        return;
      }
      await self.clients.openWindow(target.href);
    })(),
  );
});
