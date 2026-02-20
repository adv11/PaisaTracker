/* =========================================================
   PaisaTracker — Service Worker v4
   Cache-First + Network Fallback strategy
   ========================================================= */

const CACHE_NAME = 'paisatracker-v4';
const OFFLINE_URL = './offline.html';

// App shell — all actual files that exist in the project
const SHELL_ASSETS = [
    './',
    './index.html',
    './offline.html',
    './manifest.json',
    // CSS
    './css/variables.css',
    './css/base.css',
    './css/animations.css',
    './css/components.css',
    './css/screens.css',
    // Core JS
    './js/db.js',
    './js/utils.js',
    './js/validate.js',
    './js/state.js',
    './js/toast.js',
    './js/modal.js',
    './js/router.js',
    './js/charts.js',
    './js/pwa.js',
    './js/notifications.js',
    './js/security.js',
    './js/auth.js',
    // Screens
    './js/screens/splash.js',
    './js/screens/profile-setup.js',
    './js/screens/lock.js',
    './js/screens/main.js',
    // Tabs
    './js/tabs/transactions.js',
    './js/tabs/dashboard.js',
    './js/tabs/accounts.js',
    './js/tabs/goals.js',
    './js/tabs/reports.js',
    './js/tabs/profile.js',
    // Sheets
    './js/sheets/add-transaction.js',
    './js/sheets/udhaar-share.js',
    './js/sheets/category-manager.js',
    // Icons
    './icons/icon-192.png',
    './icons/icon-512.png',
];

// External assets — cached opportunistically
const EXTERNAL_ASSETS = [
    'https://fonts.googleapis.com/css2?family=Sora:wght@300;400;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap',
    'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js',
];

// ── Install ──────────────────────────────────────────────
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(async (cache) => {
            // Cache local assets — fail gracefully on individual misses
            await Promise.allSettled(
                SHELL_ASSETS.map((url) =>
                    cache.add(url).catch((err) =>
                        console.warn('[SW] Could not cache:', url, err)
                    )
                )
            );
            // Cache external assets opportunistically
            await Promise.allSettled(
                EXTERNAL_ASSETS.map((url) =>
                    cache.add(url).catch(() => {/* offline — skip silently */ })
                )
            );
        }).then(() => self.skipWaiting())
    );
});

// ── Activate — delete old caches ─────────────────────────
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((names) =>
            Promise.all(
                names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n))
            )
        ).then(() => self.clients.claim())
    );
});

// ── Fetch ────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
    const { request } = event;

    // Skip non-GET and non-http
    if (request.method !== 'GET') return;
    if (!request.url.startsWith('http')) return;

    // Navigation: network-first, fall back to app shell, then offline page
    if (request.mode === 'navigate') {
        event.respondWith(
            fetch(request)
                .then((response) => {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then((c) => c.put(request, clone));
                    return response;
                })
                .catch(() =>
                    caches.match('./index.html')
                        .then((hit) => hit || caches.match(OFFLINE_URL))
                )
        );
        return;
    }

    // External fonts & Chart.js: stale-while-revalidate
    if (
        request.url.includes('fonts.googleapis.com') ||
        request.url.includes('fonts.gstatic.com') ||
        request.url.includes('cloudflare.com')
    ) {
        event.respondWith(
            caches.match(request).then((cached) => {
                const live = fetch(request).then((response) => {
                    if (response.ok) {
                        caches.open(CACHE_NAME)
                            .then((c) => c.put(request, response.clone()));
                    }
                    return response;
                }).catch(() => cached);
                return cached || live;
            })
        );
        return;
    }

    // All other local assets: cache-first, network fallback
    event.respondWith(
        caches.match(request).then((cached) => {
            if (cached) return cached;
            return fetch(request).then((response) => {
                if (response.ok) {
                    caches.open(CACHE_NAME)
                        .then((c) => c.put(request, response.clone()));
                }
                return response;
            }).catch(() => {
                if (request.headers.get('accept')?.includes('text/html')) {
                    return caches.match(OFFLINE_URL);
                }
                return new Response('', { status: 408, statusText: 'Offline' });
            });
        })
    );
});

// ── Messages from the app ─────────────────────────────────
self.addEventListener('message', (event) => {
    if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
});
