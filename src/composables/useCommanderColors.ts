/**
 * Commander color identity management
 *
 * Tracks color identity from multiple commanders (including partners)
 * and merges them into a single unified color identity array.
 *
 * @module composables/useCommanderColors
 *
 * @example
 * ```typescript
 * const { commanderColors, setCommanderColors } = useCommanderColors();
 *
 * // Set colors for primary commander
 * setCommanderColors('primary', ['W', 'U']);
 *
 * // Set colors for partner
 * setCommanderColors('partner', ['U', 'B']);
 *
 * // Merged result: ['W', 'U', 'B']
 * console.log(commanderColors.value);
 * ```
 */

import { ref } from "vue";

const commanderColors = ref<string[]>([]);
const colorSources = new Map<string, string[]>();

/**
 * Recompute merged color identity from all sources
 */
const recomputeColors = () => {
  const merged = new Set<string>();
  colorSources.forEach((colors) => {
    colors.forEach((color) => {
      if (color) {
        merged.add(color.toUpperCase());
      }
    });
  });
  commanderColors.value = Array.from(merged);
};

/**
 * Composable for managing commander color identity
 *
 * Handles merging color identities from multiple commanders,
 * useful for partner commanders or background combinations.
 *
 * @returns Object containing color state and control methods
 */
export const useCommanderColors = () => {
  /**
   * Set color identity for a specific commander source
   *
   * @param key - Unique identifier for the commander (e.g., "primary", "partner")
   * @param colors - Array of color codes (e.g., ["W", "U", "B"])
   *
   * @example
   * ```typescript
   * setCommanderColors('primary', ['R', 'G']);
   * setCommanderColors('partner', ['G', 'U']);
   * // Result: ['R', 'G', 'U']
   * ```
   */
  const setCommanderColors = (key: string, colors: string[]) => {
    colorSources.set(key, colors);
    recomputeColors();
  };

  /**
   * Remove color identity for a specific commander source
   *
   * @param key - Unique identifier for the commander to remove
   *
   * @example
   * ```typescript
   * clearCommanderColors('partner');
   * ```
   */
  const clearCommanderColors = (key: string) => {
    colorSources.delete(key);
    recomputeColors();
  };

  return {
    /** Merged color identity from all commanders */
    commanderColors,
    /** Set colors for a commander source */
    setCommanderColors,
    /** Clear colors for a commander source */
    clearCommanderColors,
  };
};
