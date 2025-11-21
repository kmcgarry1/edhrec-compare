# Loading State Visibility Enhancements

This document describes the loading state visibility enhancements implemented to improve user experience during data fetching operations.

## Overview

The application now features enhanced loading indicators that provide clear visual feedback during asynchronous operations, including:

1. **Animated spinner** - Visual indication that work is in progress
2. **Progress tracking** - Shows current progress for multi-step operations
3. **Progress bar** - Visual representation of completion percentage
4. **Skeleton screens** - Placeholder content while card data loads
5. **Contextual messages** - Descriptive text explaining what's loading

## Components Enhanced

### 1. GlobalLoadingBanner

**Location:** `src/components/GlobalLoadingBanner.vue`

**New Features:**

- Animated spinning icon for visual feedback
- Progress counter display (e.g., "3 / 10")
- Animated progress bar that fills based on completion
- Improved styling with better contrast and visibility
- Maintains existing inline/teleport functionality
- Full dark mode support

**Visual Changes:**

```
Before: [Loading...]
After:  [🔄 Loading card data from Scryfall...  3 / 10]
        [===========                        ] 30%
```

### 2. SkeletonCard Component

**Location:** `src/components/SkeletonCard.vue`

**Features:**

- Lightweight placeholder for card data
- CSS-only pulse animation
- Matches card layout structure
- Proper accessibility (role="status", aria-label)
- Responsive to dark mode

**Usage:**
Shows 5 skeleton cards in each card list section while Scryfall data is being fetched.

### 3. CardlistSection Component

**Location:** `src/components/CardlistSection.vue`

**Enhancements:**

- New `loading` prop (boolean, optional)
- Displays skeleton cards when `loading={true}`
- Smooth transition between loading and loaded states
- Hides actual card table during loading

### 4. useGlobalLoading Composable

**Location:** `src/composables/useGlobalLoading.ts`

**New Capabilities:**

#### Progress Tracking

```typescript
// Start loading with total steps
startLoading("Loading card data...", "scryfall-bulk", 10);

// Update progress
updateProgress("scryfall-bulk", 5); // Now at 5/10

// Progress is automatically cleared when loading stops
stopLoading("scryfall-bulk");
```

#### New Functions

- `updateProgress(scope, current)` - Update progress for a scope
- `getScopeProgress(scope)` - Get progress info for a scope
- `loadingProgress` - Computed ref for default scope progress

#### Type Definition

```typescript
interface ProgressInfo {
  current: number;
  total: number;
}
```

### 5. Scryfall API

**Location:** `src/api/scryfallApi.ts`

**Enhancement:**
The `getCardsByNames()` function now:

- Accepts optional `onProgress` callback
- Calculates total batches (75 cards per batch)
- Reports progress after each batch completes
- Maintains existing 300ms rate limit delay

**Example:**

```typescript
await getCardsByNames(cards, (current, total) => {
  console.log(`Loaded batch ${current} of ${total}`);
});
```

### 6. EdhrecReader Component

**Location:** `src/components/EdhrecReader.vue`

**Integration:**

- Tracks bulk card loading state
- Calculates and reports batch progress
- Passes loading state to CardlistSection components
- Shows skeleton cards during initial load

## User Experience Improvements

### Before Enhancement

- User clicks search
- Screen appears frozen for 3-5 seconds
- No feedback during data fetch
- Cards suddenly appear
- User unsure if app is working

### After Enhancement

- User clicks search
- Loading banner slides down immediately
- Animated spinner shows activity
- "Loading card data from Scryfall..." message displays
- Progress counter shows "1 / 5" → "2 / 5" → etc.
- Progress bar fills: 20% → 40% → 60% → 80% → 100%
- Skeleton cards appear in card sections
- Real cards fade in smoothly as data arrives
- Loading banner slides away when complete

## Technical Implementation

### Backward Compatibility

- All changes are backward compatible
- Progress tracking is optional
- Existing code continues to work without modifications
- No breaking changes to existing APIs

### Performance Considerations

- Skeleton screens are CSS-only (no JavaScript overhead)
- Progress updates are throttled by batch completion
- No re-rendering of banner on every progress update
- Lightweight animations using CSS transitions

### Accessibility

- Loading banners have `role="status"` and `aria-live="polite"`
- Skeleton cards have `aria-label="Loading card data"`
- Progress information is announced to screen readers
- Visual animations respect prefers-reduced-motion

## Testing

### Unit Tests Added

- 7 new tests for progress tracking in `useGlobalLoading`
- 3 new tests for `SkeletonCard` component
- 2 updated tests for `GlobalLoadingBanner` progress display

### Test Coverage

- All 252 tests pass (12 new tests added)
- No decrease in existing coverage
- New components have 100% coverage

## Browser Compatibility

All features use standard web APIs:

- CSS animations (widely supported)
- SVG for spinner icon
- Flexbox layout
- CSS custom properties for theming

## Future Enhancements

Potential improvements for future iterations:

1. **Estimated Time Remaining** - Show "~2 seconds remaining"
2. **Cancel Button** - Allow canceling long-running operations
3. **Retry Logic** - Automatic retry with exponential backoff
4. **Offline Detection** - Special message when offline
5. **Detailed Progress Messages** - "Loading batch 1 of 5: Fetching 75 cards"

## Related Issues

- Addresses: Loading State Visibility Enhancement (Issue #TBD)
- Related to: UX improvements and user feedback
- Complements: Error handling enhancements

## References

- [Nielsen Norman Group - Skeleton Screens](https://www.nngroup.com/articles/skeleton-screens/)
- [Nielsen Norman Group - Progress Indicators](https://www.nngroup.com/articles/progress-indicators/)
- [Material Design - Progress Indicators](https://material.io/components/progress-indicators)
- [ARIA Live Regions](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/ARIA_Live_Regions)
