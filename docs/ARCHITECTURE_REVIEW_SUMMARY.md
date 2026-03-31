# Architecture Review Summary

**Review Date:** 2026-03-31  
**Review Scope:** Current production architecture and documentation state  
**Status:** Active

## Executive Summary

Commander Scout's architecture is in a stronger state than the November 2025 review reflected. The major performance-oriented architecture items from that earlier backlog are now implemented: persistent card caching, in-flight request deduplication, virtualized card rendering, route-based lazy loading, component-level async boundaries, and bundle analysis in CI.

The codebase is still fundamentally sound: a Vue 3 SPA with composable-driven state, a thin router, and a feature split that is easy to navigate. The current architecture risk is no longer "missing core performance primitives." It is keeping a growing route shell manageable while improving error recovery and preserving a clear offline strategy.

## What Was Validated

This summary was checked against the current implementation in:

- [../ARCHITECTURE.md](../ARCHITECTURE.md)
- [../src/api/indexedDbCache.ts](../src/api/indexedDbCache.ts)
- [../src/api/requestCache.ts](../src/api/requestCache.ts)
- [../src/components/CardTable.vue](../src/components/CardTable.vue)
- [../src/router/index.ts](../src/router/index.ts)
- [../src/App.vue](../src/App.vue)
- [../src/components/Dashboard.vue](../src/components/Dashboard.vue)
- [../vite.config.ts](../vite.config.ts)
- [../.github/workflows/ci.yml](../.github/workflows/ci.yml)

## Current Strengths

### 1. The 2025 high-priority architecture work is mostly landed

- `indexedDbCache.ts` persists Scryfall card data with TTL-based eviction.
- `requestCache.ts` deduplicates concurrent EDHREC and Scryfall requests.
- `CardTable.vue` supports virtualization and progressive rendering for large result sets.
- The router lazy-loads route surfaces, and several optional UI surfaces load asynchronously with `defineAsyncComponent`.
- CI runs `build`, `bundle:analyze`, `size`, unit tests, and Playwright E2E coverage.

### 2. The state model remains pragmatic

- Shared behavior lives in composables instead of a heavy global store.
- Route state is intentionally thin and synchronized through `useEdhrecRouteState.ts`.
- Local persistence is limited to preferences and recent commanders, while collection data stays in memory.

### 3. The architecture documentation is better than average

- [../ARCHITECTURE.md](../ARCHITECTURE.md) is current and already reflects implemented caching, deduplication, and virtualization.
- API and composable layers have local README files and inline documentation.
- Test coverage exists around the newer infrastructure pieces, including CSP sync, request cache behavior, IndexedDB cache behavior, and code splitting expectations.

## Current Risks

### High

#### 1. Route orchestration is getting dense in the commander workflow

The commander route now coordinates route state, EDHREC fetches, Scryfall enrichment, section expansion state, export state, floating navigation, and collection overlays across multiple composables and shells. This is still working, but the coordination surface is large enough that new feature work could begin to introduce coupling between route layout concerns and data orchestration.

**Why it matters:** Future growth is most likely to create friction in the dashboard and commander-detail flow, not in low-level API utilities.

**Recommendation:** Keep the route shell thin and continue pushing domain logic downward into focused composables or feature modules as new capabilities land.

### Medium

#### 2. Error recovery is still weaker than the rest of the architecture

The app has centralized error handling and telemetry, but it still lacks a clear route-level error boundary or recovery shell for component failures. A thrown rendering error in the wrong place can still degrade a large chunk of a route.

**Recommendation:** Add route-level failure isolation for the dashboard workspace and top-commanders route before adding more cross-cutting UI features.

#### 3. Offline support is still partial by design

The app now caches public Scryfall responses, but it is not a true offline-capable shell. EDHREC remains network-dependent, there is no service worker, and the user-facing experience is still online-first.

**Recommendation:** Treat offline support as a deliberate product decision. Either keep it explicitly out of scope, or define a narrow offline story instead of letting caching imply fuller support than the UI can actually provide.

### Low

#### 4. Documentation and historical backlog drift can mislead contributors

The biggest documentation problem is not missing architecture detail. It is stale review material that still describes completed work as open. That creates a planning tax for anyone trying to understand what is truly left.

**Recommendation:** Keep the active review set small and clearly separate from archived backlog material.

## Status Against The 2025 Architecture Backlog

| 2025 Item | Current Status | Notes |
| --- | --- | --- |
| IndexedDB caching | Landed | Implemented in `src/api/indexedDbCache.ts` |
| Virtual scrolling | Landed | Implemented in `src/components/CardTable.vue` |
| Code splitting and lazy loading | Landed | Route and component async loading are both present |
| Request deduplication | Landed | Implemented in `src/api/requestCache.ts` and used by API layers |
| Automated dependency updates | Landed | `.github/dependabot.yml` exists |
| Error boundaries | Open | Still worth doing |
| PWA / offline shell | Open | Still optional, not implemented |
| Expanded component documentation | Partial | Strong for core/API/composables, lighter for route shells |
| E2E coverage expansion | Partial | Good baseline exists, but can still expand |

## Recommended Next Tranche

1. Add route-level error boundaries or failure-recovery shells.
2. Define whether offline support is intentionally narrow or a future feature area.
3. Keep decomposing dense route orchestration as commander-detail behavior grows.
4. Continue treating historical issue documents as archive material, not as live status.

## Conclusion

Commander Scout no longer has the same architecture profile it had in late 2025. The highest-value architectural work from that period has already been implemented, and it shows in the current codebase. The next set of improvements is about resilience and maintainability, not missing fundamentals.

For implementation detail, use [../ARCHITECTURE.md](../ARCHITECTURE.md). For active review navigation, start at [REVIEWS_COMPLETE.md](./REVIEWS_COMPLETE.md).
