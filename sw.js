/* sw.js */
const CACHE_NAME = 'moon-blog-cache-v1.0.7'; // Increment this version on each deploy to trigger notifications!
const UPDATE_MESSAGE = "신비로운 푸른 젤성 대장 개미 일기(10화) 추가 및 뚜기x달이x개미의 포복절도 연합 운동회 대개막! 🐜🐌🟢🏆";
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
            body: UPDATE_MESSAGE,
            icon: "./assets/images/logo_supermoon.png",
            badge: "./assets/images/logo_supermoon.png",
            tag: "version-update",
            renotify: true,
            requireInteraction: true
        });
    }
}

// Fetch event: hybrid strategy (Network-First for code, Cache-First for static media assets)
self.addEventListener('fetch', (e) => {
    const url = new URL(e.request.url);
    
    // Cache-First strategy for heavy static media files (audio tracks and images)
    if (url.pathname.includes('/assets/audio/') || url.pathname.includes('/assets/images/')) {
        e.respondWith(
            caches.match(e.request).then((cachedResponse) => {
                if (cachedResponse) {
                    return cachedResponse;
                }
                return fetch(e.request).then((networkResponse) => {
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
    } else {
        // Network-First strategy for critical code (HTML, JS, CSS, Manifest) to guarantee instant updates on reload
        e.respondWith(
            fetch(e.request)
                .then((networkResponse) => {
                    // Update cache with the fresh resource on success
                    if (networkResponse.status === 200) {
                        const responseClone = networkResponse.clone();
                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(e.request, responseClone);
                        });
                    }
                    return networkResponse;
                })
                .catch(() => {
                    // Fallback to cache ONLY when completely offline
                    return caches.match(e.request);
                })
        );
    }
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
