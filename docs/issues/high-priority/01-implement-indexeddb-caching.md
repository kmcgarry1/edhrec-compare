# Implement IndexedDB Caching for Scryfall API

**Priority:** High  
**Type:** Performance Enhancement  
**Component:** API Layer (scryfallApi.ts)  
**Effort:** Medium (2-4 days)

## Problem

Currently, the application fetches card data from Scryfall API on every commander search, resulting in:

### Current Issues

- Repeated API calls for frequently viewed cards (Sol Ring, Arcane Signet, etc.)
- 300ms delay between batches adds up over multiple searches
- No offline functionality - app completely breaks without internet
- Poor experience for users who frequently view the same commanders
- Unnecessary load on Scryfall's public API
- Slow data loading on subsequent visits to same commanders

### User Impact

- **High:** Users wait 1-5 seconds for card data they've already loaded before
- Poor user experience when switching between filters (bracket, modifier)
- Data usage concerns for mobile users on metered connections
- Application unusable offline or on slow/unreliable connections

## Proposed Solution

### IndexedDB Caching Strategy

Implement a multi-layer caching system using IndexedDB:

1. **Card Data Cache**
   - Store full Scryfall card objects by card ID
   - TTL: 7 days (cards rarely change)
   - Index by: card name, ID, and normalized name variants

2. **Symbol Cache**
   - Store mana symbol SVG URIs
   - TTL: 30 days (symbols never change)
   - Load once per session from cache

3. **EDHREC Data Cache** (Optional)
   - Cache EDHREC JSON responses by commander slug + filters
   - TTL: 24 hours (data updates daily)
   - Reduce repeated EDHREC API calls

4. **Cache Invalidation Strategy**
   - Background refresh for expired entries
   - Manual cache clear button in settings
   - Version-based invalidation for app updates

### Implementation Approach

```typescript
// src/api/indexedDbCache.ts
interface CachedCard {
  id: string;
  data: ScryfallCard;
  timestamp: number;
  expiresAt: number;
}

class CardCache {
  private db: IDBDatabase;
  private readonly DB_NAME = "commander-scout-cache";
  private readonly CARD_STORE = "cards";
  private readonly SYMBOL_STORE = "symbols";
  private readonly TTL = 7 * 24 * 60 * 60 * 1000; // 7 days

  async init(): Promise<void> {
    // Initialize IndexedDB with version migrations
  }

  async getCachedCard(name: string): Promise<ScryfallCard | null> {
    // Check cache first, return if valid
  }

  async setCachedCard(name: string, card: ScryfallCard): Promise<void> {
    // Store with expiration timestamp
  }

  async clearExpired(): Promise<void> {
    // Background cleanup of expired entries
  }

  async clearAll(): Promise<void> {
    // Manual cache clear
  }
}
```

### Cache-First API Pattern

```typescript
// Modified getCardsByNames in scryfallApi.ts
export async function getCardsByNames(names: string[]): Promise<Map<string, ScryfallCard>> {
  const cache = await getCardCache();
  const results = new Map<string, ScryfallCard>();
  const uncachedNames: string[] = [];

  // 1. Check cache first
  for (const name of names) {
    const cached = await cache.getCachedCard(name);
    if (cached) {
      results.set(name, cached);
    } else {
      uncachedNames.push(name);
    }
  }

  // 2. Fetch uncached from API
  if (uncachedNames.length > 0) {
    const freshCards = await fetchFromScryfall(uncachedNames);

    // 3. Store in cache for next time
    for (const [name, card] of freshCards) {
      await cache.setCachedCard(name, card);
      results.set(name, card);
    }
  }

  return results;
}
```

## Technical Considerations

### Files to Create

- `src/api/indexedDbCache.ts` - IndexedDB abstraction layer
- `src/composables/useCardCache.ts` - Vue composable for cache management
- `src/utils/cacheHelpers.ts` - TTL calculations, version management

### Files to Modify

- `src/api/scryfallApi.ts` - Add cache-first pattern
- `src/composables/useScryfallSymbols.ts` - Cache symbol URIs
- `src/components/ToolkitHeader.vue` - Add cache clear button (optional)

### IndexedDB Schema

```typescript
// Database: commander-scout-cache v1
{
  cards: {
    keyPath: 'id',
    indexes: [
      { name: 'name', keyPath: 'name', unique: false },
      { name: 'expiresAt', keyPath: 'expiresAt', unique: false }
    ]
  },
  symbols: {
    keyPath: 'symbol',
    indexes: [
      { name: 'expiresAt', keyPath: 'expiresAt', unique: false }
    ]
  },
  metadata: {
    keyPath: 'key'
  }
}
```

### Cache Size Management

```typescript
// Limit cache to reasonable size
const MAX_CACHE_SIZE = 50 * 1024 * 1024; // 50 MB
const MAX_CARDS = 5000; // ~5000 unique cards typical

// LRU eviction if limits exceeded
async evictLeastRecentlyUsed(count: number): Promise<void>
```

### Progressive Enhancement

```typescript
// Gracefully degrade if IndexedDB unavailable
let cacheAvailable = false;

try {
  await openDatabase();
  cacheAvailable = true;
} catch (err) {
  console.warn("IndexedDB unavailable, using direct API calls");
  // Fall back to current behavior
}
```

## Implementation Plan

### Phase 1: Core Cache Infrastructure (Day 1-2)

1. Create IndexedDB wrapper with async/await API
2. Implement basic get/set operations with TTL
3. Add database versioning and migrations
4. Unit test cache operations

### Phase 2: Scryfall Integration (Day 2-3)

1. Modify `getCardsByNames` to check cache first
2. Add background cache population on app load
3. Test with various commander scenarios
4. Measure performance improvements

### Phase 3: Symbol Caching (Day 3)

1. Cache mana symbols on first load
2. Persist symbol SVG URIs in IndexedDB
3. Reduce symbol API calls to zero after first load

### Phase 4: Cache Management (Day 4)

1. Add cache statistics to dev console
2. Implement manual cache clear
3. Add background cleanup of expired entries
4. Document cache behavior in README

## Acceptance Criteria

- [ ] Scryfall API calls reduced by 80%+ for repeat commander views
- [ ] Cache hit rate > 70% for active users
- [ ] Loading time reduced from 2-5s to < 500ms for cached commanders
- [ ] Cache size stays under 50 MB for typical usage
- [ ] Graceful fallback if IndexedDB unavailable (Safari private mode)
- [ ] Expired entries automatically cleaned up
- [ ] Unit tests for cache operations (get, set, evict, expire)
- [ ] E2E test: view commander, reload page, verify cached load

## Performance Targets

### Before Caching

- First commander load: 2-5 seconds (API fetch + processing)
- Repeat commander load: 2-5 seconds (no caching)
- Data transfer: 500 KB - 2 MB per search

### After Caching

- First commander load: 2-5 seconds (unchanged, must fetch)
- Repeat commander load: < 500ms (cache hit)
- Data transfer: Near-zero for cached commanders
- Cache hit rate: 70%+ for active users

## Security & Privacy Considerations

- IndexedDB is origin-isolated (secure)
- No personal data stored (only public card data)
- Cache cleared on browser cache clear
- Respect user privacy settings
- No cross-origin data leakage

## Alternative Approaches Considered

1. **LocalStorage Cache** - Dismissed: 5-10 MB limit too small
2. **Service Worker Cache** - Considered: More complex, less flexible
3. **In-Memory Cache Only** - Dismissed: Lost on page refresh
4. **Dexie.js Library** - Considered: Adds 15 KB, could simplify code

## Related Issues

- #72 - Empty state design (show cache stats)
- #74 - Loading state visibility (differentiate cached vs API loads)
- Performance optimization overall

## References

- [IndexedDB API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
- [Dexie.js - IndexedDB Wrapper](https://dexie.org/)
- [Workbox - Service Worker Libraries](https://developers.google.com/web/tools/workbox)
- [Cache Strategies - Web.dev](https://web.dev/offline-cookbook/)
