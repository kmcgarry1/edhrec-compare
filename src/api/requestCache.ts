/**
 * Request cache for deduplicating in-flight API requests.
 * Prevents duplicate simultaneous requests to the same endpoint.
 */

type PendingRequest<T> = Promise<T>;
type RequestKey = string;

interface CachedRequest<T> {
  promise: PendingRequest<T>;
  timestamp: number;
}

class RequestCache {
  private pending = new Map<RequestKey, CachedRequest<unknown>>();
  private readonly TTL = 30000; // 30 seconds
  private cleanupInterval: ReturnType<typeof setInterval> | null = null;

  /**
   * Deduplicate a request by key. If a request with the same key is already
   * in-flight, return the existing promise. Otherwise, execute the fetcher
   * and cache the promise until it completes.
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
      setTimeout(() => {
        this.pending.delete(key);
      }, 1000);
    });

    this.pending.set(key, { promise, timestamp: Date.now() });
    return promise;
  }

  /**
   * Clear all pending requests from the cache.
   */
  clear(): void {
    this.pending.clear();
  }

  /**
   * Check if a request with the given key is currently cached.
   */
  has(key: RequestKey): boolean {
    return this.pending.has(key);
  }

  /**
   * Get the number of currently cached requests.
   */
  size(): number {
    return this.pending.size;
  }

  /**
   * Start periodic cleanup of expired entries.
   * This prevents memory leaks from stale entries.
   */
  startCleanup(): void {
    if (this.cleanupInterval) {
      return;
    }

    this.cleanupInterval = setInterval(() => {
      const now = Date.now();
      for (const [key, { timestamp }] of this.pending) {
        if (now - timestamp > this.TTL) {
          this.pending.delete(key);
        }
      }
    }, 60000); // Every minute
  }

  /**
   * Stop the periodic cleanup interval.
   */
  stopCleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }
}

// Export a singleton instance
export const requestCache = new RequestCache();

// Start cleanup on module load
requestCache.startCleanup();
