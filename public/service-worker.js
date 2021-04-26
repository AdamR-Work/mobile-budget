// Globals
const DATA_CACHE_NAME = "data-bank-v1"
const FILES_TO_CACHE = [
    "/",
    "./index.html",
    "./css/styles.css",
    "./manifest.json",
    "./service-worker.js",
    "./js/idb.js",
    "./js/index.js",
    './icons/icon-72x72.png',
    './icons/icon-96x96.png',
    './icons/icon-128x128.png',
    './icons/icon-144x144.png',
    './icons/icon-152x152.png',
    './icons/icon-192x192.png',
    './icons/icon-384x384.png',
    './icons/icon-512x512.png',

]

const APP_PREFIX = 'mobile-budget  ';
const VERSION = 'v_01';
const CACHE_NAME = APP_PREFIX + VERSION;

// Installs the service worker
self.addEventListener('install', function(e){
    e.waitUntil(caches.open(CACHE_NAME)
        .then(cache=>{
            console.log('Install and loaded ' + CACHE_NAME);
            return cache.addAll(FILES_TO_CACHE);
        }));
    self.skipWaiting()
})

// checks to make sure Service worker is the same one and than starts it.
self.addEventListener('activate', function (e) {
    e.waitUntil(caches.keys()
            .then(keyList => {
                return Promise.all(keyList.map(key => {
                        if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
                            console.log('Replacing '+ key +" with a new service worker");
                            return caches.delete(key);
                    }}));
            })
    );
    self.clients.claim();
});

// puts the data stored offline 
self.addEventListener('fetch', function (e) {
    if (e.request.url.includes('/api/')) {
        e.respondWith(caches.open(DATA_CACHE_NAME)
                .then(cache => {
                    return fetch(e.request)
                        .then(response => {
                            if (response.status === 200) {
                                cache.put(e.request.url, response.clone());
                            }
                            return response;
                        })})
                .catch(err => {
                 console.log(err)
                }));
        return;
    } e.respondWith(
        fetch(e.request)
            .catch(err => {
                return caches.match(e.request)
                    .then(response=> {
                        if (response)
                            return response;
                        else {
                            return e.request;
                        }
                    });
            }))
});

