# Implement Virtual Scrolling for Card Tables

**Priority:** High  
**Type:** Performance Enhancement  
**Component:** CardTable.vue  
**Effort:** Medium (2-3 days)

## Problem

CardTable components render all rows at once, causing performance issues with large cardlists:

### Current Issues

- EDHREC cardlists can contain 100-500+ cards
- Rendering 500 DOM nodes causes visible jank and lag
- Scrolling performance degrades with list size
- Memory usage increases linearly with card count
- Mobile devices especially struggle with large lists
- Initial render blocks UI thread for 100-200ms

### User Impact

- **High:** Noticeable lag when scrolling through large cardlists
- Poor experience on mobile devices and low-end hardware
- Application feels sluggish with multiple expanded sections
- Memory pressure on devices with limited RAM
- Lower frame rates during scrolling (< 30 FPS)

## Proposed Solution

### Virtual Scrolling Implementation

Use `@tanstack/vue-virtual` (recommended) or `@vueuse/core` virtual scrolling to render only visible rows:

1. **Virtual List Component**
   - Render only ~20 visible rows at a time
   - Dynamically add/remove rows as user scrolls
   - Maintain scroll position accurately
   - Support variable row heights if needed

2. **Performance Benefits**
   - Constant DOM node count (~20-30 regardless of list size)
   - Smooth 60 FPS scrolling on all devices
   - Reduced memory footprint (10-20 MB savings)
   - Faster initial render (< 50ms vs 100-200ms)

3. **Preserve Functionality**
   - Maintain ownership highlighting
   - Keep hover effects and tooltips
   - Preserve keyboard navigation
   - Support filtering without breaking virtualization

### Implementation Approach

```typescript
// Install virtual scrolling library
npm install @tanstack/vue-virtual

// src/components/VirtualizedCardTable.vue
<script setup lang="ts">
import { useVirtualizer } from '@tanstack/vue-virtual';
import { ref, computed } from 'vue';
import type { CardTableRow } from '../types/cards';

interface Props {
  rows: CardTableRow[];
  columns: ColumnDefinition[];
}

const props = defineProps<Props>();
const parentRef = ref<HTMLElement>();

// Configure virtualizer
const virtualizer = useVirtualizer({
  count: props.rows.length,
  getScrollElement: () => parentRef.value,
  estimateSize: () => 60, // Fixed row height in pixels
  overscan: 5, // Render 5 extra rows above/below viewport
});

const virtualRows = computed(() => virtualizer.value.getVirtualItems());
const totalSize = computed(() => virtualizer.value.getTotalSize());
</script>

<template>
  <div ref="parentRef" class="overflow-auto h-[600px]">
    <div
      :style="{
        height: `${totalSize}px`,
        position: 'relative',
      }"
    >
      <div
        v-for="virtualRow in virtualRows"
        :key="virtualRow.key"
        :style="{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: `${virtualRow.size}px`,
          transform: `translateY(${virtualRow.start}px)`,
        }"
      >
        <ScryfallCardRow
          :card="rows[virtualRow.index]"
          :columns="columns"
        />
      </div>
    </div>
  </div>
</template>
```

### Fixed vs Dynamic Row Heights

**Option 1: Fixed Height (Recommended)**

- Simpler implementation
- Better performance
- Requires standardizing row height to 60-80px

**Option 2: Dynamic Height**

- Supports variable content
- More complex (need measuring)
- Slightly lower performance
- Use if row content varies significantly

```typescript
// Dynamic height example
estimateSize: (index) => {
  const row = props.rows[index];
  // Calculate based on content
  return row.hasLongText ? 80 : 60;
};
```

## Technical Considerations

### Files to Create

- `src/components/VirtualizedCardTable.vue` - New virtualized version
- `tests/unit/components/VirtualizedCardTable.spec.ts` - Unit tests

### Files to Modify

- `src/components/CardlistSection.vue` - Use VirtualizedCardTable
- `src/components/EdhrecReader.vue` - Pass virtualization props
- `package.json` - Add @tanstack/vue-virtual dependency

### Dependency Evaluation

**@tanstack/vue-virtual**

- Size: ~6 KB (gzipped)
- Mature, well-maintained
- Excellent Vue 3 support
- Flexible API

**@vueuse/core (useVirtualList)**

- Already a dependency (0 KB cost)
- Simpler API
- Sufficient for basic use case
- Less flexible than TanStack

**Recommendation:** Start with `@vueuse/core` to avoid new dependency. Migrate to TanStack if more features needed.

### Virtualization with @vueuse/core

```typescript
// Simpler approach using existing dependency
import { useVirtualList } from "@vueuse/core";

const { list, containerProps, wrapperProps } = useVirtualList(toRef(props, "rows"), {
  itemHeight: 60, // Fixed height
  overscan: 5,
});
```

### Handling Dynamic Filters

```typescript
// Update virtual list when ownership filter changes
watch(
  () => props.rows,
  () => {
    // Virtualization library handles this automatically
    virtualizer.value?.measure();
  }
);
```

## Implementation Plan

### Phase 1: Prototype with @vueuse/core (Day 1)

1. Create VirtualizedCardTable component
2. Implement basic virtual scrolling with fixed heights
3. Test with 500+ card lists
4. Measure performance improvements

### Phase 2: Integration (Day 2)

1. Replace CardTable with VirtualizedCardTable in CardlistSection
2. Update styling to match current design
3. Ensure ownership filtering still works
4. Test keyboard navigation

### Phase 3: Polish & Optimization (Day 3)

1. Fine-tune overscan and item height
2. Add smooth scroll animations
3. Optimize re-renders (memo, shouldUpdate)
4. Performance test on mobile devices
5. Update documentation

### Phase 4: Testing (included in phases above)

1. Unit tests for virtual list logic
2. E2E tests for scrolling behavior
3. Performance benchmarks (before/after)
4. Cross-browser testing

## Acceptance Criteria

- [ ] Card tables with 500+ rows render in < 50ms
- [ ] Scrolling maintains 60 FPS on desktop
- [ ] Scrolling maintains 30+ FPS on mobile
- [ ] Ownership highlighting works in virtualized lists
- [ ] Keyboard navigation (arrow keys) works
- [ ] No visual glitches during fast scrolling
- [ ] Memory usage reduced by 50%+ for large lists
- [ ] Bundle size increase < 10 KB (if new dependency)

## Performance Targets

### Before Virtualization

- 100 cards: ~50ms render, smooth scrolling
- 300 cards: ~150ms render, slight jank
- 500 cards: ~250ms render, noticeable lag
- Memory: ~50 MB for 3 large cardlists

### After Virtualization

- 100 cards: ~30ms render, smooth
- 300 cards: ~35ms render, smooth
- 500 cards: ~40ms render, smooth
- Memory: ~20 MB for 3 large cardlists

## Testing Strategy

### Performance Testing

```typescript
// tests/e2e/performance.spec.ts
test("virtual scrolling maintains 60 FPS", async ({ page }) => {
  await page.goto("/");

  // Select commander with 500+ card list
  await selectCommander(page, "Atraxa, Praetors' Voice");

  // Measure FPS during scroll
  const fps = await measureScrollFPS(page, ".card-table-container");

  expect(fps).toBeGreaterThan(55); // Allow 5 FPS margin
});
```

### Visual Regression

```typescript
// Ensure virtualization doesn't break layout
test("virtualized table matches non-virtual layout", async ({ page }) => {
  await page.goto("/");
  await selectCommander(page, "Atraxa, Praetors' Voice");

  const screenshot = await page.screenshot();
  expect(screenshot).toMatchSnapshot("virtual-card-table.png");
});
```

## Migration Path

### Phase 1: Opt-in (Recommended)

- Add feature flag: `VITE_ENABLE_VIRTUAL_SCROLL`
- Test thoroughly with real users
- Gather feedback before full rollout

### Phase 2: Default Enabled

- Enable by default after 1-2 weeks
- Keep fallback for edge cases
- Monitor error reports

### Phase 3: Remove Old Implementation

- After 1 month, remove non-virtual CardTable
- Clean up feature flag code

## Alternative Approaches Considered

1. **CSS `content-visibility: auto`** - Dismissed: Limited browser support
2. **Intersection Observer lazy rendering** - Considered: More complex, similar benefits
3. **Pagination** - Dismissed: Breaks user flow, poor UX
4. **Load on scroll (infinite scroll)** - Dismissed: Doesn't fit card table UX
5. **DOM recycling** - Considered: Virtual scrolling does this internally

## Related Issues

- #71 - Information density (virtualization enables showing more)
- Performance optimization overall
- Mobile experience improvements

## References

- [TanStack Virtual - Docs](https://tanstack.com/virtual/latest)
- [VueUse - useVirtualList](https://vueuse.org/core/useVirtualList/)
- [Virtual Scrolling - Web.dev](https://web.dev/virtualize-long-lists-react-window/)
- [Measuring Rendering Performance](https://web.dev/rendering-performance/)
