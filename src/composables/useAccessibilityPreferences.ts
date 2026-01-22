import { reactive, readonly } from "vue";

export const textScaleOptions = [
  { value: "100", label: "100%" },
  { value: "110", label: "110%" },
  { value: "120", label: "120%" },
  { value: "130", label: "130%" },
] as const;

export type TextScale = (typeof textScaleOptions)[number]["value"];

type AccessibilityPreferences = {
  reduceMotion: boolean;
  highContrast: boolean;
  focusRing: boolean;
  linkUnderlines: boolean;
  textScale: TextScale;
  textSpacing: boolean;
};

const STORAGE_KEY = "commander-scout:accessibility-preferences";

const defaultPreferences: AccessibilityPreferences = {
  reduceMotion: false,
  highContrast: false,
  focusRing: false,
  linkUnderlines: false,
  textScale: "100",
  textSpacing: false,
};

const preferences = reactive<AccessibilityPreferences>({ ...defaultPreferences });

let initialized = false;

const normalizeTextScale = (value: unknown): TextScale => {
  if (typeof value !== "string") {
    return defaultPreferences.textScale;
  }
  const match = textScaleOptions.find((option) => option.value === value);
  return match ? match.value : defaultPreferences.textScale;
};

const readSystemPreference = (query: string): boolean => {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }
  return window.matchMedia(query).matches;
};

const readStoredPreferences = (): Partial<AccessibilityPreferences> | null => {
  if (typeof window === "undefined") {
    return null;
  }
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    return null;
  }
  try {
    const parsed = JSON.parse(stored) as Partial<AccessibilityPreferences>;
    return {
      reduceMotion:
        typeof parsed.reduceMotion === "boolean"
          ? parsed.reduceMotion
          : undefined,
      highContrast:
        typeof parsed.highContrast === "boolean"
          ? parsed.highContrast
          : undefined,
      focusRing:
        typeof parsed.focusRing === "boolean" ? parsed.focusRing : undefined,
      linkUnderlines:
        typeof parsed.linkUnderlines === "boolean"
          ? parsed.linkUnderlines
          : undefined,
      textScale: normalizeTextScale(parsed.textScale),
      textSpacing:
        typeof parsed.textSpacing === "boolean" ? parsed.textSpacing : undefined,
    };
  } catch {
    return null;
  }
};

const applyPreferences = () => {
  if (typeof document === "undefined") {
    return;
  }

  const root = document.documentElement;
  root.classList.toggle("a11y-reduce-motion", preferences.reduceMotion);
  root.classList.toggle("a11y-high-contrast", preferences.highContrast);
  root.classList.toggle("a11y-focus-ring", preferences.focusRing);
  root.classList.toggle("a11y-link-underline", preferences.linkUnderlines);
  root.classList.toggle("a11y-text-spacing", preferences.textSpacing);

  const scale = Number(preferences.textScale) / 100;
  root.style.setProperty("--a11y-text-scale", scale.toString());
  root.dataset.a11yTextScale = preferences.textScale;
};

const persistPreferences = () => {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
};

const updatePreferences = (
  next: Partial<AccessibilityPreferences>,
  persist = true
) => {
  Object.assign(preferences, next);
  applyPreferences();
  if (persist) {
    persistPreferences();
  }
};

const getSystemDefaults = () => ({
  reduceMotion: readSystemPreference("(prefers-reduced-motion: reduce)"),
  highContrast: readSystemPreference("(prefers-contrast: more)"),
});

const getInitialPreferences = (): AccessibilityPreferences => {
  const stored = readStoredPreferences();
  const systemDefaults = getSystemDefaults();

  return {
    ...defaultPreferences,
    ...systemDefaults,
    ...(stored ?? {}),
    textScale: normalizeTextScale(stored?.textScale),
  };
};

const getResetPreferences = (): AccessibilityPreferences => {
  const systemDefaults = getSystemDefaults();
  return {
    ...defaultPreferences,
    ...systemDefaults,
  };
};

const ensureInitialized = () => {
  if (initialized) {
    return;
  }

  const initial = getInitialPreferences();
  Object.assign(preferences, initial);
  applyPreferences();
  initialized = true;
};

export const useAccessibilityPreferences = () => {
  ensureInitialized();

  const setReduceMotion = (value: boolean) =>
    updatePreferences({ reduceMotion: value });
  const setHighContrast = (value: boolean) =>
    updatePreferences({ highContrast: value });
  const setFocusRing = (value: boolean) =>
    updatePreferences({ focusRing: value });
  const setLinkUnderlines = (value: boolean) =>
    updatePreferences({ linkUnderlines: value });
  const setTextScale = (value: TextScale) =>
    updatePreferences({ textScale: normalizeTextScale(value) });
  const setTextSpacing = (value: boolean) =>
    updatePreferences({ textSpacing: value });

  const resetPreferences = () => {
    updatePreferences(getResetPreferences());
  };

  return {
    preferences: readonly(preferences),
    textScaleOptions,
    setReduceMotion,
    setHighContrast,
    setFocusRing,
    setLinkUnderlines,
    setTextScale,
    setTextSpacing,
    resetPreferences,
  };
};
