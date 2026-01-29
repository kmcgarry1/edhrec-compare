/**
 * Maps an array of items with a concurrency limit.
 * This is a general-purpose concurrency control pattern that processes
 * items in parallel while limiting the number of concurrent operations.
 *
 * @param items - Array of items to process
 * @param limit - Maximum number of concurrent operations
 * @param mapper - Async function to apply to each item
 * @returns Promise resolving to array of results in the same order as input
 *
 * @example
 * ```typescript
 * const urls = ['url1', 'url2', 'url3', ...];
 * const results = await mapWithConcurrency(
 *   urls,
 *   5, // max 5 concurrent fetches
 *   async (url) => fetch(url).then(r => r.json())
 * );
 * ```
 */
export const mapWithConcurrency = async <T, R>(
  items: T[],
  limit: number,
  mapper: (item: T, index: number) => Promise<R>
): Promise<R[]> => {
  const results: R[] = new Array(items.length);
  let currentIndex = 0;
  const workers = Array.from(
    { length: Math.min(limit, items.length) },
    async () => {
      while (currentIndex < items.length) {
        const index = currentIndex;
        currentIndex += 1;
        const item = items[index]!;
        results[index] = await mapper(item, index);
      }
    }
  );

  await Promise.all(workers);
  return results;
};
