# 📱 Add PWA support for offline usage

**Labels:** `enhancement`, `low-priority`

## Problem
Application requires internet connection to function. No offline capabilities.

## Impact
- Unusable without internet
- Not installable as app
- No offline caching

## Proposed Solution
Add PWA support with Vite PWA plugin:

```bash
npm install -D vite-plugin-pwa
```

```typescript
// vite.config.ts
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'EDHREC Compare',
        short_name: 'EDHREC',
        description: 'Compare MTG Commander collections with EDHREC',
        theme_color: '#10b981',
        icons: [
          // Add icons
        ]
      },
      workbox: {
        // Cache API responses
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.scryfall\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'scryfall-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 7 // 1 week
              }
            }
          }
        ]
      }
    })
  ]
});
```

## Success Criteria
- App installable on mobile/desktop
- Works offline for cached data
- Service worker registered
- Manifest.json present
