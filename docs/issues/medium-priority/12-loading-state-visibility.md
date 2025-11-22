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
<template>
  <div v-if="isLoading" class="loading-banner">Loading...</div>
</template>
```

## Proposed Solutions

### 1. Prominent Global Loading Banner

Make loading banner more noticeable:

```vue
<template>
  <Transition name="slide-down">
    <div v-if="hasActiveLoading" class="fixed top-0 left-0 right-0 z-50">
      <div class="bg-emerald-600 text-white px-6 py-3 shadow-lg">
        <div class="flex items-center justify-between max-w-6xl mx-auto">
          <div class="flex items-center gap-3">
            <svg class="animate-spin h-5 w-5">
              <!-- Spinner icon -->
            </svg>

            <span class="font-medium">
              {{ loadingMessage }}
            </span>
          </div>

          <div v-if="progress" class="text-sm">{{ progress.current }} / {{ progress.total }}</div>
        </div>

        <div v-if="progress" class="mt-2">
          <div class="bg-emerald-700 rounded-full h-1">
            <div
              class="bg-white rounded-full h-1 transition-all"
              :style="{ width: `${(progress.current / progress.total) * 100}%` }"
            />
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>
```

### 2. Skeleton Screens

Show placeholder content while loading:

```vue
<template>
  <div class="skeleton-card">
    <div class="skeleton-image" />

    <div class="skeleton-content">
      <div class="skeleton-line w-3/4" />
      <div class="skeleton-line w-1/2" />
      <div class="skeleton-line w-full" />
    </div>
  </div>
</template>

<style>
@keyframes shimmer {
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
}

.skeleton-line {
  height: 1rem;
  background: linear-gradient(90deg, #e2e8f0 0%, #cbd5e1 50%, #e2e8f0 100%);
  background-size: 1000px 100%;
  animation: shimmer 2s infinite linear;
  border-radius: 0.25rem;
}
</style>
```

Usage:

```vue
<template>
  <div v-if="isLoading">
    <SkeletonCard v-for="i in 3" :key="i" />
  </div>
  <div v-else>
    <Card v-for="card in cards" :key="card.id" :card="card" />
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

- #72 - Empty states (showing initial state)
- #71 - Information density (affects toolbar density)

## References

- [Skeleton Screens Best Practices](https://www.nngroup.com/articles/skeleton-screens/)
- [Progress Indicators](https://www.nngroup.com/articles/progress-indicators/)
- [Material Design Progress Indicators](https://material.io/components/progress-indicators)
- [ARIA Live Regions](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/ARIA_Live_Regions)
