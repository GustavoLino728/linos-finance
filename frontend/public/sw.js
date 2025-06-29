const CACHE_NAME = "finance-app-v1"
const urlsToCache = ["/", "/login", "/register", "/manifest.json", "/offline.html"]

// Install event - cache resources
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache)
    }),
  )
})

// Fetch event - serve from cache when offline
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches
      .match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request)
      })
      .catch(() => {
        // If both cache and network fail, show offline page
        if (event.request.destination === "document") {
          return caches.match("/offline.html")
        }
      }),
  )
})

// Background sync for offline transactions
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-transactions") {
    event.waitUntil(syncTransactions())
  }
})

async function syncTransactions() {
  // This will be handled by the main app
  const clients = await self.clients.matchAll()
  clients.forEach((client) => {
    client.postMessage({ type: "SYNC_TRANSACTIONS" })
  })
}
