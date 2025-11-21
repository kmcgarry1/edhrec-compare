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
    <div class="illustration">
      <svg><!-- Stylized card grid icon --></svg>
    </div>

    <h3>Find Your Next Commander Deck</h3>

    <p class="description">
      Search for a commander above to see EDHREC recommendations, Scryfall pricing, and highlight
      cards you already own.
    </p>

    <div class="suggestions">
      <h4>Popular Commanders</h4>
      <div class="commander-chips">
        <button @click="selectCommander('Atraxa, Grand Unifier')">Atraxa, Grand Unifier</button>
        <button @click="selectCommander('The Ur-Dragon')">The Ur-Dragon</button>
        <button @click="selectCommander('Miirym, Sentinel Wyrm')">Miirym, Sentinel Wyrm</button>
        <!-- More suggestions -->
      </div>
    </div>

    <div class="features-hint">
      <span>💡 Tip: Upload a CSV to highlight owned cards</span>
    </div>
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
import { mdiMagicStaff, mdiCardsOutline } from '@mdi/js';

const emit = defineEmits<{
  'select-commander': [name: string];
}>();

const popularCommanders = [
  'Atraxa, Grand Unifier',
  'The Ur-Dragon',
  'Miirym, Sentinel Wyrm',
  'Prosper, Tome-Bound',
  'Korvold, Fae-Cursed King',
  'Muldrotha, the Gravetide'
];

const selectCommander = (name: string) => {
  emit('select-commander', name);
};
</script>

<template>
  <Card class="py-12 text-center">
    <div class="flex flex-col items-center gap-6 max-w-2xl mx-auto">
      <!-- Illustration -->
      <div class="w-24 h-24 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
        <svg viewBox="0 0 24 24" class="w-12 h-12 text-emerald-500">
          <path :d="mdiCardsOutline" fill="currentColor" />
        </svg>
      </div>

      <!-- Heading -->
      <div>
        <h3 class="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          Find Your Next Commander Deck
        </h3>
        <p class="text-slate-600 dark:text-slate-300">
          Search for a commander above to see EDHREC recommendations,
          live Scryfall pricing, and highlight cards you already own.
        </p>
      </div>

      <!-- Popular suggestions -->
      <div class="w-full">
        <p class="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
          Popular Commanders
        </p>
        <div class="flex flex-wrap gap-2 justify-center">
          <button
            v-for="commander in popularCommanders"
            :key="commander"
            @click="selectCommander(commander)"
            class="px-4 py-2 rounded-full border border-slate-200 text-sm font-medium text-slate-700 hover:border-emerald-400 hover:text-emerald-600 transition dark:border-slate-700 dark:text-slate-300"
          >
            {{ commander }}
          </button>
        </div>
      </div>

      <!-- Feature hint -->
      <div class="flex items-center gap-2 text-xs text-slate-500">
        <svg viewBox="0 0 24 24" class="w-4 h-4">
          <path :d="mdiMagicStaff" fill="currentColor" />
        </svg>
        <span>Tip: Upload a CSV to automatically highlight cards you own</span>
      </div>
    </div>
  </Card>
</template>
```

### Integration in EdhrecReader

```vue
<!-- src/components/EdhrecReader.vue -->
<template>
  <div>
    <!-- Commander search section -->
    <CommanderSearch />

    <!-- Empty state or results -->
    <EdhrecEmptyState v-if="!hasCommander" @select-commander="handleCommanderSelection" />

    <CardlistSection v-else :cardlists="cardlists" />
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

- #TBD-loading-states (skeleton screens)
- #TBD-information-density (affects layout)
- docs/issues/medium-priority/03-standardize-error-handling.md

## Inspiration Examples

- GitHub's empty repository state
- Notion's empty page illustrations
- Vercel's project empty state
- Linear's empty views

## References

- [Empty States - Laws of UX](https://lawsofux.com/empty-state/)
- [Material Design Empty States](https://material.io/design/communication/empty-states.html)
- [Empty State Best Practices](https://www.nngroup.com/articles/empty-state/)
