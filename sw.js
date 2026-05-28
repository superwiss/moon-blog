/* sw.js */
const CACHE_NAME = 'moon-blog-cache-v1.0.5'; // Increment this version on each deploy to trigger notifications!
const ASSETS = [
    './',
    './index.html',
    './detail.html',
    './snail-detail.html',
    './horangi-forest.html',
    './assets/css/style.css',
    './js/main.js',
    './js/detail.js',
    './js/snail-detail.js',
    './js/horangi-forest.js',
    './assets/images/logo_supermoon.png',
    './assets/images/grasshopper_ttougi.png',
    './assets/images/snail_dali.png',
    './assets/images/tomb_horangi.png'
];

// Install event: cache initial assets
self.addEventListener('install', (e) => {
    self.skipWaiting();
    e.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS);
        })
    );
});

// Activate event: detect update and trigger native system push notification
self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.map((key) => {
                    if (key !== CACHE_NAME) {
                        // Old cache detected! This is a deployment update!
                        showUpdateNotification();
                        return caches.delete(key);
                    }
                })
            );
        })
    );
});

function showUpdateNotification() {
    if (self.registration) {
        self.registration.showNotification("일기장 새 버전 업데이트! 🎈", {
            body: "루시의 초록 일기장이 더 새롭고 멋진 모습으로 업데이트되었습니다. 지금 바로 확인해 보세요! 🌿",
            icon: "./assets/images/logo_supermoon.png",
            badge: "./assets/images/logo_supermoon.png",
            tag: "version-update",
            renotify: true,
            requireInteraction: true
        });
    }
}

// Fetch event: network fallback to cache
self.addEventListener('fetch', (e) => {
    e.respondWith(
        caches.match(e.request).then((cachedResponse) => {
            return cachedResponse || fetch(e.request);
        })
    );
});

// Click notification event: focus or open the diary
self.addEventListener('notificationclick', (e) => {
    e.notification.close();
    e.waitUntil(
        clients.matchAll({ type: 'window' }).then((clientList) => {
            for (const client of clientList) {
                if (client.url && 'focus' in client) {
                    client.navigate(client.url);
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow('./');
            }
        })
    );
});
