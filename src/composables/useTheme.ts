/**
 * Theme management composable
 *
 * Provides light/dark theme switching with persistence via localStorage
 * and automatic detection of system preferences. Applies theme by adding
 * CSS classes to the document root element.
 *
 * @module composables/useTheme
 *
 * @example
 * ```typescript
 * const { theme, toggleTheme, setTheme } = useTheme();
 *
 * // Check current theme
 * console.log(theme.value); // "light" or "dark"
 *
 * // Toggle between themes
 * toggleTheme();
 *
 * // Set explicit theme
 * setTheme('dark');
 * ```
 */

import { readonly, ref } from "vue";

type Theme = "light" | "dark";

const STORAGE_KEY = "edhrec-color-scheme";
const theme = ref<Theme>("light");

let initialized = false;
let systemListenerAttached = false;

/**
 * Apply theme by updating document root classes and data attributes
 *
 * @param value - Theme to apply ("light" or "dark")
 */
const applyTheme = (value: Theme) => {
  if (typeof document === "undefined") {
    return;
  }

  const root = document.documentElement;
  root.classList.remove("light", "dark");
  root.classList.add(value);
  root.dataset.theme = value;
};

/**
 * Retrieve theme preference from localStorage
 *
 * @returns Stored theme value or null if not set
 */
const getStoredTheme = (): Theme | null => {
  if (typeof window === "undefined") {
    return null;
  }

  const stored = window.localStorage.getItem(STORAGE_KEY);
  return stored === "light" || stored === "dark" ? stored : null;
};

/**
 * Get preferred theme from storage or system preferences
 *
 * @returns Preferred theme value
 */
const getPreferredTheme = (): Theme => {
  const stored = getStoredTheme();
  if (stored) {
    return stored;
  }

  if (typeof window === "undefined") {
    return "light";
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

/**
 * Set the active theme
 *
 * @param value - Theme to set
 * @param persist - Whether to save to localStorage (default: true)
 */
const setTheme = (value: Theme, persist = true) => {
  theme.value = value;
  applyTheme(value);

  if (persist && typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, value);
  }
};

/**
 * Handle system theme preference changes
 *
 * @param event - Media query change event
 */
const handleSystemChange = (event: MediaQueryListEvent) => {
  if (getStoredTheme()) {
    return;
  }
  setTheme(event.matches ? "dark" : "light", false);
};

/**
 * Attach event listener for system theme changes
 */
const ensureSystemListener = () => {
  if (systemListenerAttached || typeof window === "undefined") {
    return;
  }

  const media = window.matchMedia("(prefers-color-scheme: dark)");
  media.addEventListener("change", handleSystemChange);
  systemListenerAttached = true;
};

/**
 * Initialize theme system on first use
 */
const ensureInitialized = () => {
  if (initialized) {
    return;
  }

  setTheme(getPreferredTheme(), false);
  ensureSystemListener();
  initialized = true;
};

/**
 * Composable for managing application theme
 *
 * Handles theme initialization, toggling, and persistence.
 * Respects system preferences when no explicit theme is set.
 *
 * @returns Object containing theme state and control methods
 */
export const useTheme = () => {
  ensureInitialized();

  /**
   * Toggle between light and dark themes
   */
  const toggleTheme = () => {
    setTheme(theme.value === "dark" ? "light" : "dark");
  };

  /**
   * Set an explicit theme value
   *
   * @param value - Theme to set ("light" or "dark")
   */
  const setExplicitTheme = (value: Theme) => setTheme(value);

  return {
    /** Current theme (readonly) */
    theme: readonly(theme),
    /** Toggle between light and dark themes */
    toggleTheme,
    /** Set explicit theme */
    setTheme: setExplicitTheme,
  };
};
