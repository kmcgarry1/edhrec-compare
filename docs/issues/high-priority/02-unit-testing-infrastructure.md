# 🧪 Add unit testing infrastructure with Vitest

**Labels:** `testing`, `high-priority`

## Problem
The project currently only has E2E tests. There are no unit tests for:
- Composables (`useTheme`, `useCsvUpload`, `useGlobalLoading`, etc.)
- Utility functions (`slugifyCommander`, `downloadTextFile`)
- API functions (`scryfallApi.ts`)

## Impact
- High refactoring risk
- Difficult to catch regressions early
- Slow test feedback loop (only E2E tests)
- Edge cases not covered

## Proposed Solution
1. Add Vitest as dev dependency
2. Configure Vitest for Vue 3 + TypeScript
3. Add unit tests for:
   - All composables
   - Utility functions
   - API functions (with mocked fetch)
4. Aim for >80% coverage of core logic

## Example Test Structure
```
tests/
  unit/
    composables/
      useTheme.spec.ts
      useCsvUpload.spec.ts
    utils/
      slugifyCommander.spec.ts
    api/
      scryfallApi.spec.ts
```

## References
- [Vitest](https://vitest.dev/)
- [Vue Test Utils](https://test-utils.vuejs.org/)
