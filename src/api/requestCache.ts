/**
 * Request cache for deduplicating in-flight API requests
 *
 * Prevents duplicate simultaneous requests to the same endpoint by caching
 * promises during their execution. Automatically cleans up expired entries
 * to prevent memory leaks.
 *
 * @module api/requestCache
 *
 * @example
 * ```typescript
 * import { requestCache } from '@/api/requestCache';
 *
 * // Multiple concurrent calls will share the same promise
 * const promise1 = requestCache.dedupe('user-data', () => fetchUser());
 * const promise2 = requestCache.dedupe('user-data', () => fetchUser());
 * // Only one actual fetch occurs, both promises resolve to same result
 * ```
 */

type PendingRequest<T> = Promise<T>;
type RequestKey = string;

/**
 * Cached request entry with promise and timestamp
 */
interface CachedRequest<T> {
  /** The in-flight promise */
  promise: PendingRequest<T>;
  /** When the request was initiated */
  timestamp: number;
}

/**
 * Request cache implementation for deduplicating API calls
 */
class RequestCache {
  private pending = new Map<RequestKey, CachedRequest<unknown>>();
  private readonly TTL = 30000; // 30 seconds
  private cleanupInterval: ReturnType<typeof setInterval> | null = null;

  /**
   * Deduplicate a request by key
   *
   * If a request with the same key is already in-flight, returns the existing
   * promise. Otherwise, executes the fetcher and caches the promise until it
   * completes. Prevents duplicate simultaneous requests to the same resource.
   *
   * @param key - Unique identifier for the request
   * @param fetcher - Function that performs the actual request
   * @returns Promise that resolves to the request result
   *
   * @example
   * ```typescript
   * // Deduplicate Scryfall card fetches
   * const card = await requestCache.dedupe(
   *   `card:${cardName}`,
   *   () => fetch(`/api/cards/${cardName}`).then(r => r.json())
   * );
   * ```
   */
  async dedupe<T>(key: RequestKey, fetcher: () => Promise<T>): Promise<T> {
    const cached = this.pending.get(key) as CachedRequest<T> | undefined;

    // Return existing promise if still pending and not expired
    if (cached && Date.now() - cached.timestamp < this.TTL) {
      return cached.promise;
    }

    // Create new request
    const promise = fetcher().finally(() => {
      // Clean up after a short delay to allow sharing between rapid requests
      // Only delete if this is still the same promise instance (no race condition)
      setTimeout(() => {
        const current = this.pending.get(key) as CachedRequest<T> | undefined;
        if (current && current.promise === promise) {
          this.pending.delete(key);
        }
      }, 1000);
    });

    this.pending.set(key, { promise, timestamp: Date.now() });
    return promise;
  }

  /**
   * Clear all pending requests from the cache
   */
  clear(): void {
    this.pending.clear();
  }

  /**
   * Check if a request with the given key is currently cached
   *
   * @param key - Request key to check
   * @returns True if request is in cache
   */
  has(key: RequestKey): boolean {
    return this.pending.has(key);
  }

  /**
   * Get the number of currently cached requests
   *
   * @returns Number of cached requests
   */
  size(): number {
    return this.pending.size;
  }

  /**
   * Start periodic cleanup of expired entries
   *
   * Runs every minute to remove stale entries and prevent memory leaks.
   * Automatically called on module initialization.
   */
  startCleanup(): void {
    if (this.cleanupInterval) {
      return;
    }

    this.cleanupInterval = setInterval(() => {
      // Skip cleanup if cache is empty
      if (this.pending.size === 0) {
        return;
      }

      const now = Date.now();
      for (const [key, { timestamp }] of this.pending) {
        if (now - timestamp > this.TTL) {
          this.pending.delete(key);
        }
      }
    }, 60000); // Every minute
  }

  /**
   * Stop the periodic cleanup interval
   */
  stopCleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }
}

/**
 * Singleton request cache instance
 *
 * Shared across the application for consistent request deduplication.
 */
export const requestCache = new RequestCache();

// Start cleanup on module load
requestCache.startCleanup();
