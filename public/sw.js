const CACHE_NAME = 'app-motorista-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
];

// Instalação do service worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting();
});

// Ativação do service worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Estratégia: Network first, fallback to cache
self.addEventListener('fetch', (event) => {
  // Ignora requisições não-GET
  if (event.request.method !== 'GET') {
    return;
  }

  // Ignora requisições para APIs
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Clona a resposta
          const responseClone = response.clone();
          
          // Salva em cache
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });

          return response;
        })
        .catch(() => {
          // Se falhar, tenta cache
          return caches.match(event.request);
        })
    );
    return;
  }

  // Para outros recursos, usa cache first
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response;
      }

      return fetch(event.request).then((response) => {
        // Clona a resposta
        const responseClone = response.clone();

        // Salva em cache
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseClone);
        });

        return response;
      });
    })
  );
});

// Background sync para sincronizar dados offline
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-entregas') {
    event.waitUntil(syncEntregas());
  }
});

async function syncEntregas() {
  try {
    // Busca dados pendentes do IndexedDB
    const db = await openDB();
    const syncQueue = await getAllFromStore(db, 'sync_queue');

    // Sincroniza com o servidor
    for (const item of syncQueue) {
      try {
        await fetch('/api/sync', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          },
          body: JSON.stringify(item),
        });

        // Remove do sync queue
        await deleteFromStore(db, 'sync_queue', item.id);
      } catch (error) {
        console.error('Erro ao sincronizar:', error);
      }
    }
  } catch (error) {
    console.error('Erro no background sync:', error);
  }
}

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('app_motorista_db', 1);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

function getAllFromStore(db, storeName) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.getAll();
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

function deleteFromStore(db, storeName, key) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.delete(key);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}
