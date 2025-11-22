# Implement API Request Deduplication

**Priority:** Medium  
**Type:** Performance Enhancement  
**Component:** API Layer  
**Effort:** Small (1-2 days)

## Problem

The application can make duplicate simultaneous API requests when multiple components request the same data:

### Current Issues

- Multiple components may fetch the same Scryfall card simultaneously
- Rapid filter changes trigger duplicate EDHREC requests
- No request deduplication mechanism
- Wasted bandwidth and API quota
- Increased Scryfall API load
- Race conditions with concurrent requests

### User Impact

- **Medium:** Slower loading due to unnecessary duplicate requests
- Inconsistent data if requests complete in different order
- Potential API rate limiting from excessive requests
- Wasted mobile data on duplicate fetches
- Server load on Scryfall's public API

## Proposed Solution

### Request Deduplication Pattern

Implement a request cache that deduplicates in-flight requests:

```typescript
// src/api/requestCache.ts
type PendingRequest<T> = Promise<T>;
type RequestKey = string;

class RequestCache {
  private pending = new Map<RequestKey, PendingRequest<any>>();

  async dedupe<T>(key: RequestKey, fetcher: () => Promise<T>): Promise<T> {
    // Return existing pending request if found
    if (this.pending.has(key)) {
      return this.pending.get(key) as Promise<T>;
    }

    // Create new request
    const request = fetcher().finally(() => {
      // Clean up after completion
      this.pending.delete(key);
    });

    this.pending.set(key, request);
    return request;
  }

  clear(): void {
    this.pending.clear();
  }

  has(key: RequestKey): boolean {
    return this.pending.has(key);
  }
}

export const requestCache = new RequestCache();
```

### Scryfall API Integration

```typescript
// src/api/scryfallApi.ts
import { requestCache } from "./requestCache";

export async function getCardByName(name: string): Promise<ScryfallCard | null> {
  const cacheKey = `scryfall:card:${name.toLowerCase()}`;

  return requestCache.dedupe(cacheKey, async () => {
    const sanitized = sanitizeCardName(name);
    const url = `https://api.scryfall.com/cards/named?fuzzy=${encodeURIComponent(sanitized)}`;

    return apiCall(
      async () => {
        const response = await fetch(url);
        if (!response.ok) {
          if (response.status === 404) return null;
          throw new Error(`Scryfall API error: ${response.status}`);
        }
        return response.json();
      },
      `Failed to fetch card: ${name}`,
      { context: "getCardByName" }
    );
  });
}

export async function getCardsByNames(names: string[]): Promise<Map<string, ScryfallCard>> {
  // Deduplicate the input names first
  const uniqueNames = [...new Set(names)];

  // Batch processing with deduplication
  const batchKey = uniqueNames.sort().join(",");
  const cacheKey = `scryfall:batch:${batchKey}`;

  return requestCache.dedupe(cacheKey, async () => {
    // ... existing batch logic
  });
}
```

### EDHREC API Deduplication

```typescript
// src/components/EdhrecReader.vue
import { requestCache } from "../api/requestCache";

const fetchEdhrecData = async (commander: string, filters: EdhrecFilters): Promise<EdhrecData> => {
  const cacheKey = `edhrec:${commander}:${JSON.stringify(filters)}`;

  return requestCache.dedupe(cacheKey, async () => {
    const url = constructEdhrecUrl(commander, filters);
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`EDHREC API error: ${response.status}`);
    }

    return response.json();
  });
};
```

### Debounced Requests

```typescript
// src/composables/useDebouncedRequest.ts
import { ref } from "vue";
import { useDebounceFn } from "@vueuse/core";

export const useDebouncedRequest = <T>(fetcher: () => Promise<T>, delay: number = 300) => {
  const data = ref<T | null>(null);
  const loading = ref(false);
  const error = ref<Error | null>(null);

  const debouncedFetch = useDebounceFn(async () => {
    loading.value = true;
    error.value = null;

    try {
      data.value = await fetcher();
    } catch (err) {
      error.value = err as Error;
    } finally {
      loading.value = false;
    }
  }, delay);

  return { data, loading, error, execute: debouncedFetch };
};
```

### Request Cancellation

```typescript
// src/api/cancellableRequest.ts
export class CancellableRequest<T> {
  private controller: AbortController;

  constructor(private fetcher: (signal: AbortSignal) => Promise<T>) {
    this.controller = new AbortController();
  }

  async execute(): Promise<T> {
    return this.fetcher(this.controller.signal);
  }

  cancel(): void {
    this.controller.abort();
  }
}

// Usage in components
const cancelRef = ref<CancellableRequest<any> | null>(null);

const searchCommander = async (query: string) => {
  // Cancel previous request
  cancelRef.value?.cancel();

  // Create new cancellable request
  cancelRef.value = new CancellableRequest(async (signal) => {
    const response = await fetch(url, { signal });
    return response.json();
  });

  try {
    const results = await cancelRef.value.execute();
    // Process results
  } catch (err) {
    if (err.name === "AbortError") {
      console.log("Request cancelled");
      return;
    }
    throw err;
  }
};
```

## Technical Considerations

### Files to Create

- `src/api/requestCache.ts` - Request deduplication cache
- `src/api/cancellableRequest.ts` - Request cancellation utility
- `src/composables/useDebouncedRequest.ts` - Debounced request composable
- `tests/unit/api/requestCache.spec.ts` - Unit tests

### Files to Modify

- `src/api/scryfallApi.ts` - Add deduplication
- `src/components/EdhrecReader.vue` - Use debounced requests
- `src/components/CommanderSearch.vue` - Cancel on new input

### Memory Management

```typescript
// Add TTL to request cache to prevent memory leaks
class RequestCache {
  private pending = new Map<
    RequestKey,
    {
      promise: PendingRequest<any>;
      timestamp: number;
    }
  >();

  private readonly TTL = 30000; // 30 seconds

  async dedupe<T>(key: RequestKey, fetcher: () => Promise<T>): Promise<T> {
    const cached = this.pending.get(key);

    // Return if still pending and not expired
    if (cached && Date.now() - cached.timestamp < this.TTL) {
      return cached.promise;
    }

    // Create new request
    const promise = fetcher().finally(() => {
      // Clean up after delay to allow sharing
      setTimeout(() => this.pending.delete(key), 1000);
    });

    this.pending.set(key, { promise, timestamp: Date.now() });
    return promise;
  }

  // Periodic cleanup of expired entries
  startCleanup(): void {
    setInterval(() => {
      const now = Date.now();
      for (const [key, { timestamp }] of this.pending) {
        if (now - timestamp > this.TTL) {
          this.pending.delete(key);
        }
      }
    }, 60000); // Every minute
  }
}
```

## Implementation Plan

### Phase 1: Core Deduplication (Day 1)

1. Create RequestCache class
2. Add tests for deduplication logic
3. Integrate with Scryfall API
4. Test with concurrent requests

### Phase 2: Cancellation & Debouncing (Day 2)

1. Implement CancellableRequest utility
2. Add request cancellation to search
3. Integrate debounced requests
4. Test rapid filter changes

## Acceptance Criteria

- [ ] Duplicate simultaneous requests deduplicated
- [ ] Memory usage stable (no leaks from pending requests)
- [ ] Rapid filter changes don't create duplicate requests
- [ ] Request cancellation works for search
- [ ] Unit tests for request cache (80%+ coverage)
- [ ] No regression in functionality
- [ ] Network tab shows reduced duplicate requests

## Performance Targets

### Before Deduplication

- Commander search (typing "Atraxa"): 6 requests (one per letter)
- Filter toggle: 2-3 duplicate EDHREC requests
- Card fetch: 5-10% duplicate Scryfall requests

### After Deduplication

- Commander search (typing "Atraxa"): 1 request (debounced + cancelled)
- Filter toggle: 1 EDHREC request (deduplicated)
- Card fetch: 0% duplicate Scryfall requests

## Testing Strategy

### Unit Tests

```typescript
// tests/unit/api/requestCache.spec.ts
import { requestCache } from "@/api/requestCache";

describe("RequestCache", () => {
  it("deduplicates concurrent requests", async () => {
    let callCount = 0;
    const fetcher = async () => {
      callCount++;
      await delay(100);
      return "result";
    };

    // Make 5 concurrent requests
    const results = await Promise.all([
      requestCache.dedupe("key", fetcher),
      requestCache.dedupe("key", fetcher),
      requestCache.dedupe("key", fetcher),
      requestCache.dedupe("key", fetcher),
      requestCache.dedupe("key", fetcher),
    ]);

    // Should only call fetcher once
    expect(callCount).toBe(1);
    expect(results).toEqual(["result", "result", "result", "result", "result"]);
  });

  it("cleans up after request completion", async () => {
    await requestCache.dedupe("key", async () => "result");

    // Wait for cleanup
    await delay(1100);

    expect(requestCache.has("key")).toBe(false);
  });
});
```

### E2E Tests

```typescript
// tests/e2e/request-deduplication.spec.ts
test("deduplicates rapid filter changes", async ({ page }) => {
  const requests: string[] = [];

  // Track network requests
  page.on("request", (req) => {
    if (req.url().includes("json.edhrec.com")) {
      requests.push(req.url());
    }
  });

  await page.goto("/");
  await selectCommander(page, "Atraxa");

  // Rapidly toggle filters
  for (let i = 0; i < 5; i++) {
    await page.click('[data-testid="bracket-filter"]');
    await delay(50);
  }

  // Should only make 1-2 requests, not 5
  expect(requests.length).toBeLessThan(3);
});
```

## Related Issues

- #01 - IndexedDB caching (complementary optimization)
- Performance optimization overall
- API rate limiting prevention

## References

- [Request Deduplication Pattern](https://kentcdodds.com/blog/optimize-react-re-renders)
- [AbortController - MDN](https://developer.mozilla.org/en-US/docs/Web/API/AbortController)
- [Debouncing - lodash](https://lodash.com/docs/4.17.15#debounce)
