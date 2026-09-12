/* Jugend-Zentrale - Service Worker fuer Push-Benachrichtigungen
   Muss im selben Ordner wie die index.html liegen. */

self.addEventListener('install', function (e) {
  self.skipWaiting();
});

self.addEventListener('activate', function (e) {
  e.waitUntil(self.clients.claim());
});

self.addEventListener('push', function (e) {
  var d = { titel: 'Jugend-Zentrale', text: '', url: './' };
  try {
    if (e.data) {
      var j = e.data.json();
      d.titel = j.titel || d.titel;
      d.text = j.text || '';
      d.url = j.url || './';
    }
  } catch (err) {
    try { d.text = e.data ? e.data.text() : ''; } catch (e2) {}
  }

  e.waitUntil(
    self.registration.showNotification(d.titel, {
      body: d.text,
      icon: './icon-192.png',
      badge: './icon-192.png',
      tag: 'jz-' + (d.titel || '').slice(0, 24),
      renotify: true,
      data: { url: d.url },
      vibrate: [120, 60, 120]
    })
  );
});

self.addEventListener('notificationclick', function (e) {
  e.notification.close();
  var ziel = (e.notification.data && e.notification.data.url) || './';
  e.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (liste) {
      for (var i = 0; i < liste.length; i++) {
        if ('focus' in liste[i]) return liste[i].focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow(ziel);
    })
  );
});
