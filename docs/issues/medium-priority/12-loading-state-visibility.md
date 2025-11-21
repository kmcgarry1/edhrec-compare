# Loading State Visibility Enhancement

**Priority:** Medium  
**Type:** UX Enhancement  
**Component:** GlobalLoadingBanner, EdhrecReader, CardTable  
**Effort:** Low (< 1 day)

## Problem

While a global loading banner exists, it may not be prominent enough during long API operations (bulk Scryfall requests, EDHREC data fetching). Users might think the application has frozen, leading to confusion and repeated actions.

### Current Issues

- Loading banner may be subtle or easily overlooked
- No progress indication for multi-step operations
- Bulk Scryfall requests (75 cards per batch) lack progress feedback
- No skeleton screens showing where content will appear
- Users uncertain about wait time or current status

### User Impact

- **Medium:** Users unsure if app is working during data fetch
- May click buttons multiple times
- May refresh browser thinking app is broken
- Poor perceived performance even if actual speed is good
- Increased support inquiries

## Current Implementation

```vue
<!-- GlobalLoadingBanner.vue -->
<div v-if="isLoading" class="loading-banner">
  Loading...
</div>
```

## Proposed Solutions

### 1. Prominent Global Loading Banner

Make loading banner more noticeable:

```vue
<template>
  <Transition name="slide-down">
    <div
      v-if="hasActiveLoaders"
      class="fixed top-0 left-0 right-0 z-50 bg-emerald-600 text-white shadow-lg"
      role="status"
      aria-live="polite"
    >
      <div class="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <!-- Animated spinner -->
          <svg class="animate-spin h-5 w-5" viewBox="0 0 24 24">
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
              fill="none"
            />
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>

          <!-- Loading message -->
          <span class="font-medium">
            {{ loadingMessage }}
          </span>
        </div>

        <!-- Progress indicator -->
        <span v-if="progress" class="text-sm opacity-90">
          {{ progress.current }} / {{ progress.total }}
        </span>
      </div>

      <!-- Progress bar -->
      <div v-if="progress" class="h-1 bg-emerald-700">
        <div
          class="h-full bg-white transition-all duration-300"
          :style="{ width: `${progressPercent}%` }"
        />
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useGlobalLoading } from "@/composables/useGlobalLoading";

const { activeLoaders } = useGlobalLoading();

const hasActiveLoaders = computed(() => activeLoaders.value.size > 0);

const loadingMessage = computed(() => {
  if (activeLoaders.value.has("scryfall-bulk")) {
    return "Loading card data from Scryfall...";
  }
  if (activeLoaders.value.has("edhrec-fetch")) {
    return "Fetching EDHREC recommendations...";
  }
  if (activeLoaders.value.has("csv-parse")) {
    return "Processing your CSV file...";
  }
  return "Loading...";
});

const progress = computed(() => {
  // Extract from loader metadata if available
  return null; // Implement based on useGlobalLoading changes
});

const progressPercent = computed(() => {
  if (!progress.value) return 0;
  return (progress.value.current / progress.value.total) * 100;
});
</script>
```

### 2. Skeleton Screens

Show placeholder content while loading:

```vue
<!-- SkeletonCard.vue -->
<template>
  <div class="skeleton-card animate-pulse">
    <div class="flex gap-4">
      <!-- Card image placeholder -->
      <div class="w-24 h-32 bg-slate-200 dark:bg-slate-700 rounded" />

      <!-- Card details placeholder -->
      <div class="flex-1 space-y-3">
        <div class="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
        <div class="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
        <div class="h-3 bg-slate-200 dark:bg-slate-700 rounded w-2/3" />
      </div>
    </div>
  </div>
</template>
```

Usage:

```vue
<template>
  <div v-if="loading">
    <SkeletonCard v-for="i in 10" :key="i" />
  </div>
  <div v-else>
    <CardRow v-for="card in cards" :key="card.id" :card="card" />
  </div>
</template>
```

### 3. Enhanced useGlobalLoading Composable

Add progress tracking:

```typescript
// src/composables/useGlobalLoading.ts
interface LoadingState {
  id: string;
  message: string;
  progress?: {
    current: number;
    total: number;
  };
}

const loadingStates = ref<Map<string, LoadingState>>(new Map());

export const useGlobalLoading = () => {
  const startLoading = (id: string, message: string = "Loading...", total?: number) => {
    loadingStates.value.set(id, {
      id,
      message,
      progress: total ? { current: 0, total } : undefined,
    });
  };

  const updateProgress = (id: string, current: number) => {
    const state = loadingStates.value.get(id);
    if (state?.progress) {
      state.progress.current = current;
    }
  };

  const stopLoading = (id: string) => {
    loadingStates.value.delete(id);
  };

  return {
    loadingStates,
    startLoading,
    updateProgress,
    stopLoading,
  };
};
```

### 4. Scryfall Progress Tracking

Update API calls to show progress:

```typescript
// src/api/scryfallApi.ts
export const fetchBulkCardData = async (
  cardNames: string[],
  onProgress?: (current: number, total: number) => void
) => {
  const batches = chunk(cardNames, 75);
  const { startLoading, updateProgress, stopLoading } = useGlobalLoading();

  startLoading("scryfall-bulk", "Loading card data...", batches.length);

  for (let i = 0; i < batches.length; i++) {
    await fetchBatch(batches[i]);
    updateProgress("scryfall-bulk", i + 1);
    onProgress?.(i + 1, batches.length);

    if (i < batches.length - 1) {
      await delay(300); // Rate limit respect
    }
  }

  stopLoading("scryfall-bulk");
};
```

## Implementation Plan

### Phase 1: Enhanced Banner (2 hours)

1. Make banner full-width and fixed top
2. Add animated spinner icon
3. Improve colors and contrast
4. Add slide-down transition

### Phase 2: Progress Tracking (3 hours)

1. Update useGlobalLoading with progress support
2. Modify Scryfall API to report progress
3. Show progress bar in banner
4. Display current/total counts

### Phase 3: Skeleton Screens (3 hours)

1. Create reusable skeleton components
2. Add to card list, search results
3. Implement shimmer animation
4. Match actual content layout

### Phase 4: Contextual Messages (1 hour)

1. Add specific loading messages per operation
2. Show estimated time for known operations
3. Add cancel button for long operations

## Technical Details

### Files to Modify

- `src/components/GlobalLoadingBanner.vue` - Enhanced banner
- `src/composables/useGlobalLoading.ts` - Progress tracking
- `src/api/scryfallApi.ts` - Report progress
- `src/components/SkeletonCard.vue` - New component
- `src/components/CardTable.vue` - Use skeleton while loading

### Animation Styles

```css
/* Shimmer effect */
@keyframes shimmer {
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
}

.skeleton-shimmer {
  background: linear-gradient(
    90deg,
    theme("colors.slate.200") 0%,
    theme("colors.slate.300") 50%,
    theme("colors.slate.200") 100%
  );
  background-size: 1000px 100%;
  animation: shimmer 2s infinite linear;
}
```

## Acceptance Criteria

- [ ] Loading banner is immediately visible when loading starts
- [ ] Progress shown for operations with known length
- [ ] Skeleton screens appear for card lists
- [ ] Loading messages are descriptive and contextual
- [ ] Smooth transitions when content appears
- [ ] Banner auto-dismisses when loading completes
- [ ] Multiple simultaneous loaders handled correctly
- [ ] Accessible to screen readers (aria-live)
- [ ] No layout shift when banner appears/disappears
- [ ] Cancel button works for long operations

## User Experience Improvements

**Before:**

- User clicks search
- Screen appears frozen
- No feedback for 3-5 seconds
- Cards suddenly appear

**After:**

- User clicks search
- Banner slides down immediately
- "Fetching EDHREC recommendations..." shown
- Progress: "Loading 2 of 5 batches..."
- Skeleton cards appear
- Real cards fade in smoothly

## Performance Considerations

- Skeleton screens should be lightweight (CSS-only)
- Avoid re-rendering banner on every progress update
- Debounce progress updates if too frequent
- Use CSS animations over JavaScript

## Related Issues

- #TBD-empty-states (showing initial state)
- docs/issues/medium-priority/03-standardize-error-handling.md
- docs/issues/high-priority/12-information-density-whitespace.md

## References

- [Skeleton Screens Best Practices](https://www.nngroup.com/articles/skeleton-screens/)
- [Progress Indicators](https://www.nngroup.com/articles/progress-indicators/)
- [Material Design Progress Indicators](https://material.io/components/progress-indicators)
- [ARIA Live Regions](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/ARIA_Live_Regions)
