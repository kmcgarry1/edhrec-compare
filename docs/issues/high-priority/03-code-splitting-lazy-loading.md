# Implement Code Splitting and Lazy Loading

**Priority:** High  
**Type:** Performance Enhancement  
**Component:** Build Configuration, Component Loading  
**Effort:** Medium (2-3 days)

## Problem

The entire application bundle (201 KB JS + 74 KB CSS) loads upfront, even though users don't need all features immediately:

### Current Issues

- Full 275 KB bundle downloads before any interaction
- CSV upload modal loads even if user never uploads CSV
- All components bundled together (no code splitting)
- Slower time-to-interactive (TTI) on slow connections
- Mobile users wait longer for initial load
- Unused features bloat the initial bundle

### User Impact

- **High:** 2-4 second wait on 3G connections before app interactive
- Poor first impression (blank screen while loading)
- Wasted bandwidth for users who don't use all features
- Lower Core Web Vitals scores (LCP, TTI)
- Reduced SEO ranking due to slow page speed

## Proposed Solution

### Code Splitting Strategy

Implement strategic code splitting to reduce initial bundle size by 40-50%:

1. **Route-based Splitting** (Not applicable - no routing)
2. **Component-based Splitting** ✓
3. **Vendor Splitting** ✓
4. **Feature-based Splitting** ✓

### Components to Lazy Load

**High Priority (Large, Optional)**

- `CSVUpload.vue` + `CsvUploadModal.vue` (~15 KB)
- `DecklistExport.vue` (~8 KB)
- `NebulaBackground.vue` (~10 KB, can defer)
- `FloatingCardlistNav.vue` (~8 KB, shows after search)

**Medium Priority**

- Card table components (after virtualization)
- Onboarding modal (first-time users only)

**Low Priority**

- Icon components (can stay in main bundle)
- Core UI components (CButton, CText)

### Implementation Approach

```typescript
// src/components/Dashboard.vue - Lazy load modals
<script setup lang="ts">
import { defineAsyncComponent } from 'vue';

// Eagerly loaded (needed immediately)
import CommanderSearch from './CommanderSearch.vue';
import EdhrecReader from './EdhrecReader.vue';
import ToolkitHeader from './ToolkitHeader.vue';

// Lazy loaded (optional features)
const CsvUploadModal = defineAsyncComponent(
  () => import('./CsvUploadModal.vue')
);

const DecklistExport = defineAsyncComponent(
  () => import('./DecklistExport.vue')
);

const NebulaBackground = defineAsyncComponent({
  loader: () => import('./NebulaBackground.vue'),
  // Show nothing while loading (transparent)
  loadingComponent: () => null,
  delay: 200, // Wait 200ms before showing loading
});

// Only load onboarding for first-time users
const OnboardingModal = defineAsyncComponent({
  loader: () => import('./OnboardingModal.vue'),
  delay: 1000, // Wait 1s before showing
});
</script>
```

### Vendor Splitting Configuration

```typescript
// vite.config.ts - Optimize chunk splitting
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vue framework separate chunk
          "vue-vendor": ["vue"],

          // VueUse composables (used throughout)
          "vueuse-vendor": ["@vueuse/core"],

          // Large third-party libraries
          "vendor-icons": ["@mdi/js"],

          // Analytics separate (non-critical)
          "vendor-analytics": ["@vercel/analytics", "@vercel/speed-insights", "@sentry/vue"],
        },
      },
    },
  },
});
```

### Dynamic Import for Features

```typescript
// src/composables/useCsvUpload.ts
// Defer parsing logic until CSV uploaded
const parseCsvContent = async (content: string) => {
  // Dynamically import CSV validator when needed
  const { validateCsv } = await import("../utils/csvValidator");
  return validateCsv(content);
};
```

### Prefetch Strategy

```typescript
// Prefetch likely-needed chunks
// src/main.ts
if ("requestIdleCallback" in window) {
  requestIdleCallback(() => {
    // Prefetch CSV upload modal after 2s idle
    setTimeout(() => {
      import("./components/CsvUploadModal.vue");
    }, 2000);
  });
}
```

## Technical Considerations

### Files to Modify

- `vite.config.ts` - Add manual chunks configuration
- `src/components/Dashboard.vue` - Lazy load modals
- `src/components/ToolkitHeader.vue` - Defer non-critical features
- `src/main.ts` - Add prefetch logic
- `package.json` - Configure build script

### Bundle Size Targets

**Current Bundle (Production)**

- Main JS: 201 KB (68 KB gzipped)
- Main CSS: 74 KB (12 KB gzipped)
- Total: 275 KB (80 KB gzipped)

**After Code Splitting**

- Main JS: 110-120 KB (40-45 KB gzipped) ✓ 40% reduction
- Vue vendor: 45 KB (15 KB gzipped)
- VueUse vendor: 15 KB (5 KB gzipped)
- Analytics vendor: 20 KB (7 KB gzipped)
- CSV modal chunk: 15 KB (5 KB gzipped)
- Total: ~205 KB (67 KB gzipped)
- **Initial load: 110-120 KB vs 201 KB** ✓ 40% faster

### Loading States

```vue
<!-- Show skeleton while lazy loading -->
<Suspense>
  <template #default>
    <CsvUploadModal />
  </template>
  <template #fallback>
    <SkeletonCard />
  </template>
</Suspense>
```

### Error Handling

```typescript
// Handle chunk loading failures
const CsvUploadModal = defineAsyncComponent({
  loader: () => import("./CsvUploadModal.vue"),
  onError(error, retry, fail) {
    console.error("Failed to load CSV modal:", error);
    // Retry once
    if (retryCount < 1) {
      retryCount++;
      retry();
    } else {
      notifyError("Failed to load component. Please refresh the page.");
      fail();
    }
  },
});
```

## Implementation Plan

### Phase 1: Vendor Splitting (Day 1)

1. Configure manual chunks in vite.config.ts
2. Split Vue, VueUse, MDI icons, analytics
3. Test bundle sizes
4. Ensure all chunks load correctly

### Phase 2: Component Lazy Loading (Day 2)

1. Convert CSV modal to lazy load
2. Convert export modal to lazy load
3. Convert background to lazy load
4. Add loading states (Suspense)
5. Test user flows (upload CSV, export)

### Phase 3: Optimization (Day 3)

1. Add prefetch for frequently used chunks
2. Optimize chunk sizes (combine small chunks)
3. Test on slow 3G connection
4. Measure Core Web Vitals improvements
5. Update bundle analysis

## Acceptance Criteria

- [ ] Initial JS bundle reduced to 110-120 KB (from 201 KB)
- [ ] Time to Interactive (TTI) reduced by 30%+
- [ ] Largest Contentful Paint (LCP) < 2.5s on 3G
- [ ] All lazy-loaded components work correctly
- [ ] No regression in user experience
- [ ] Loading states shown for slow connections
- [ ] Chunk loading errors handled gracefully
- [ ] Bundle analysis shows optimal chunk sizes

## Performance Targets

### Before Code Splitting

- Initial bundle: 201 KB JS + 74 KB CSS = 275 KB
- TTI on 3G: ~4.5 seconds
- LCP: ~3.2 seconds
- Bundle requests: 2 (JS + CSS)

### After Code Splitting

- Initial bundle: 110 KB JS + 74 KB CSS = 184 KB
- TTI on 3G: ~2.8 seconds (38% faster)
- LCP: ~2.3 seconds (28% faster)
- Bundle requests: 4-5 (main + vendors)

## Testing Strategy

### Bundle Size Testing

```bash
# Before changes
npm run build
# Main JS: 201 KB

# After changes
npm run build
# Main JS: 110-120 KB
# Vendor chunks: 45 KB + 15 KB + 20 KB
# Feature chunks: 15 KB (CSV modal)

# Analyze bundle
npm run build:analyze
# Verify no duplicate code between chunks
```

### E2E Testing

```typescript
// Test lazy loading doesn't break functionality
test("CSV upload works with lazy loading", async ({ page }) => {
  await page.goto("/");

  // Click upload button (triggers lazy load)
  await page.click('[data-testid="upload-csv"]');

  // Wait for modal to load
  await page.waitForSelector('[data-testid="csv-modal"]');

  // Upload CSV
  await page.setInputFiles('input[type="file"]', "test.csv");

  // Verify CSV processed
  await expect(page.locator(".csv-success")).toBeVisible();
});
```

### Performance Testing

```typescript
// Measure TTI improvement
import { performance } from "perf_hooks";

test("TTI improved with code splitting", async ({ page }) => {
  const start = performance.now();

  await page.goto("/");
  await page.waitForLoadState("networkidle");

  const tti = performance.now() - start;

  // Should be < 3000ms on simulated 3G
  expect(tti).toBeLessThan(3000);
});
```

## Monitoring & Rollout

### Gradual Rollout

1. **Week 1:** Deploy to staging, test thoroughly
2. **Week 2:** Deploy to 10% of users (feature flag)
3. **Week 3:** Deploy to 50% of users
4. **Week 4:** Deploy to 100% of users

### Monitoring Metrics

```typescript
// Track chunk loading performance
if (import.meta.env.PROD) {
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (entry.entryType === "resource" && entry.name.includes(".js")) {
        analytics.track("chunk_loaded", {
          name: entry.name,
          duration: entry.duration,
          size: entry.transferSize,
        });
      }
    }
  });

  observer.observe({ entryTypes: ["resource"] });
}
```

## Alternative Approaches Considered

1. **HTTP/2 Server Push** - Considered: Complex server setup
2. **Preload directives** - Included: Used for critical chunks
3. **Service Worker precaching** - Future: Consider for PWA
4. **PRPL Pattern** - Considered: Overkill for SPA without routing
5. **Module preload** - Included: For immediate chunks

## Related Issues

- #01 - IndexedDB caching (reduces data fetching)
- #02 - Virtual scrolling (reduces render time)
- Bundle size optimization overall

## References

- [Code Splitting - Vite](https://vitejs.dev/guide/features.html#code-splitting)
- [Manual Chunks - Rollup](https://rollupjs.org/guide/en/#outputmanualchunks)
- [Dynamic Imports - Vue](https://vuejs.org/guide/components/async.html)
- [Web Vitals - Google](https://web.dev/vitals/)
- [Lighthouse Performance Scoring](https://web.dev/performance-scoring/)
