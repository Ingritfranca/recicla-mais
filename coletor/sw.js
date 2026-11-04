/**
 * Service Worker — Recicla+ Coletor PWA
 * Garante funcionamento 100% offline para o coletor
 */

const CACHE_NAME = 'recicla-coletor-v1';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './manifest.json',
    '../shared/db.js',
    'https://unpkg.com/vue@3/dist/vue.global.js',
    'https://unpkg.com/dexie@4/dist/dexie.js',
    'https://unpkg.com/html5-qrcode@2.3.8/html5-qrcode.min.js',
    'https://unpkg.com/@tailwindcss/browser@4',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css',
    'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[SW] Fazendo pré-cache dos assets do Coletor...');
            return cache.addAll(ASSETS_TO_CACHE).catch(err => {
                console.warn('[SW] Alguns recursos remotos podem falhar no pre-cache, continuando...', err);
            });
        }).then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.map((key) => {
                    if (key !== CACHE_NAME) {
                        console.log('[SW] Removendo cache antigo:', key);
                        return caches.delete(key);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (event) => {
    // Para solicitações de rede, tenta cache primeiro, se não tiver, busca na rede e atualiza cache
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
                return cachedResponse;
            }
            return fetch(event.request).then((networkResponse) => {
                // Não faz cache de extensões do Chrome ou esquemas não-http(s)
                if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                    return networkResponse;
                }
                const responseToCache = networkResponse.clone();
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, responseToCache);
                });
                return networkResponse;
            }).catch(() => {
                // Se offline e requisição falhou, tenta retornar index.html para navegações
                if (event.request.mode === 'navigate') {
                    return caches.match('./index.html');
                }
            });
        })
    );
});
