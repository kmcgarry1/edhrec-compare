/**
 * Global loading state management composable
 *
 * Tracks loading states across multiple concurrent operations using scoped
 * identifiers. Supports progress tracking and custom status messages.
 *
 * @module composables/useGlobalLoading
 *
 * @example
 * ```typescript
 * const { startLoading, stopLoading, isLoading } = useGlobalLoading();
 *
 * // Basic usage
 * startLoading('Fetching data...');
 * // ... perform async operation
 * stopLoading();
 *
 * // Scoped loading for multiple concurrent operations
 * startLoading('Loading cards...', 'cards');
 * startLoading('Loading prices...', 'prices');
 *
 * // Async wrapper
 * await withLoading(async () => {
 *   return await fetchData();
 * }, 'Loading...');
 * ```
 */

import { computed, reactive } from "vue";

type Scope = string;

const DEFAULT_SCOPE: Scope = "global";

/**
 * Progress information for tracked operations
 */
type ProgressInfo = {
  /** Current progress value */
  current: number;
  /** Total expected value */
  total: number;
};

/**
 * State for a single loading scope
 */
type ScopeState = {
  /** Number of active loading operations in this scope */
  count: number;
  /** Optional status message to display */
  message: string | null;
  /** Optional progress tracking info */
  progress?: ProgressInfo;
};

const scopeStates = reactive<Record<Scope, ScopeState>>({});

/**
 * Ensure a scope state exists, creating it if necessary
 *
 * @param scope - Scope identifier
 * @returns The scope state object
 */
const ensureScopeState = (scope: Scope) => {
  if (!scopeStates[scope]) {
    scopeStates[scope] = { count: 0, message: null };
  }
  return scopeStates[scope];
};

/**
 * Start a loading operation
 *
 * Increments the loading counter for the specified scope and optionally
 * sets a status message and progress tracking.
 *
 * @param status - Optional status message to display
 * @param scope - Scope identifier (default: "global")
 * @param total - Optional total for progress tracking
 *
 * @example
 * ```typescript
 * startLoading('Fetching cards...', 'cards', 100);
 * ```
 */
const startLoading = (
  status?: string,
  scope: Scope = DEFAULT_SCOPE,
  total?: number
) => {
  const state = ensureScopeState(scope);
  state.count += 1;
  if (status) {
    state.message = status;
  } else if (!state.message) {
    state.message = "Loading...";
  }
  if (total !== undefined && total > 0) {
    state.progress = { current: 0, total };
  }
};

/**
 * Update progress for a loading operation
 *
 * @param scope - Scope identifier
 * @param current - Current progress value
 *
 * @example
 * ```typescript
 * startLoading('Loading...', 'data', 100);
 * updateProgress('data', 50); // 50% complete
 * ```
 */
const updateProgress = (scope: Scope, current: number) => {
  const state = scopeStates[scope];
  if (state?.progress) {
    state.progress.current = Math.min(current, state.progress.total);
  }
};

/**
 * Stop a loading operation
 *
 * Decrements the loading counter for the specified scope. When the counter
 * reaches zero, clears the status message and progress.
 *
 * @param scope - Scope identifier (default: "global")
 *
 * @example
 * ```typescript
 * stopLoading('cards');
 * ```
 */
const stopLoading = (scope: Scope = DEFAULT_SCOPE) => {
  const state = scopeStates[scope];
  if (!state) {
    return;
  }
  state.count = Math.max(0, state.count - 1);
  if (state.count === 0) {
    state.message = null;
    state.progress = undefined;
    delete scopeStates[scope];
  }
};

/**
 * Get computed loading state for a scope
 *
 * @param scope - Scope identifier
 * @returns Computed boolean indicating if scope is loading
 */
const getScopeLoading = (scope: Scope) =>
  computed(() => (scopeStates[scope]?.count ?? 0) > 0);

/**
 * Get computed status message for a scope
 *
 * @param scope - Scope identifier
 * @returns Computed status message string
 */
const getScopeMessage = (scope: Scope) =>
  computed(() => scopeStates[scope]?.message ?? "Loading...");

/**
 * Get computed progress info for a scope
 *
 * @param scope - Scope identifier
 * @returns Computed progress information or undefined
 */
const getScopeProgress = (scope: Scope) =>
  computed(() => scopeStates[scope]?.progress);

const isLoading = getScopeLoading(DEFAULT_SCOPE);
const loadingMessage = getScopeMessage(DEFAULT_SCOPE);
const loadingProgress = getScopeProgress(DEFAULT_SCOPE);

/**
 * Wrap an async operation with automatic loading state management
 *
 * @param action - Async function to execute
 * @param status - Optional status message
 * @param scope - Scope identifier (default: "global")
 * @param total - Optional total for progress tracking
 * @returns Promise resolving to the action's return value
 *
 * @example
 * ```typescript
 * const data = await withLoading(
 *   async () => await fetchData(),
 *   'Loading data...',
 *   'api-call'
 * );
 * ```
 */
const withLoading = async <T>(
  action: () => Promise<T>,
  status?: string,
  scope: Scope = DEFAULT_SCOPE,
  total?: number
) => {
  startLoading(status, scope, total);
  try {
    return await action();
  } finally {
    stopLoading(scope);
  }
};

/**
 * Composable for managing global loading states
 *
 * Provides methods for tracking multiple concurrent loading operations
 * using scoped identifiers. Supports progress tracking and status messages.
 *
 * @returns Object containing loading state and control methods
 */
export const useGlobalLoading = () => ({
  /** Default scope loading state (readonly) */
  isLoading,
  /** Default scope status message (readonly) */
  loadingMessage,
  /** Default scope progress info (readonly) */
  loadingProgress,
  /** Start a loading operation */
  startLoading,
  /** Stop a loading operation */
  stopLoading,
  /** Update progress for a scope */
  updateProgress,
  /** Wrap async operation with loading state */
  withLoading,
  /** Get loading state for specific scope */
  getScopeLoading,
  /** Get status message for specific scope */
  getScopeMessage,
  /** Get progress info for specific scope */
  getScopeProgress,
});
