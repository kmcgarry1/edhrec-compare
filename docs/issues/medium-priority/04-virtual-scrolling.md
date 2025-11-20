# ⚡ Add virtual scrolling for large card lists

**Labels:** `performance`, `medium-priority`

## Problem
Card tables render all rows at once, which can cause performance issues with large decklists (100+ cards).

## Impact
- Slow rendering with large card lists
- Increased memory usage
- Poor UX with many cards
- Browser can become unresponsive

## Current Implementation
```vue
<!-- EdhrecReader.vue -->
<CardTable :rows="getTableRows(cardlist)" />
```

Renders all rows immediately.

## Proposed Solution
Implement virtual scrolling using one of:

### Option 1: vue-virtual-scroller
```bash
npm install vue-virtual-scroller
```

```vue
<RecycleScroller
  :items="getTableRows(cardlist)"
  :item-size="60"
  key-field="id"
>
  <template #default="{ item }">
    <ScryfallCardRow :card="item.card" :have="item.have" />
  </template>
</RecycleScroller>
```

### Option 2: @tanstack/vue-virtual
More modern, smaller bundle

### Option 3: Custom Implementation
For learning/control

## Implementation Steps
1. Choose virtual scroll library
2. Update `CardTable.vue` to support virtual scrolling
3. Test with large datasets (200+ cards)
4. Ensure mobile responsiveness maintained
5. Update E2E tests if needed

## Performance Targets
- Smooth 60fps scrolling with 500+ items
- Initial render < 100ms
- Memory usage < 50MB for 500 cards

## References
- [vue-virtual-scroller](https://github.com/Akryum/vue-virtual-scroller)
- [TanStack Virtual](https://tanstack.com/virtual/latest)
