# Information Density & Whitespace Balance

**Priority:** High  
**Type:** UX Enhancement  
**Component:** Dashboard, Layout  
**Effort:** Medium (1-3 days)

## Problem

The interface has generous whitespace which aids readability but significantly reduces information density. The "Find commanders" section, dropdown filters, and legal notice consume substantial vertical space, requiring users to scroll extensively to see actual commander results and card data.

### Current Issues

- Excessive vertical scrolling required to reach primary content
- Desktop users with large screens see mostly empty space
- Filter dropdowns take full-width rows on desktop despite available horizontal space
- Legal notice dominates bottom of viewport on smaller screens
- Long time-to-value for primary task (viewing commander recommendations)
- Card padding (p-3 sm:p-4) is generous but limits content density

### User Impact

- **High:** Users must scroll multiple screens before seeing results
- Reduced efficiency for power users who want quick comparisons
- Desktop advantage not fully utilized
- Perceived as "empty" or lacking content

## Screenshots

- [Main interface showing whitespace](https://github.com/user-attachments/assets/45f1f1e9-f478-4aa9-a40f-083ef4c8b453)
- [Dark mode with spacing](https://github.com/user-attachments/assets/8b32ef9f-2f8c-4958-9829-501ce3b25d61)

## Proposed Solution

### 1. Compact Filter Layout

**Current:** Filters stack vertically in grid

```html
<div class="grid grid-cols-4 gap-2">
  <div>Bracket: [All ▼]</div>
  <div>Budget: [Any ▼]</div>
  <div>Page Type: [Commander ▼]</div>
  <div>Companion: [None ▼]</div>
</div>
```

**Proposed:** Single row with inline labels

```html
<div class="flex flex-wrap gap-3 items-center">
  <span class="text-xs text-slate-500">Filters:</span>
  <select>
    Bracket: All
  </select>
  <select>
    Budget: Any
  </select>
  <select>
    Page Type: Commander
  </select>
  <select>
    Companion: None
  </select>
</div>
```

### 2. Collapsible Legal Notice

**Current:** Always visible, 4-5 line paragraph + bullet list

**Proposed:**

- Collapsed by default: "Independent hobby project · Learn more ▼"
- Expand on click to show full disclaimer
- Move to footer section on desktop
- Consider moving to FAQ or About page

### 3. Density Mode Toggle

Add user preference for information density:

**Comfortable (Default):**

- Current spacing preserved
- Good for casual browsing
- Prioritizes readability

**Compact:**

- Reduced padding (p-2 instead of p-3/p-4)
- Tighter line-height
- Smaller font sizes (text-xs instead of text-sm)
- More cards visible per screen

**Cozy (Middle Ground):**

- Moderate spacing reduction
- Balance between comfort and density

```typescript
// Composable: useLayoutDensity.ts
export type Density = "comfortable" | "cozy" | "compact";

export const useLayoutDensity = () => {
  const density = ref<Density>("comfortable");

  const spacing = computed(() => {
    return {
      comfortable: "p-4 gap-6",
      cozy: "p-3 gap-4",
      compact: "p-2 gap-3",
    }[density.value];
  });

  return { density, spacing };
};
```

### 4. Multi-Column Layout on Desktop

**Current:** Single column max-width container (max-w-6xl)

**Proposed for wide screens (1280px+):**

- Sidebar with filters (fixed position)
- Main content area for cards (scrollable)
- Two-column card grid instead of single column

```html
<div class="flex gap-6">
  <aside class="w-80 sticky top-0">
    <!-- Filters, controls -->
  </aside>
  <main class="flex-1">
    <!-- Commander results -->
  </main>
</div>
```

### 5. Reduced Component Padding

**Current padding classes:**

- Cards: `p-3 sm:p-4`
- Sections: `gap-8`
- Container: `py-6`

**Proposed:**

- Cards: `p-2 sm:p-3`
- Sections: `gap-4 sm:gap-6`
- Container: `py-4 sm:py-6`

## Implementation Plan

### Phase 1: Quick Wins (< 4 hours)

1. Reduce padding on Card components
2. Make filter layout single row on desktop
3. Collapse legal notice by default
4. Adjust section gaps (gap-8 → gap-4)

### Phase 2: Layout Improvements (1 day)

1. Implement collapsible legal notice component
2. Create multi-column layout for desktop
3. Optimize responsive breakpoints
4. Add sticky sidebar on large screens

### Phase 3: Density Mode (1-2 days)

1. Create `useLayoutDensity` composable
2. Add density toggle to toolbar
3. Apply density classes throughout
4. Store preference in localStorage
5. Add density to onboarding

## Technical Details

### Files to Modify

- `src/components/Dashboard.vue` - Main layout structure
- `src/components/Card.vue` - Base card padding
- `src/components/CommanderSearch.vue` - Filter layout
- `src/components/SiteNotice.vue` - Make collapsible
- `src/components/ToolkitHeader.vue` - Add density toggle
- `src/composables/useLayoutDensity.ts` - New composable

### CSS Approach

```vue
<!-- Card.vue -->
<script setup lang="ts">
import { useLayoutDensity } from "@/composables/useLayoutDensity";

const { spacing } = useLayoutDensity();
</script>

<template>
  <div :class="['rounded-xl border bg-white', spacing]">
    <slot />
  </div>
</template>
```

### Responsive Breakpoints

```css
/* Current: max-w-6xl single column */
.container {
  max-width: 72rem; /* 1152px */
}

/* Proposed: Multi-column on large screens */
@media (min-width: 1280px) {
  .layout-sidebar {
    display: flex;
    gap: 1.5rem;
  }

  .layout-sidebar aside {
    width: 20rem;
    position: sticky;
    top: 1rem;
  }
}
```

## Acceptance Criteria

- [ ] Filter row takes < 60px vertical space on desktop
- [ ] Legal notice collapsible, collapsed by default
- [ ] Sidebar layout available on screens > 1280px
- [ ] Density toggle in toolbar with 3 options
- [ ] User preference persisted in localStorage
- [ ] At least 30% more vertical content visible in compact mode
- [ ] No regressions in mobile usability
- [ ] Smooth transitions between density modes
- [ ] Documentation updated with density feature

## Measurements

### Current State (1280px width)

- Viewport height: ~800px visible
- Toolkit header: ~180px
- Find commanders card: ~400px
- Filters: ~60px
- Legal notice: ~200px
- **Cards visible:** 0 (need to scroll)

### Target State (Compact)

- Toolkit header: ~120px
- Find commanders: ~280px
- Filters (inline): ~40px
- Legal notice (collapsed): ~30px
- **Cards visible:** 2-3 above fold

## User Research Questions

Before implementation, consider testing:

- Do users prefer compact or comfortable by default?
- How often do users read the legal notice?
- Do power users want even more density?
- Is sidebar layout intuitive on desktop?

## Alternatives Considered

1. **Infinite scroll** - Future enhancement, doesn't solve initial density
2. **Pagination** - Adds navigation complexity
3. **Grid view toggle** - Could complement density mode
4. **Floating filters** - Considered for mobile
5. **Hide toolbar by default** - Already implemented (collapsed state)

## Related Issues

- #TBD-visual-hierarchy (affects toolbar density)
- #TBD-mobile-toolbar (density implications for mobile)
- #TBD-empty-states (affects perceived density)
- docs/issues/medium-priority/01-refactor-large-components.md

## References

- [Material Design Density](https://material.io/design/layout/applying-density.html)
- [Information Scent](https://www.nngroup.com/articles/information-scent/)
- [F-Pattern Layout](https://www.nngroup.com/articles/f-shaped-pattern-reading-web-content/)
