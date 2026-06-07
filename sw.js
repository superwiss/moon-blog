/* sw.js */
const CACHE_NAME = 'moon-blog-cache-v1.1.3'; // Increment this version on each deploy to trigger notifications!
const UPDATE_MESSAGE = "달팽이 관찰 일지 13일차: 달이의 대탐험과 이색 놀이터, 그리고 아쉬운 이별 이야기 업데이트 💔🐌";
const ASSETS = [
    './',
    './index.html',
    './detail.html',
    './snail-detail.html',
    './ant-detail.html',
    './horangi-forest.html',
    './assets/css/style.css',
    './js/main.js',
    './js/detail.js',
    './js/snail-detail.js',
    './js/ant-detail.js',
    './js/horangi-forest.js',
    './assets/images/logo_supermoon.png',
    './assets/images/grasshopper_ttougi.png',
    './assets/images/snail_dali.png',
    './assets/images/ant_farm_1.png',
    './assets/images/ant_farm_2.png',
    './assets/images/tomb_horangi.png',
    './assets/20260529/days.jpg',
    './assets/20260529/팽이.png',
    './assets/20260529/팽이_전속력.mp4',
    './assets/20260529/뚜기였던것.png',
    './assets/20260529/뚜기_점프.mp4',
    './assets/20260607/놀이터.jpg'
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

// Activate event: detect update, delete ALL old caches, and claim clients instantly!
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
        }).then(() => self.clients.claim()) // Instantly take control of all active tabs!
    );
});

function showUpdateNotification() {
    if (self.registration) {
        self.registration.showNotification("일기장 새 버전 업데이트! 🎈", {
            body: UPDATE_MESSAGE,
            icon: "./assets/images/logo_supermoon.png",
            badge: "./assets/images/logo_supermoon.png",
            tag: "version-update",
            renotify: true,
            requireInteraction: true
        });
    }
}

// Fetch event: cache-first with network fallback (retains permanent cache for identical versions)
self.addEventListener('fetch', (e) => {
    e.respondWith(
        caches.match(e.request).then((cachedResponse) => {
            return cachedResponse || fetch(e.request).then((networkResponse) => {
                if (networkResponse.status === 200) {
                    const responseClone = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(e.request, responseClone);
                    });
                }
                return networkResponse;
            });
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
