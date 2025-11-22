# Add Comprehensive Component Documentation

**Priority:** Low  
**Type:** Documentation  
**Component:** All Components  
**Effort:** Medium (2-3 days)

## Problem

Components lack comprehensive documentation, making it difficult for new contributors to understand usage and maintain code:

### Current Issues

- No JSDoc comments on props and emits
- Missing component usage examples
- Unclear component responsibilities
- No documentation for complex composables
- Difficult for new contributors to onboard
- No Storybook or component playground

### User Impact

- **Low:** Does not affect end users directly
- Longer onboarding time for contributors
- Increased maintenance difficulty
- Higher chance of breaking changes
- Reduced code discoverability

## Proposed Solution

### Component Documentation Standards

Add comprehensive JSDoc documentation to all components:

````vue
<!-- src/components/Card.vue -->
<script setup lang="ts">
/**
 * Card component - Reusable container with consistent styling
 *
 * @example
 * ```vue
 * <Card padding="p-6" rounded="rounded-xl">
 *   <h2>Title</h2>
 *   <p>Content</p>
 * </Card>
 * ```
 */

/**
 * Component props
 */
interface Props {
  /**
   * Padding classes (Tailwind)
   * @default "p-4"
   * @example "p-6" | "px-4 py-2"
   */
  padding?: string;

  /**
   * Border radius classes (Tailwind)
   * @default "rounded-lg"
   * @example "rounded-xl" | "rounded-2xl"
   */
  rounded?: string;

  /**
   * Box shadow classes (Tailwind)
   * @default "shadow"
   * @example "shadow-lg" | "shadow-2xl"
   */
  shadow?: string;

  /**
   * Border classes (Tailwind)
   * @default ""
   * @example "border border-slate-200"
   */
  border?: string;

  /**
   * Background classes (Tailwind)
   * @default "bg-white dark:bg-slate-800"
   */
  background?: string;
}

const props = withDefaults(defineProps<Props>(), {
  padding: "p-4",
  rounded: "rounded-lg",
  shadow: "shadow",
  border: "",
  background: "bg-white dark:bg-slate-800",
});
</script>
````

### Composable Documentation

````typescript
// src/composables/useGlobalNotices.ts
/**
 * Global toast notification system
 *
 * Manages a queue of user-facing notifications that appear
 * at the top-right of the screen. Supports info, success,
 * error, and warning variants with auto-dismiss.
 *
 * @example
 * ```typescript
 * const { notifySuccess, notifyError } = useGlobalNotices();
 *
 * // Show success message
 * notifySuccess('Settings saved!');
 *
 * // Show error with custom duration
 * notifyError('Failed to load data', 'API Error', {
 *   duration: 5000,
 * });
 * ```
 */
export const useGlobalNotices = () => {
  /**
   * Show an informational notice
   *
   * @param message - Main message text
   * @param title - Optional title (shown above message)
   * @param options - Additional options
   * @param options.duration - Auto-dismiss duration in ms (default: 3000)
   * @param options.action - Optional action callback
   * @param options.actionLabel - Optional action button label
   */
  const notifyInfo = (message: string, title?: string, options?: NoticeOptions): void => {
    // Implementation
  };

  // ... other methods
};
````

### API Documentation

````typescript
// src/api/scryfallApi.ts
/**
 * Fetch a single card by name from Scryfall API
 *
 * Uses fuzzy matching to find cards even with typos or
 * partial names. Handles double-faced cards by stripping
 * the back face name.
 *
 * @param name - Card name (can include // for double-faced)
 * @returns Promise resolving to card data or null if not found
 * @throws {AppError} If API request fails
 *
 * @example
 * ```typescript
 * const card = await getCardByName('Lightning Bolt');
 * if (card) {
 *   console.log(card.name, card.prices.usd);
 * }
 * ```
 */
export async function getCardByName(name: string): Promise<ScryfallCard | null> {
  // Implementation
}

/**
 * Fetch multiple cards in batches from Scryfall API
 *
 * Batches requests into groups of 75 cards (API limit) with
 * 300ms delay between batches to respect rate limiting.
 *
 * @param names - Array of card names to fetch
 * @returns Promise resolving to Map of name → card data
 *
 * @example
 * ```typescript
 * const cards = await getCardsByNames([
 *   'Sol Ring',
 *   'Command Tower',
 *   'Arcane Signet',
 * ]);
 *
 * for (const [name, card] of cards) {
 *   console.log(`${name}: $${card.prices.usd}`);
 * }
 * ```
 */
export async function getCardsByNames(names: string[]): Promise<Map<string, ScryfallCard>> {
  // Implementation
}
````

## Technical Considerations

### Files to Document

**High Priority**

- All composables (8 files)
- Core components (CButton, CText, Card)
- API files (scryfallApi.ts, errorHandler.ts)
- Main components (EdhrecReader, CommanderSearch, CardTable)

**Medium Priority**

- Helper utilities (slugifyCommander, csvValidator)
- Type definitions (cards.ts, enums)
- Minor components

**Low Priority**

- Test files (add describe blocks)
- Configuration files

### Documentation Tools

**Option 1: JSDoc + TypeDoc**

```bash
npm install -D typedoc
```

```json
// package.json
{
  "scripts": {
    "docs": "typedoc --out docs/api src"
  }
}
```

**Option 2: VitePress Component Docs**

```bash
npm install -D vitepress
```

**Option 3: Storybook (Future)**

- Full component playground
- Interactive examples
- Visual regression testing

### README per Directory

````markdown
<!-- src/components/README.md -->

# Components

This directory contains all Vue components used in Commander Scout.

## Organization

- `/core` - Reusable UI primitives (buttons, text, cards)
- `/helpers` - Utility files and type definitions
- Root - Feature components

## Core Components

### Card.vue

Reusable container component with customizable styling.

**Props:**

- `padding` (string) - Tailwind padding classes
- `rounded` (string) - Tailwind border radius
- ...

**Usage:**

```vue
<Card padding="p-6">
  <h2>Title</h2>
</Card>
```
````

### CButton.vue

Accessible button component with variants.

...

```

## Implementation Plan

### Phase 1: Core Documentation (Day 1)

1. Add JSDoc to composables
2. Document API functions
3. Add README to composables/
4. Add README to api/

### Phase 2: Component Documentation (Day 2)

1. Add JSDoc to core components
2. Document main feature components
3. Add examples to complex components
4. Add README to components/

### Phase 3: Automated Documentation (Day 3)

1. Set up TypeDoc
2. Generate API documentation
3. Add docs npm script
4. Update CONTRIBUTING.md

## Acceptance Criteria

- [ ] All composables have JSDoc comments
- [ ] All public API functions documented
- [ ] Core components have usage examples
- [ ] Each directory has README
- [ ] TypeDoc generates clean API docs
- [ ] npm run docs works without errors
- [ ] CONTRIBUTING.md references documentation

## Example Output

### Generated TypeDoc Site

```

docs/api/
├── index.html
├── modules.html
├── composables/
│ ├── useTheme.html
│ ├── useGlobalNotices.html
│ └── ...
├── api/
│ ├── scryfallApi.html
│ └── errorHandler.html
└── components/
└── ...

```

## Related Issues

- Developer experience improvements
- Onboarding documentation

## References

- [JSDoc - Documentation](https://jsdoc.app/)
- [TypeDoc - API Documentation](https://typedoc.org/)
- [VitePress - Vue Documentation](https://vitepress.dev/)
- [TSDoc - TypeScript Standard](https://tsdoc.org/)
```
