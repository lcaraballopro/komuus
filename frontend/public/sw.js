// Komu PWA Service Worker
// Handles push notifications for mobile PWA

// Handle notification clicks
self.addEventListener('notificationclick', function (event) {
    event.notification.close();

    const ticketId = event.notification.tag;
    const urlToOpen = new URL(`/tickets/${ticketId}`, self.location.origin).href;

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (clientList) {
            // Try to focus existing window
            for (let i = 0; i < clientList.length; i++) {
                const client = clientList[i];
                if ('focus' in client) {
                    return client.focus().then(client => client.navigate(urlToOpen));
                }
            }
            // Open new window if none exists
            if (clients.openWindow) {
                return clients.openWindow(urlToOpen);
            }
        })
    );
});

// Install event - cache essential files for offline support
self.addEventListener('install', function (event) {
    console.log('[SW] Installing Service Worker');
    self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', function (event) {
    console.log('[SW] Service Worker activated');
    event.waitUntil(clients.claim());
});

// Push event - handle server-side push notifications
self.addEventListener('push', function (event) {
    if (!event.data) return;

    const data = event.data.json();
    const options = {
        body: data.body,
        icon: data.icon || '/android-chrome-192x192.png',
        badge: '/favicon-32x32.png',
        tag: String(data.ticketId),
        renotify: true,
        vibrate: [200, 100, 200],
        requireInteraction: true,
        data: {
            ticketId: data.ticketId
        }
    };

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});
