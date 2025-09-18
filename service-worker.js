// Service Worker for AI Prompt Manager Offline Functionality

const CACHE_NAME = 'ai-prompt-manager-v2.0';
const CACHE_VERSION = '2.0.0';

// Files to cache for offline use
const FILES_TO_CACHE = [
    '/',
    '/index.html',
    '/styles.css',
    '/script.js',
    '/github-integration.js',
    '/octokit-client.js',
    '/service-worker.js',
    // Add any other static assets here
];

// Network-first resources (try network, fallback to cache)
const NETWORK_FIRST_RESOURCES = [
    // No API endpoints for this static application
];

// Cache-first resources (serve from cache, update in background)
const CACHE_FIRST_RESOURCES = [
    '/styles.css',
    '/script.js',
    '/github-integration.js',
];

// Install event - cache core files
self.addEventListener('install', (event) => {
    console.log('[ServiceWorker] Install event');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[ServiceWorker] Pre-caching offline page');
                return cache.addAll(FILES_TO_CACHE);
            })
            .then(() => {
                console.log('[ServiceWorker] Pre-caching complete');
                // Force the waiting service worker to become the active service worker
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('[ServiceWorker] Pre-caching failed:', error);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('[ServiceWorker] Activate event');
    
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((cacheName) => {
                        // Delete old caches
                        return cacheName !== CACHE_NAME;
                    })
                    .map((cacheName) => {
                        console.log('[ServiceWorker] Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    })
            );
        }).then(() => {
            console.log('[ServiceWorker] Claiming clients');
            return self.clients.claim();
        })
    );
});

// Fetch event - serve cached content when offline
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);
    
    // Skip cross-origin requests
    if (url.origin !== location.origin) {
        return;
    }
    
    // Handle different caching strategies based on resource type
    if (shouldUseNetworkFirst(request.url)) {
        event.respondWith(networkFirstStrategy(request));
    } else if (shouldUseCacheFirst(request.url)) {
        event.respondWith(cacheFirstStrategy(request));
    } else {
        event.respondWith(cacheFirstFallbackToNetwork(request));
    }
});

// Network-first strategy: try network, fallback to cache
async function networkFirstStrategy(request) {
    try {
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok) {
            // Update cache with fresh content
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, networkResponse.clone());
            return networkResponse;
        }
        
        throw new Error('Network response not ok');
    } catch (error) {
        console.log('[ServiceWorker] Network failed, serving from cache:', request.url);
        const cachedResponse = await caches.match(request);
        
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // Return offline fallback for navigation requests
        if (request.mode === 'navigate') {
            return caches.match('/index.html');
        }
        
        throw error;
    }
}

// Cache-first strategy: serve from cache, update in background
async function cacheFirstStrategy(request) {
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
        // Update cache in background
        updateCacheInBackground(request);
        return cachedResponse;
    }
    
    // If not in cache, fetch and cache
    try {
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, networkResponse.clone());
            return networkResponse;
        }
        
        throw new Error('Network response not ok');
    } catch (error) {
        console.error('[ServiceWorker] Cache-first strategy failed:', error);
        throw error;
    }
}

// Cache-first with network fallback
async function cacheFirstFallbackToNetwork(request) {
    try {
        const cachedResponse = await caches.match(request);
        
        if (cachedResponse) {
            return cachedResponse;
        }
        
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok && request.method === 'GET') {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        console.error('[ServiceWorker] Request failed:', request.url, error);
        
        // For navigation requests, return the cached main page
        if (request.mode === 'navigate') {
            return caches.match('/index.html');
        }
        
        throw error;
    }
}

// Update cache in background
async function updateCacheInBackground(request) {
    try {
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok) {
            const cache = await caches.open(CACHE_NAME);
            await cache.put(request, networkResponse);
            console.log('[ServiceWorker] Background cache update completed for:', request.url);
        }
    } catch (error) {
        console.log('[ServiceWorker] Background cache update failed:', error);
    }
}

// Helper functions to determine caching strategy
function shouldUseNetworkFirst(url) {
    return NETWORK_FIRST_RESOURCES.some(resource => url.includes(resource));
}

function shouldUseCacheFirst(url) {
    return CACHE_FIRST_RESOURCES.some(resource => url.includes(resource));
}

// Handle messages from the main thread
self.addEventListener('message', (event) => {
    const { data } = event;
    
    switch (data.type) {
        case 'SKIP_WAITING':
            console.log('[ServiceWorker] Received SKIP_WAITING message');
            self.skipWaiting();
            break;
            
        case 'CACHE_PROMPT_DATA':
            cachePromptData(data.payload);
            break;
            
        case 'GET_CACHED_DATA':
            getCachedData().then(cachedData => {
                event.ports[0].postMessage({
                    type: 'CACHED_DATA_RESPONSE',
                    data: cachedData
                });
            });
            break;
            
        case 'CLEAR_CACHE':
            clearAllCaches().then(() => {
                event.ports[0].postMessage({
                    type: 'CACHE_CLEARED'
                });
            });
            break;
            
        default:
            console.log('[ServiceWorker] Unknown message type:', data.type);
    }
});

// Cache prompt data for offline access
async function cachePromptData(data) {
    try {
        const cache = await caches.open(CACHE_NAME);
        const response = new Response(JSON.stringify(data), {
            headers: { 'Content-Type': 'application/json' }
        });
        await cache.put('/offline-data/prompts.json', response);
        console.log('[ServiceWorker] Prompt data cached for offline use');
    } catch (error) {
        console.error('[ServiceWorker] Failed to cache prompt data:', error);
    }
}

// Get cached data
async function getCachedData() {
    try {
        const cache = await caches.open(CACHE_NAME);
        const response = await cache.match('/offline-data/prompts.json');
        
        if (response) {
            return await response.json();
        }
        
        return null;
    } catch (error) {
        console.error('[ServiceWorker] Failed to get cached data:', error);
        return null;
    }
}

// Clear all caches
async function clearAllCaches() {
    try {
        const cacheNames = await caches.keys();
        await Promise.all(
            cacheNames.map(cacheName => caches.delete(cacheName))
        );
        console.log('[ServiceWorker] All caches cleared');
    } catch (error) {
        console.error('[ServiceWorker] Failed to clear caches:', error);
    }
}

// Periodic sync for background updates (if supported)
self.addEventListener('sync', (event) => {
    console.log('[ServiceWorker] Sync event:', event.tag);
    
    switch (event.tag) {
        case 'background-sync':
            event.waitUntil(performBackgroundSync());
            break;
            
        case 'github-backup-sync':
            event.waitUntil(performGitHubBackupSync());
            break;
    }
});

// Perform background sync
async function performBackgroundSync() {
    try {
        // Update cached resources
        const cache = await caches.open(CACHE_NAME);
        
        for (const file of FILES_TO_CACHE) {
            try {
                const response = await fetch(file);
                if (response.ok) {
                    await cache.put(file, response);
                }
            } catch (error) {
                console.log('[ServiceWorker] Failed to update cached file:', file, error);
            }
        }
        
        console.log('[ServiceWorker] Background sync completed');
    } catch (error) {
        console.error('[ServiceWorker] Background sync failed:', error);
    }
}

// Perform GitHub backup sync (if configured)
async function performGitHubBackupSync() {
    try {
        // This would integrate with the GitHub backup system
        // For now, just log that sync was requested
        console.log('[ServiceWorker] GitHub backup sync requested');
        
        // Send message to main thread to perform backup
        const clients = await self.clients.matchAll();
        clients.forEach(client => {
            client.postMessage({
                type: 'PERFORM_GITHUB_BACKUP',
                background: true
            });
        });
        
    } catch (error) {
        console.error('[ServiceWorker] GitHub backup sync failed:', error);
    }
}

// Push notification handler (for future use)
self.addEventListener('push', (event) => {
    console.log('[ServiceWorker] Push received:', event);
    
    const options = {
        body: 'You have new updates available!',
        icon: '/icon-192x192.png',
        badge: '/badge-72x72.png',
        tag: 'ai-prompt-manager-update',
        requireInteraction: true,
        actions: [
            {
                action: 'view',
                title: 'View Updates'
            },
            {
                action: 'dismiss',
                title: 'Dismiss'
            }
        ]
    };
    
    event.waitUntil(
        self.registration.showNotification('AI Prompt Manager', options)
    );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
    console.log('[ServiceWorker] Notification click received:', event);
    
    event.notification.close();
    
    if (event.action === 'view') {
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

console.log('[ServiceWorker] Service Worker script loaded successfully');