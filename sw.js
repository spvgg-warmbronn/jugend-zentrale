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
  /* Ziel immer innerhalb der App aufloesen - nie die Domain-Wurzel (dort gibt es nur ein 404) */
  var roh = (e.notification.data && e.notification.data.url) || './';
  var basis = self.registration.scope;                 /* z. B. https://spvgg-warmbronn.github.io/jugend-zentrale/ */
  var ziel;
  try {
    if (/^https?:/.test(roh) && roh.indexOf(basis) === 0) ziel = roh;
    else ziel = basis + String(roh).replace(/^[./]+/, '');
  } catch (err) { ziel = basis; }
  e.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (liste) {
      for (var i = 0; i < liste.length; i++) {
        if ('focus' in liste[i] && liste[i].url && liste[i].url.indexOf(basis) === 0) return liste[i].focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow(ziel);
    })
  );
});
