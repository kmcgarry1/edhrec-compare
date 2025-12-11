# API Layer

This directory contains all external API integrations and client-side caching infrastructure.

## Overview

The API layer provides:

- **Scryfall API** integration for MTG card data
- **Error handling** with user notifications and tracking
- **Request deduplication** to prevent duplicate API calls
- **IndexedDB caching** for persistent client-side storage

## Files

### `scryfallApi.ts`

Scryfall API integration with batch processing and rate limiting.

**Key Functions:**

- `getCard(cardName)` - Fetch single card with fuzzy matching
- `getCardImage(cardName)` - Get card image URL
- `searchCardNames(partialName)` - Search for commander names
- `getCardsByNames(cardNames, onProgress)` - Batch fetch multiple cards
- `getAllSymbols()` - Fetch mana symbols
- `getCardPrintings(printsSearchUri)` - Fetch all printings of a card

**Features:**

- Automatic batching (75 cards per request)
- 300ms delay between batches for rate limiting
- Double-faced card name sanitization
- IndexedDB caching integration
- Request deduplication

**Example:**

```typescript
import { getCard, getCardsByNames } from "@/api/scryfallApi";

// Single card
const bolt = await getCard("Lightning Bolt");

// Batch fetch with progress
const cards = await getCardsByNames(
  [{ name: "Sol Ring" }, { name: "Command Tower" }],
  (current, total) => console.log(`${current}/${total} batches`)
);
```

### `errorHandler.ts`

Centralized error handling with automatic user notifications.

**Key Exports:**

- `apiCall<T>(fn, errorMessage, options)` - Wrap API calls with error handling
- `AppError` - Custom error class with user-facing messages
- `handleError()` - Global error handler
- `installGlobalErrorHandler(app)` - Vue error handler installation

**Example:**

```typescript
import { apiCall, AppError } from "@/api/errorHandler";

// Wrap API calls
const data = await apiCall(() => fetch("/api/data").then((r) => r.json()), "Failed to load data", {
  context: "MyComponent",
});

// Custom errors
throw new AppError("Internal error message", "User-friendly message", "ERROR_CODE");
```

### `requestCache.ts`

In-memory request deduplication to prevent duplicate concurrent requests.

**Features:**

- Deduplicates identical in-flight requests
- 30-second TTL for cached promises
- Automatic cleanup of expired entries
- Singleton pattern for app-wide sharing

**Example:**

```typescript
import { requestCache } from "@/api/requestCache";

// Multiple concurrent calls share the same promise
const promise1 = requestCache.dedupe("user-data", () => fetchUser());
const promise2 = requestCache.dedupe("user-data", () => fetchUser());
// Only one actual fetch occurs
```

**API:**

- `dedupe<T>(key, fetcher)` - Deduplicate request
- `clear()` - Clear all cached requests
- `has(key)` - Check if request is cached
- `size()` - Get number of cached requests
- `startCleanup()` - Start periodic cleanup (automatic)
- `stopCleanup()` - Stop periodic cleanup

### `indexedDbCache.ts`

Persistent client-side caching using IndexedDB.

**Features:**

- 7-day TTL for cached data
- Automatic cache initialization
- Graceful fallback if IndexedDB unavailable
- Separate stores for cards and symbols

**Key Methods:**

- `getCachedCard(cacheKey)` - Retrieve cached card
- `setCachedCard(cacheKey, data)` - Store card in cache
- `clearExpired()` - Remove expired entries
- `init()` - Initialize database connection

**Example:**

```typescript
import { cardCache } from "@/api/indexedDbCache";

// Check cache before API call
const cached = await cardCache.getCachedCard("sol-ring");
if (cached) {
  return cached;
}

// Store in cache after fetch
const card = await fetchFromApi();
await cardCache.setCachedCard("sol-ring", card);
```

## Architecture

### Request Flow

```
Component/Composable
    ↓
  apiCall() wrapper (errorHandler.ts)
    ↓
  requestCache.dedupe() (requestCache.ts)
    ↓
  Check indexedDbCache (indexedDbCache.ts)
    ↓
  Fetch from Scryfall API (scryfallApi.ts)
    ↓
  Store in indexedDbCache
    ↓
  Return to caller
```

### Error Handling Flow

```
API Error
    ↓
  apiCall() wrapper catches
    ↓
  handleError() normalizes
    ↓
  captureError() → Sentry (production)
    ↓
  notifyError() → Toast notification (if notify: true)
    ↓
  Throw or return fallback value
```

## Caching Strategy

### Three-Level Caching

1. **Request Cache** (in-memory, 30 seconds)
   - Deduplicates concurrent requests
   - Prevents duplicate API calls within the same session
   - Automatically cleaned up

2. **IndexedDB Cache** (persistent, 7 days)
   - Stores card data across sessions
   - Reduces API calls on repeat visits
   - Automatic expiration and cleanup

3. **Scryfall CDN**
   - Images and assets served from Scryfall's CDN
   - Browser HTTP caching applies

### Cache Keys

All cache keys are normalized to lowercase for consistency:

```typescript
const cacheKey = cardName.trim().toLowerCase();
```

## Rate Limiting

Scryfall rate limiting is respected through:

- **Batch size limit**: 75 cards per request
- **Inter-batch delay**: 300ms between batch requests
- **Request deduplication**: Prevents duplicate simultaneous requests

## Error Handling Best Practices

1. **Always use `apiCall()`** wrapper for API calls
2. **Provide user-friendly error messages** as the second parameter
3. **Use `suppressError: true`** with `fallbackValue` for non-critical data
4. **Add context** to help with debugging (component name, operation)
5. **Let errors bubble** for critical operations (don't suppress)

Example:

```typescript
// Non-critical data - return empty array on error
const suggestions = await apiCall(() => searchApi(query), "Failed to load suggestions", {
  suppressError: true,
  fallbackValue: [],
  context: "SearchComponent",
});

// Critical data - let error bubble for handling upstream
const user = await apiCall(() => fetchUser(), "Failed to load user profile", {
  context: "ProfilePage",
});
```

## Testing

All API modules have unit tests in `tests/unit/api/`. Tests use:

- **Vitest** for test running
- **Mock fetch** for API mocking
- **happy-dom** for DOM simulation (IndexedDB)

## Performance Monitoring

In production, Scryfall API calls are monitored via Sentry for:

- Request duration
- Error rates
- Cache hit/miss ratios (via custom tracking)

## Related Documentation

- **Scryfall API**: https://scryfall.com/docs/api
- **IndexedDB**: https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API
- **Error Handling Pattern**: See `ARCHITECTURE.md`
