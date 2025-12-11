/**
 * Animated background preference management
 *
 * Controls whether the animated nebula background is displayed.
 * Preference is persisted to localStorage.
 *
 * @module composables/useBackgroundPreference
 *
 * @example
 * ```typescript
 * const { backgroundEnabled, toggleBackground } = useBackgroundPreference();
 *
 * // Check if background is enabled
 * if (backgroundEnabled.value) {
 *   console.log('Background is visible');
 * }
 *
 * // Toggle background on/off
 * toggleBackground();
 * ```
 */

import { readonly, ref } from "vue";

const STORAGE_KEY = "edhrec-background-enabled";
const backgroundEnabled = ref(true);
let initialized = false;

/**
 * Initialize background preference from localStorage
 */
const ensureInitialized = () => {
  if (initialized) {
    return;
  }

  if (typeof window !== "undefined") {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "false") {
      backgroundEnabled.value = false;
    }
  }

  initialized = true;
};

/**
 * Save background preference to localStorage
 *
 * @param value - Whether background should be enabled
 */
const persist = (value: boolean) => {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(STORAGE_KEY, value ? "true" : "false");
};

/**
 * Composable for managing animated background preference
 *
 * @returns Object containing background state and control methods
 */
export const useBackgroundPreference = () => {
  ensureInitialized();

  /**
   * Set background enabled state
   *
   * @param value - Whether to enable the background
   */
  const setBackgroundEnabled = (value: boolean) => {
    backgroundEnabled.value = value;
    persist(value);
  };

  /**
   * Toggle background between enabled and disabled
   */
  const toggleBackground = () => {
    setBackgroundEnabled(!backgroundEnabled.value);
  };

  return {
    /** Whether background is enabled (readonly) */
    backgroundEnabled: readonly(backgroundEnabled),
    /** Set background enabled state */
    setBackgroundEnabled,
    /** Toggle background on/off */
    toggleBackground,
  };
};
