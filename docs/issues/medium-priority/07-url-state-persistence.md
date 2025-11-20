# 🔗 Implement URL state persistence with routing

**Labels:** `feature`, `medium-priority`

## Problem
- Selected commander not in URL
- Filters not in URL
- Can't share or bookmark specific views
- Browser back/forward doesn't work
- `vue-router` stub exists but unused

## Impact
- Poor UX - can't share decklists
- No deep linking
- Poor SEO
- Confusing stub in codebase

## Proposed Solution

### Option 1: Implement Full Routing
1. Remove `src/stubs/vue-router.ts`
2. Install actual `vue-router`
3. Create routes:
   - `/` - Home with onboarding
   - `/commander/:slug` - Specific commander view
   - `?bracket=X&modifier=Y` - Query params for filters

### Option 2: URL State Without Routing
Use URL query params without vue-router:
```typescript
// composables/useUrlState.ts
export function useUrlState() {
  const updateUrl = (params: Record<string, string>) => {
    const url = new URL(window.location.href);
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
    window.history.pushState({}, '', url);
  };
  
  const readUrl = () => {
    const params = new URLSearchParams(window.location.search);
    return Object.fromEntries(params);
  };
  
  return { updateUrl, readUrl };
}
```

### Option 3: Remove Router Stub
If routing not needed, clean up the stub to avoid confusion.

## Recommended: Option 1
Full routing provides best UX and is most maintainable.

## Implementation Steps
1. Install vue-router
2. Create router configuration
3. Update App.vue to use router-view
4. Sync state with URL
5. Add tests for routing
6. Update documentation

## Success Criteria
- Can share URL with specific commander/filters
- Browser back/forward works
- Bookmarks work
- Deep linking works
