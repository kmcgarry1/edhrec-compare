# Composables

This directory contains Vue 3 composables that provide reusable state management and business logic using the Composition API.

## Overview

Composables follow the pattern of module-level reactive state with exported functions. This provides global state management without requiring Vuex or Pinia.

## Available Composables

### State Management

#### `useGlobalNotices.ts`

Toast notification system for user-facing messages.

```typescript
import { useGlobalNotices } from "@/composables/useGlobalNotices";

const { notifySuccess, notifyError } = useGlobalNotices();
notifySuccess("Operation completed!");
notifyError("Something went wrong");
```

#### `useGlobalLoading.ts`

Loading state management with support for multiple concurrent operations and progress tracking.

```typescript
import { useGlobalLoading } from "@/composables/useGlobalLoading";

const { startLoading, stopLoading, withLoading } = useGlobalLoading();

// Manual control
startLoading("Fetching data...", "scope-name");
// ... async operation
stopLoading("scope-name");

// Automatic wrapper
await withLoading(async () => await fetchData(), "Loading...", "api-scope");
```

#### `useCsvUpload.ts`

CSV file upload state management for card inventory data.

```typescript
import { useCsvUpload } from "@/composables/useCsvUpload";

const { rows, headers, setCsvData, clearCsvData } = useCsvUpload();
```

### UI Preferences

#### `useTheme.ts`

Light/dark theme management with localStorage persistence and system preference detection.

```typescript
import { useTheme } from "@/composables/useTheme";

const { theme, toggleTheme, setTheme } = useTheme();
```

#### `useBackgroundPreference.ts`

Animated nebula background visibility preference.

```typescript
import { useBackgroundPreference } from "@/composables/useBackgroundPreference";

const { backgroundEnabled, toggleBackground } = useBackgroundPreference();
```

### Game Logic

#### `useCommanderColors.ts`

Commander color identity management, supporting partner commanders with merged color identities.

```typescript
import { useCommanderColors } from "@/composables/useCommanderColors";

const { commanderColors, setCommanderColors } = useCommanderColors();
setCommanderColors("primary", ["W", "U"]);
setCommanderColors("partner", ["U", "B"]);
// commanderColors.value is now ['W', 'U', 'B']
```

#### `useOwnedFilter.ts`

Card ownership filter state for inventory-based filtering.

```typescript
import { useOwnedFilter } from "@/composables/useOwnedFilter";

const { showOwned, setOwnedFilter } = useOwnedFilter();
setOwnedFilter(true); // Show only owned cards
setOwnedFilter(false); // Show only unowned cards
setOwnedFilter(null); // Show all cards
```

#### `useCommanderSearch.ts`

Encapsulates commander search state (primary/partner), autocomplete queries,
selection management, and mana cost lookups.

#### `useTopCommandersData.ts`

Fetches the EDHREC top commanders list and owns paging/sorting state.

#### `useTopCommanderImages.ts`

Loads commander images and color identities from Scryfall, with partner-aware
stacked image helpers.

#### `useTopCommanderFilters.ts`

Manages color identity filters and resolves EDHREC list paths for the selected
colors.

#### `useScryfallCardMeta.ts`

Derives display-ready card metadata (names, types, mana, rarity badges) and
mana symbol rendering for Scryfall cards.

#### `useScryfallCardPreview.ts`

Handles hover previews and mobile modal previews for Scryfall cards, including
image caching and pointer interaction logic.

#### `useScryfallCardRowStyles.ts`

Builds responsive row and table cell class names based on density and owned
state.

### External Data

#### `useScryfallSymbols.ts`

Mana symbol data management from Scryfall symbology API.

```typescript
import { useScryfallSymbols } from "@/composables/useScryfallSymbols";

const { ensureSymbolsLoaded, getSvgForSymbol } = useScryfallSymbols();
await ensureSymbolsLoaded();
const whiteManaSvg = getSvgForSymbol("{W}");
```

### Feature Modules

#### `useEdhrecRouteState.ts`

Keeps EDHREC filter state in sync with route params and query strings. Builds the
current EDHREC JSON URL based on commander selection and filter state.

#### `useEdhrecData.ts`

Fetches EDHREC cardlists with request deduplication and scoped loading state.
Exposes parsed cardlists and total card counts.

#### `useEdhrecCardlists.ts`

Builds cardlist sections, decklist export payloads, ownership filtering helpers,
and scroll tracking for the cardlist nav.

#### `useScryfallCardData.ts`

Batch-fetches Scryfall data, builds table rows for cardlists, and keeps the
background art selection in sync with fetched cards.

### Accessibility

#### `useFocusTrap.ts`

Focus trap for modals and dialogs with keyboard navigation support.

```vue
<script setup>
import { ref } from "vue";
import { useFocusTrap } from "@/composables/useFocusTrap";

const modalRef = ref(null);
const isOpen = ref(false);
const { activate, deactivate } = useFocusTrap(modalRef, isOpen);

const openModal = () => {
  isOpen.value = true;
  activate();
};
</script>
```

## Pattern: Module-Level State

All composables use module-level reactive state for global state management:

```typescript
// Module-level state (shared across all component instances)
const state = ref(initialValue);

// Exported composable function
export const useMyComposable = () => {
  // Methods that manipulate state
  const updateState = (value) => {
    state.value = value;
  };

  return {
    state: readonly(state), // Readonly to prevent external mutations
    updateState,
  };
};
```

This pattern provides:

- **Global state** without external state management libraries
- **Type safety** with TypeScript
- **Encapsulation** through readonly refs
- **Simplicity** with minimal boilerplate

## Testing

All composables have unit tests in `tests/unit/composables/`. Tests verify:

- State initialization
- State updates
- Side effects (localStorage, etc.)
- Edge cases

## Best Practices

1. **Always use `readonly()`** when exposing state to prevent external mutations
2. **Provide functions** for state updates instead of exposing mutable refs
3. **Initialize state safely** with SSR-compatible checks (`typeof window`)
4. **Document all public functions** with JSDoc comments
5. **Keep composables focused** on a single responsibility
