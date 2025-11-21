# Commander Scout - AI Coding Instructions

This is a Vue 3 + TypeScript SPA for comparing EDHREC commander data with personal MTG card inventories. All state is client-side (no backend). Scryfall and EDHREC JSON APIs are fetched directly from the browser.

## Architecture & Patterns

### State Management (No Vuex/Pinia)

- Use **module-level reactive refs** in composables for global state
- Pattern: `const state = ref(...)` at module level, export via composable function
- Example: `useTheme.ts`, `useGlobalNotices.ts`, `useCsvUpload.ts`
- Return `readonly(ref)` to prevent external mutations; expose functions for updates

```typescript
// composables/useThing.ts
const data = ref<Data>([]);

export const useThing = () => {
  const addData = (item: Data) => data.value.push(item);
  return { data: readonly(data), addData };
};
```

### Component Pattern (Composition API Only)

- Always use `<script setup lang="ts">` with TypeScript
- No Options API - use Composition API exclusively
- Import composables at component top, destructure what you need
- Computed values for derived state, reactive refs for local state

```vue
<script setup lang="ts">
import { computed, ref } from "vue";
import { useTheme } from "@/composables/useTheme";

const { theme, toggleTheme } = useTheme();
const localState = ref("");
const derived = computed(() => localState.value.toUpperCase());
</script>
```

### Error Handling

- Wrap all API calls with `apiCall` wrapper from `src/api/errorHandler.ts`
- Automatically shows toast notifications via `useGlobalNotices` composable
- Example: `apiCall(() => fetch(...), "Error message", { context: "functionName" })`
- For user-facing errors, call `notifyError(message)` from `useGlobalNotices`

### API Integration

1. **Scryfall API** (`src/api/scryfallApi.ts`):
   - Batch card fetches in groups of 75 (API limit)
   - Add 300ms delay between batches to respect rate limits
   - Sanitize card names: remove `//` suffix for double-faced cards
   - Handle both `image_uris` and `card_faces[].image_uris` for images

2. **EDHREC JSON API**:
   - URL pattern: `https://json.edhrec.com/pages/{pageType}/{slug}/{bracket}/{modifier}/{companion}.json`
   - Build slugs with `slugifyCommander` util (lowercase, hyphens, sorted for partners)
   - Partner commanders: sort slugs alphabetically, join with hyphen

### Testing Requirements

- **Unit tests** (Vitest): Required for utils, composables, and new business logic
- **E2E tests** (Playwright): Required for new user workflows
- Test files mirror `src/` structure in `tests/unit/` directory
- Use `.spec.ts` extension (not `.test.ts`)
- Mock external APIs in E2E tests using `page.route()` patterns (see `tests/e2e/app.spec.ts`)

```typescript
// tests/unit/utils/myUtil.spec.ts
import { describe, it, expect } from "vitest";
import { myUtil } from "@/utils/myUtil";

describe("myUtil", () => {
  it("handles basic case", () => {
    expect(myUtil("input")).toBe("expected");
  });
});
```

## Key Conventions

### File Organization

- `src/api/` - External API wrappers (Scryfall, error handler)
- `src/components/` - Flat structure; `core/` subfolder for reusable UI components
- `src/composables/` - Global state and reusable Composition API logic
- `src/utils/` - Pure functions with no Vue dependencies
- `src/types/` - Shared TypeScript interfaces

### Naming Conventions

- Components: PascalCase (e.g., `CommanderSearch.vue`)
- Composables: `use` prefix (e.g., `useTheme.ts`)
- Utils: camelCase, descriptive (e.g., `slugifyCommander.ts`)
- Component props: camelCase in script, kebab-case in templates

### Styling (Tailwind CSS)

- Utility-first with Tailwind v4
- Dark mode via `dark:` variants (class-based strategy)
- Responsive breakpoints: `sm:`, `md:`, `lg:`, `xl:`
- Color palette: slate (neutral), emerald (primary), red (error), blue (info)

### Build & Deploy

- Uses **Rolldown** (Rust-based Vite variant) for faster builds
- Aliased as `npm:rolldown-vite@7.2.2` in package.json
- No routing library - vue-router stubbed out (`src/stubs/vue-router.ts`)
- Bundle analysis: `npm run build:analyze` generates treemap in `coverage/`

## Development Workflow

```bash
# Start dev server (http://localhost:5173)
npm run dev

# Run all unit tests
npm run test:unit

# Run tests in watch mode
npm run test:unit:watch

# Check test coverage
npm run test:unit:coverage

# Run E2E tests
npm run test:e2e

# Lint code
npm run lint

# Format code
npm run format
```

### Git Hooks (Husky + lint-staged)

- Pre-commit: Auto-formats and lints changed files
- Pre-push: Runs unit tests (must pass to push)

### Commit Message Format

Use Conventional Commits:

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation only
- `test:` - Test additions/updates
- `refactor:` - Code restructure without behavior change
- `chore:` - Maintenance (deps, config)

## Critical Implementation Details

### CSV Upload Flow

- Parser in `src/composables/useCsvUpload.ts`
- Auto-detects "Name" column (case-insensitive), defaults to first column
- Normalizes names: stores all variants of double-faced cards (`"A // B"` → `["A", "B", "A // B"]`)
- No persistence - data lives in memory only

### Loading States

- Use `useGlobalLoading` composable with scoped identifiers
- Multiple concurrent operations tracked via Map<scope, count>
- Display with `<GlobalLoadingBanner scope="scope-name">` component

### Toast Notifications

- Use `notifyError`, `notifyInfo`, `notifySuccess` from `useGlobalNotices`
- Auto-dismiss after 6 seconds (configurable)
- Rendered by `<GlobalNoticeStack>` in root App component

### Accessibility

- All interactive elements need keyboard navigation
- Use semantic HTML (`<button>`, `<label>`, `<input>`)
- ARIA labels for icon-only buttons
- Test with keyboard only (Tab, Enter, Escape)

## Common Pitfalls to Avoid

1. **Don't** add new state management libraries (Vuex/Pinia) - use composables
2. **Don't** use Options API - Composition API only
3. **Don't** forget rate limiting on Scryfall batch requests (300ms delay)
4. **Don't** test implementation details - test behavior and user-facing results
5. **Don't** use inline styles or `v-html` (CSP violations)
6. **Don't** mutate props directly - emit events to parent
7. **Don't** forget to sanitize card names before Scryfall lookups (remove `//`)

## When Making Changes

1. Read existing patterns in similar files before implementing
2. Add tests for new business logic (utils, composables)
3. Update component tests if changing component contracts
4. Run `npm run lint` and fix warnings before committing
5. For breaking changes, discuss in issue first
6. Document "why" in code comments for non-obvious decisions

## Key Files to Reference

- **State patterns**: `src/composables/useTheme.ts`, `src/composables/useGlobalNotices.ts`
- **API patterns**: `src/api/scryfallApi.ts`, `src/api/errorHandler.ts`
- **Component patterns**: `src/components/CommanderSearch.vue`, `src/components/Card.vue`
- **Test patterns**: `tests/unit/utils/slugifyCommander.spec.ts`, `tests/e2e/app.spec.ts`
- **Build config**: `vite.config.ts`, `vitest.config.ts`, `eslint.config.js`

For architecture deep-dives, see `ARCHITECTURE.md`. For contribution guidelines, see `CONTRIBUTING.md`.
