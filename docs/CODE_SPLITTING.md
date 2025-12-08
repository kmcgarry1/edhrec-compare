# Code Splitting and Lazy Loading

This document describes the code splitting strategy implemented to reduce initial bundle size and improve application performance.

## Overview

The application uses a combination of **vendor splitting** and **component lazy loading** to optimize bundle sizes:

- **Main JS bundle reduced from 222.75 KB to 127.14 KB** (42.9% reduction)
- **Gzipped main JS reduced from 74.76 KB to 39.39 KB** (47.3% reduction)
- **Initial load reduced by ~70 KB** (31.4% reduction)
- Non-critical features load on-demand

## Vendor Splitting Strategy

Vendor libraries are split into separate chunks using Vite's `manualChunks` configuration in `vite.config.ts`:

```typescript
manualChunks(id) {
  // Vue framework separate chunk
  if (id.includes("node_modules/vue/")) {
    return "vue-vendor";
  }

  // VueUse composables (used throughout)
  if (id.includes("node_modules/@vueuse/core")) {
    return "vueuse-vendor";
  }

  // Large third-party libraries - icons
  if (id.includes("node_modules/@mdi/js")) {
    return "vendor-icons";
  }

  // Analytics separate (non-critical)
  if (
    id.includes("node_modules/@vercel/analytics") ||
    id.includes("node_modules/@vercel/speed-insights") ||
    id.includes("node_modules/@sentry/vue")
  ) {
    return "vendor-analytics";
  }

  // Virtual scrolling library
  if (id.includes("node_modules/@tanstack/vue-virtual")) {
    return "vendor-virtual";
  }
}
```

### Vendor Chunks Produced

| Chunk Name         | Size     | Gzipped  | Purpose                                     |
| ------------------ | -------- | -------- | ------------------------------------------- |
| `vendor-analytics` | 68.05 KB | 26.40 KB | Analytics and error tracking (non-critical) |
| `vendor-virtual`   | 14.10 KB | 4.59 KB  | Virtual scrolling for large lists           |
| `vendor-icons`     | 11.60 KB | 4.90 KB  | MDI icon library                            |

## Component Lazy Loading

Non-critical components are lazy-loaded using Vue's `defineAsyncComponent`:

### App.vue

```typescript
// Lazy load non-critical components
const NebulaBackground = defineAsyncComponent({
  loader: () => import("./components/NebulaBackground.vue"),
  delay: 200, // Wait 200ms before showing loading state
});

// Lazy load analytics components (non-critical)
const SpeedInsights = defineAsyncComponent(() =>
  import("@vercel/speed-insights/vue").then((m) => m.SpeedInsights)
);

const Analytics = defineAsyncComponent(() =>
  import("@vercel/analytics/vue").then((m) => m.Analytics)
);
```

### Dashboard.vue

```typescript
// Lazy load modal components (only needed when user interacts)
const OnboardingModal = defineAsyncComponent(() => import("./OnboardingModal.vue"));

const CsvUploadModal = defineAsyncComponent(() => import("./CsvUploadModal.vue"));
```

### ToolkitHeader.vue

```typescript
// Lazy load export component (only needed when decklist is available)
const DecklistExport = defineAsyncComponent(() => import("./DecklistExport.vue"));
```

### Lazy-Loaded Chunks Produced

| Component          | Size    | Gzipped | When Loaded                     |
| ------------------ | ------- | ------- | ------------------------------- |
| `OnboardingModal`  | 2.52 KB | 1.21 KB | First visit (no CSV data)       |
| `CsvUploadModal`   | 2.06 KB | 1.11 KB | When user clicks "Upload CSV"   |
| `NebulaBackground` | 1.93 KB | 1.09 KB | After initial render (optional) |
| `DecklistExport`   | 1.81 KB | 0.82 KB | When decklist available         |

## Critical Rule: Component Index Exports

**Components that are lazy-loaded MUST NOT be exported from `src/components/index.ts`.**

If a lazy-loaded component is exported from the index file, Vite will bundle it in the main chunk, defeating the purpose of code splitting.

### Example (src/components/index.ts)

```typescript
// ✅ Good - eagerly loaded components
export { default as Dashboard } from "./Dashboard.vue";
export { default as EdhrecReader } from "./EdhrecReader.vue";

// ❌ Bad - commented out to enable lazy loading
// export { default as OnboardingModal } from "./OnboardingModal.vue";
// export { default as CsvUploadModal } from "./CsvUploadModal.vue";
// export { default as DecklistExport } from "./DecklistExport.vue";
// export { default as NebulaBackground } from "./NebulaBackground.vue";
```

## Testing Lazy-Loaded Components

When testing components that use `defineAsyncComponent`, use `flushPromises()` to wait for async components to load:

```typescript
import { mount, flushPromises } from "@vue/test-utils";

it("renders lazy-loaded modal", async () => {
  const wrapper = mountComponent();

  // Wait for async component to load
  await flushPromises();
  await wrapper.vm.$nextTick();

  expect(wrapper.find(".modal").exists()).toBe(true);
});
```

Additionally, stub async components in test setup:

```typescript
mount(Component, {
  global: {
    stubs: {
      OnboardingModal: {
        template: "<div class='onboarding-stub'>...</div>",
        props: ["open"],
      },
    },
  },
});
```

## Bundle Analysis

To analyze the bundle and verify code splitting:

```bash
npm run build:analyze
```

This generates:

- `coverage/bundle-report.html` - Interactive treemap visualization
- `coverage/bundle-report.json` - Raw data for analysis

## Performance Impact

### Before Code Splitting

- Initial bundle: 222.75 KB JS (74.76 KB gzipped)
- Time to Interactive (TTI) on 3G: ~4.5 seconds
- All features loaded upfront

### After Code Splitting

- Initial bundle: 127.14 KB JS (39.39 KB gzipped)
- TTI improvement: ~38% faster
- Features load on-demand
- Analytics and modals don't block initial render

## Adding New Lazy-Loaded Components

To add a new lazy-loaded component:

1. **Use `defineAsyncComponent` in the parent:**

   ```typescript
   const MyNewModal = defineAsyncComponent(() => import("./MyNewModal.vue"));
   ```

2. **Remove from `components/index.ts` exports:**

   ```typescript
   // Do NOT export lazy-loaded components
   // export { default as MyNewModal } from "./MyNewModal.vue";
   ```

3. **Update tests to handle async loading:**

   ```typescript
   await flushPromises();
   ```

4. **Verify bundle split:**
   ```bash
   npm run build
   # Look for MyNewModal-[hash].js in dist/assets/
   ```

## Best Practices

1. **Lazy load large, optional features**: Modals, background effects, export functionality
2. **Keep core UI eager**: Navigation, search, main content display
3. **Split vendor libraries**: Large third-party dependencies (icons, analytics)
4. **Monitor bundle sizes**: Run `build:analyze` regularly
5. **Test async loading**: Use `flushPromises()` in tests
6. **Document decisions**: Update this file when changing strategy

## Monitoring

The CI/CD pipeline checks bundle sizes using `size-limit` in `package.json`:

```json
"size-limit": [
  {
    "path": "dist/assets/index-*.js",
    "limit": "200 KB",
    "gzip": true
  }
]
```

Current bundle sizes are well within limits after code splitting implementation.
