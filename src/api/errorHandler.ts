/**
 * API error handling wrapper
 *
 * Provides a standardized way to handle errors from API calls with
 * automatic user notifications via toast messages. Integrates with
 * the global error handling system.
 *
 * @module api/errorHandler
 *
 * @example
 * ```typescript
 * import { apiCall } from '@/api/errorHandler';
 *
 * // Basic usage with automatic error notification
 * const data = await apiCall(
 *   () => fetch('/api/data').then(r => r.json()),
 *   'Failed to load data'
 * );
 *
 * // With options
 * const result = await apiCall(
 *   async () => await fetchSomething(),
 *   'Error occurred',
 *   {
 *     notify: false,           // Suppress toast notification
 *     context: 'MyComponent',  // Add context for debugging
 *     suppressError: true,     // Return fallback instead of throwing
 *     fallbackValue: []        // Value to return on error
 *   }
 * );
 * ```
 */

import { handleError } from "../utils/errorHandler";

/**
 * Options for configuring API call error handling
 */
type ApiCallOptions<T> = {
  /** Whether to show toast notification on error (default: true) */
  notify?: boolean;
  /** Context string for error tracking (default: "apiCall") */
  context?: string;
  /** If true, returns fallbackValue instead of throwing (default: false) */
  suppressError?: boolean;
  /** Value to return when suppressError is true and error occurs */
  fallbackValue?: T;
};

/**
 * Execute an async API call with standardized error handling
 *
 * Wraps API calls with consistent error handling including user notifications,
 * error tracking, and fallback values. Integrates with the global error handler.
 *
 * @param fn - Async function to execute
 * @param errorMessage - User-friendly error message for notifications
 * @param options - Optional configuration for error handling behavior
 * @returns Promise resolving to the function result or fallback value
 * @throws {Error} Normalized error if suppressError is false
 *
 * @example
 * ```typescript
 * // Throws on error with toast notification
 * const data = await apiCall(
 *   () => fetchData(),
 *   'Failed to fetch data'
 * );
 *
 * // Returns empty array on error, no throw
 * const items = await apiCall(
 *   () => fetchItems(),
 *   'Failed to fetch items',
 *   { suppressError: true, fallbackValue: [] }
 * );
 * ```
 */
export async function apiCall<T>(
  fn: () => Promise<T>,
  errorMessage: string,
  options?: ApiCallOptions<T>
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    const normalized = handleError(error, {
      notify: options?.notify ?? true,
      fallbackMessage: errorMessage,
      context: options?.context ?? "apiCall",
    });

    if (options?.suppressError) {
      return (options.fallbackValue ?? null) as T;
    }

    throw normalized;
  }
}
