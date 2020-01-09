const filesToCache = [
    '/',
    'main.js',
    'index.html',
    'style.css',
    'manifest.json',
    'images/android-chrome-192x192.png',
    'images/apple-touch-icon.png',
    'images/favicon-16x16.png',
    'images/favicon-32x32.png',
    'images/favicon.ico',
    'images/mstile-150x150.png',
    'images/safari-pinned-tab.svg',
    'browserconfig.xml'
];

const staticCacheName = 'pages-cache-v1';

self.addEventListener('install', event => {
    console.log('Attempting to install service worker and cache static assets');
    event.waitUntil(
        caches.open(staticCacheName)
            .then(cache => {
                return cache.addAll(filesToCache);
            })
    );
});

self.addEventListener('fetch', event => {
    console.log('Fetch event for ', event.request.url);
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    console.log('Found ', event.request.url, ' in cache');
                    return response;
                }
                console.log('Network request for ', event.request.url);
                return fetch(event.request)

                    //  - Add fetched files to the cache
                    .then(response => {
                        // - Respond with custom 404 page
                        return caches.open(staticCacheName).then(cache => {
                            cache.put(event.request.url, response.clone());
                            return response;
                        });
                    });

            }).catch(error => {

                // - Respond with custom offline page

            })
    );
});

self.addEventListener('activate', event => {
    console.log('Activating new service worker...');

    const cacheWhitelist = [staticCacheName];

    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
