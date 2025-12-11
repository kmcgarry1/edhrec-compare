/**
 * Card ownership filter state management
 *
 * Controls filtering of card lists based on ownership status from
 * uploaded CSV inventory data.
 *
 * @module composables/useOwnedFilter
 *
 * @example
 * ```typescript
 * const { showOwned, setOwnedFilter } = useOwnedFilter();
 *
 * // Show only owned cards
 * setOwnedFilter(true);
 *
 * // Show only unowned cards
 * setOwnedFilter(false);
 *
 * // Show all cards (no filter)
 * setOwnedFilter(null);
 * ```
 */

import { ref, readonly } from "vue";

/**
 * Filter type: true = owned only, false = unowned only, null = show all
 */
type OwnedFilter = boolean | null;

const showOwned = ref<OwnedFilter>(null);

/**
 * Composable for managing card ownership filter
 *
 * @returns Object containing filter state and setter method
 */
export const useOwnedFilter = () => {
  /**
   * Set the ownership filter
   *
   * @param value - Filter value (true = owned, false = unowned, null = all)
   *
   * @example
   * ```typescript
   * setOwnedFilter(true);  // Show only owned cards
   * setOwnedFilter(false); // Show only unowned cards
   * setOwnedFilter(null);  // Show all cards
   * ```
   */
  const setOwnedFilter = (value: OwnedFilter) => {
    showOwned.value = value;
  };

  return {
    /** Current ownership filter state (readonly) */
    showOwned: readonly(showOwned),
    /** Set the ownership filter */
    setOwnedFilter,
  };
};
