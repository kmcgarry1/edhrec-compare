# Add Progressive Web App (PWA) and Offline Support

**Priority:** Medium  
**Type:** Feature Enhancement  
**Component:** Build Configuration, Service Worker  
**Effort:** Medium (2-3 days)

## Problem

The application currently requires an internet connection for all functionality and cannot be installed as a PWA:

### Current Issues

- No offline functionality whatsoever
- Cannot be installed as standalone app
- No service worker for caching
- Poor experience on unreliable connections
- Wasted bandwidth re-downloading static assets
- No "Add to Home Screen" capability

### User Impact

- **Medium:** Complete app failure without internet
- Cannot work during commute or in areas with poor connectivity
- Re-downloads 275 KB on every page load (no caching)
- Mobile users consume more data than necessary
- Desktop users can't install as standalone app

## Proposed Solution

### Progressive Web App Implementation

Transform the application into a full PWA with offline support:

1. **App Manifest** (`manifest.json`)
   - Configure app name, icons, colors
   - Enable "Add to Home Screen"
   - Define display mode (standalone)

2. **Service Worker**
   - Cache static assets (JS, CSS, fonts)
   - Cache Scryfall card images (with size limits)
   - Network-first strategy for API calls
   - Cache-first strategy for static resources

3. **Offline Fallback**
   - Show cached commanders when offline
   - Display "Offline Mode" indicator
   - Queue API requests for when connection returns

4. **Background Sync** (Future enhancement)
   - Sync queued actions when online
   - Update cached data in background

### Service Worker Strategy

```typescript
// public/service-worker.js
const CACHE_NAME = "commander-scout-v1";
const STATIC_CACHE = [
  "/",
  "/index.html",
  "/assets/index.js",
  "/assets/index.css",
  "/assets/inventory.csv",
];

const IMAGE_CACHE = "scryfall-images-v1";
const MAX_IMAGE_CACHE_SIZE = 50 * 1024 * 1024; // 50 MB

// Install: Cache static assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_CACHE);
    })
  );
  self.skipWaiting();
});

// Fetch: Network-first for API, cache-first for assets
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // API requests: Network-first (fresh data preferred)
  if (url.hostname.includes("scryfall.com") || url.hostname.includes("edhrec.com")) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful API responses
          if (response.ok) {
            const clonedResponse = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, clonedResponse);
            });
          }
          return response;
        })
        .catch(() => {
          // Fallback to cache if offline
          return caches.match(request);
        })
    );
    return;
  }

  // Static assets: Cache-first (performance)
  event.respondWith(
    caches.match(request).then((cached) => {
      return (
        cached ||
        fetch(request).then((response) => {
          // Cache new static assets
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, response.clone());
            return response;
          });
        })
      );
    })
  );
});

// Activate: Clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME && key !== IMAGE_CACHE)
          .map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});
```

### App Manifest

```json
// public/manifest.json
{
  "name": "Commander Scout",
  "short_name": "Commander Scout",
  "description": "Compare EDHREC commander data with your personal MTG card inventory",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0f172a",
  "theme_color": "#10b981",
  "orientation": "any",
  "icons": [
    {
      "src": "/icons/icon-72x72.png",
      "sizes": "72x72",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-96x96.png",
      "sizes": "96x96",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-128x128.png",
      "sizes": "128x128",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-144x144.png",
      "sizes": "144x144",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-152x152.png",
      "sizes": "152x152",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-384x384.png",
      "sizes": "384x384",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ]
}
```

### Offline Indicator Component

```vue
<!-- src/components/OfflineIndicator.vue -->
<template>
  <Transition name="slide-down">
    <div v-if="!isOnline" class="offline-banner" role="alert" aria-live="polite">
      <svg class="icon" viewBox="0 0 24 24">
        <path
          d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
        />
      </svg>
      <span>Offline Mode - Showing cached data</span>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";

const isOnline = ref(navigator.onLine);

onMounted(() => {
  window.addEventListener("online", () => {
    isOnline.value = true;
  });

  window.addEventListener("offline", () => {
    isOnline.value = false;
  });
});
</script>

<style scoped>
.offline-banner {
  @apply fixed top-0 inset-x-0 z-50 flex items-center justify-center gap-2;
  @apply bg-amber-500 text-white py-2 px-4 text-sm font-medium;
}

.slide-down-enter-active,
.slide-down-leave-active {
  transition: transform 0.3s ease;
}

.slide-down-enter-from {
  transform: translateY(-100%);
}

.slide-down-leave-to {
  transform: translateY(-100%);
}
</style>
```

### Service Worker Registration

```typescript
// src/main.ts
import { registerSW } from "virtual:pwa-register";

const updateSW = registerSW({
  onNeedRefresh() {
    // Show update notification
    const { notifyInfo } = useGlobalNotices();
    notifyInfo("New version available! Click to update.", "App Update", {
      action: () => updateSW(true),
      actionLabel: "Update",
    });
  },
  onOfflineReady() {
    console.log("App ready for offline use");
  },
});
```

## Technical Considerations

### Files to Create

- `public/manifest.json` - PWA manifest
- `public/service-worker.js` - Service worker (if not using plugin)
- `public/icons/` - App icons (various sizes)
- `src/components/OfflineIndicator.vue` - Offline mode UI
- `src/composables/useOnlineStatus.ts` - Online/offline detection

### Files to Modify

- `index.html` - Add manifest link and theme color
- `vite.config.ts` - Add PWA plugin configuration
- `src/main.ts` - Register service worker
- `src/App.vue` - Add OfflineIndicator component
- `package.json` - Add vite-plugin-pwa dependency

### Vite PWA Plugin Configuration

```typescript
// vite.config.ts
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "icons/*.png"],
      manifest: {
        name: "Commander Scout",
        short_name: "Commander Scout",
        description: "Compare EDHREC commander data with your card inventory",
        theme_color: "#10b981",
        background_color: "#0f172a",
        display: "standalone",
        icons: [
          // ... icon definitions
        ],
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.scryfall\.com\/.*/i,
            handler: "NetworkFirst",
            options: {
              cacheName: "scryfall-api-cache",
              expiration: {
                maxEntries: 500,
                maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /^https:\/\/cards\.scryfall\.io\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "scryfall-images-cache",
              expiration: {
                maxEntries: 300,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
            },
          },
        ],
      },
    }),
  ],
});
```

## Implementation Plan

### Phase 1: Basic PWA (Day 1)

1. Install vite-plugin-pwa
2. Create manifest.json
3. Generate app icons (use PWA Asset Generator)
4. Configure Vite plugin
5. Test installation on mobile

### Phase 2: Service Worker (Day 2)

1. Configure caching strategies
2. Implement offline fallback
3. Add cache size limits
4. Test offline functionality

### Phase 3: Offline UI (Day 3)

1. Create OfflineIndicator component
2. Add online/offline detection composable
3. Update API error messages for offline
4. Test user experience

## Acceptance Criteria

- [ ] App can be installed from browser
- [ ] App works offline with cached data
- [ ] Offline indicator shows when disconnected
- [ ] Static assets cached after first load
- [ ] Scryfall images cached (up to 50 MB)
- [ ] Update notification shown when new version available
- [ ] Lighthouse PWA score > 90
- [ ] Works on iOS Safari, Chrome, Firefox

## PWA Checklist

- [ ] HTTPS enabled (required for service worker)
- [ ] manifest.json with all required fields
- [ ] Service worker registered
- [ ] Icons provided (192x192, 512x512 minimum)
- [ ] Offline fallback page
- [ ] Theme color matches design
- [ ] Start URL configured
- [ ] Display mode set to standalone
- [ ] Apple Touch Icons for iOS

## Testing Strategy

### Manual Testing

```bash
# Test PWA installation
1. Open app in Chrome/Edge
2. Look for install icon in address bar
3. Click "Install Commander Scout"
4. Verify standalone app opens
5. Test offline: Disable network, reload app
6. Verify cached data shows
7. Re-enable network, verify updates
```

### Automated Testing

```typescript
// tests/e2e/pwa.spec.ts
test("app works offline", async ({ page, context }) => {
  // Load app while online
  await page.goto("/");
  await page.waitForLoadState("networkidle");

  // Go offline
  await context.setOffline(true);

  // Reload page
  await page.reload();

  // Verify app still loads (from cache)
  await expect(page.locator("h1")).toContain("Commander Scout");

  // Verify offline indicator
  await expect(page.locator(".offline-banner")).toBeVisible();
});
```

### Lighthouse Testing

```bash
# Run Lighthouse PWA audit
npm install -g @lhci/cli
lhci autorun --upload.target=temporary-public-storage

# PWA criteria:
# - Installable: Yes
# - Service Worker: Registered
# - Offline: Works
# - HTTPS: Enabled
# - Manifest: Valid
```

## Related Issues

- #01 - IndexedDB caching (complements offline support)
- Performance optimization overall
- Mobile user experience

## References

- [PWA Checklist - web.dev](https://web.dev/pwa-checklist/)
- [Vite Plugin PWA](https://vite-pwa-org.netlify.app/)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Workbox - Google](https://developers.google.com/web/tools/workbox)
- [PWA Asset Generator](https://github.com/onderceylan/pwa-asset-generator)
