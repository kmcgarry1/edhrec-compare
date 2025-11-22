# Empty State Design

**Priority:** Medium  
**Type:** UX Enhancement  
**Component:** EdhrecReader, Dashboard  
**Effort:** Low (< 1 day)

## Problem

When no commander is selected, the interface shows filters and instructions but no visual placeholder for where results will appear. This leaves users uncertain about what to expect and doesn't communicate the value proposition effectively.

### Current Issues

- No indication of where commander data will appear
- Missing visual feedback about expected outcome
- Empty space below filters looks unfinished
- No guidance on popular commanders or next steps
- Opportunity to educate users about features

### User Impact

- **Medium:** New users unsure what the interface will show
- Reduced confidence in using the tool
- Missed opportunity to guide user behavior
- No examples of tool value until after first search

## Screenshots

- [Current empty state](https://github.com/user-attachments/assets/45f1f1e9-f478-4aa9-a40f-083ef4c8b453)

## Proposed Solution

### Empty State Component

Create visually appealing placeholder that:

1. Shows where content will appear
2. Provides helpful guidance
3. Suggests popular commanders
4. Illustrates the value proposition

### Design Options

#### Option A: Illustrated Placeholder

```
┌─────────────────────────────────────┐
│                                     │
│        [Magic Wand Icon]            │
│                                     │
│   Search for a commander above      │
│   to see EDHREC recommendations     │
│                                     │
│   Popular commanders:               │
│   • Atraxa, Grand Unifier          │
│   • The Ur-Dragon                   │
│   • Miirym, Sentinel Wyrm          │
│                                     │
└─────────────────────────────────────┘
```

#### Option B: Preview Cards (Skeleton)

```
┌──────────┐  ┌──────────┐  ┌──────────┐
│ [------] │  │ [------] │  │ [------] │
│ [------] │  │ [------] │  │ [------] │
│ [------] │  │ [------] │  │ [------] │
└──────────┘  └──────────┘  └──────────┘
     Results will appear here
```

#### Option C: Feature Showcase

```
┌─────────────────────────────────────┐
│  ✨ Compare EDHREC recommendations  │
│     with your personal collection   │
│                                     │
│  📊 View card prices from Scryfall │
│                                     │
│  🎯 Filter by owned/unowned cards  │
│                                     │
│  Start by searching a commander ↑  │
└─────────────────────────────────────┘
```

### Recommended Approach (Hybrid)

Combine elements from all options:

```vue
<template>
  <div class="empty-state">
    <div class="icon-wrapper">
      <svg><!-- Card icon --></svg>
    </div>

    <h3>Find Your Next Commander Deck</h3>

    <p>
      Search for a commander above to see EDHREC recommendations, Scryfall pricing, and highlight
      cards you already own.
    </p>

    <div class="popular-commanders">
      <h4>Popular Commanders</h4>
      <ul>
        <li>Atraxa, Grand Unifier</li>
        <li>The Ur-Dragon</li>
        <li>Miirym, Sentinel Wyrm</li>
        <!-- Clickable suggestions -->
      </ul>
    </div>

    <p class="tip">💡 Tip: Upload a CSV to highlight owned cards</p>
  </div>
</template>
```

### Visual Design

**Colors:**

- Use muted slate tones (not distracting)
- Accent with emerald for interactive elements
- Subtle gradients for depth

**Typography:**

- Large heading (text-xl or text-2xl)
- Medium description (text-sm)
- Small hints (text-xs)

**Spacing:**

- Generous padding (p-12)
- Centered layout
- Adequate breathing room

**Iconography:**

- Stylized card deck illustration
- SVG icons for features
- Avoid generic "no data" icons

## Implementation Details

### New Component

```typescript
// src/components/EdhrecEmptyState.vue
<script setup lang="ts">
import { ref } from 'vue';

const popularCommanders = ref([
  'Atraxa, Grand Unifier',
  'The Ur-Dragon',
  'Miirym, Sentinel Wyrm',
]);

const emit = defineEmits<{
  selectCommander: [name: string];
}>();
</script>

<template>
  <div class="flex flex-col items-center justify-center min-h-[400px] text-center p-12">
    <div class="mb-6">
      <svg class="w-24 h-24 text-slate-300">
        <!-- Card icon -->
      </svg>
    </div>

    <h3 class="text-2xl font-bold text-slate-700 dark:text-slate-200 mb-4">
      Find Your Next Commander Deck
    </h3>
    <p class="text-sm text-slate-600 dark:text-slate-400 max-w-md mb-8">
      Search for a commander above to see EDHREC recommendations,
      live Scryfall pricing, and highlight cards you already own.
    </p>

    <div class="mb-6">
      <p class="text-xs font-semibold text-slate-500 mb-3">
        Popular Commanders
      </p>
      <div class="flex flex-col gap-2">
        <button
          v-for="commander in popularCommanders"
          :key="commander"
          @click="emit('selectCommander', commander)"
          class="text-sm text-emerald-600 hover:text-emerald-700"
        >
          {{ commander }}
        </button>
      </div>
    </div>

    <p class="text-xs text-slate-500 flex items-center gap-2">
      <svg class="w-4 h-4">💡</svg>
      Tip: Upload a CSV to automatically highlight cards you own
    </p>
  </div>
</template>
```

### Integration in EdhrecReader

```vue
<template>
  <div>
    <CommanderSearch />
    <CommanderFilters />

    <EdhrecEmptyState v-if="!selectedCommander" @select-commander="handleCommanderSelection" />

    <CardList v-else :cards="cards" />
  </div>
</template>
```

## Acceptance Criteria

- [ ] Empty state shown when no commander selected
- [ ] Illustration is visually appealing and on-brand
- [ ] Popular commander suggestions are clickable
- [ ] Clicking suggestion auto-fills search and triggers query
- [ ] Empty state hidden once commander data loads
- [ ] Works in both light and dark modes
- [ ] Responsive on mobile (stacked layout)
- [ ] Smooth transition when data loads
- [ ] Copy is clear and helpful
- [ ] No layout shift when transitioning to results

## Variations for Different States

### No Commander Selected (Initial)

Show full empty state with suggestions

### Loading Commander Data

Show skeleton cards or loading spinner

### No Results Found

Show different message: "No recommendations found for this commander"

### API Error

Show error state with retry button

## Related Issues

- #74 - Loading states (skeleton screens)
- #71 - Information density (affects layout)

## Inspiration Examples

- GitHub's empty repository state
- Notion's empty page illustrations
- Vercel's project empty state
- Linear's empty views

## References

- [Empty States - Laws of UX](https://lawsofux.com/empty-state/)
- [Material Design Empty States](https://material.io/design/communication/empty-states.html)
- [Empty State Best Practices](https://www.nngroup.com/articles/empty-state/)
