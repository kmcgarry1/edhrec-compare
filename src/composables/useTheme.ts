import { readonly, ref } from "vue";

type Theme = "light" | "dark";

const STORAGE_KEY = "edhrec-color-scheme";
const theme = ref<Theme>("light");

let initialized = false;
let systemListenerAttached = false;

const applyTheme = (value: Theme) => {
  if (typeof document === "undefined") {
    return;
  }

  const root = document.documentElement;
  root.classList.remove("light", "dark");
  root.classList.add(value);
  root.dataset.theme = value;
};

const getStoredTheme = (): Theme | null => {
  if (typeof window === "undefined") {
    return null;
  }

  const stored = window.localStorage.getItem(STORAGE_KEY);
  return stored === "light" || stored === "dark" ? stored : null;
};

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

const setTheme = (value: Theme, persist = true) => {
  theme.value = value;
  applyTheme(value);

  if (persist && typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, value);
  }
};

const handleSystemChange = (event: MediaQueryListEvent) => {
  if (getStoredTheme()) {
    return;
  }
  setTheme(event.matches ? "dark" : "light", false);
};

const ensureSystemListener = () => {
  if (systemListenerAttached || typeof window === "undefined") {
    return;
  }

  const media = window.matchMedia("(prefers-color-scheme: dark)");
  media.addEventListener("change", handleSystemChange);
  systemListenerAttached = true;
};

const ensureInitialized = () => {
  if (initialized) {
    return;
  }

  setTheme(getPreferredTheme(), false);
  ensureSystemListener();
  initialized = true;
};

export const useTheme = () => {
  ensureInitialized();

  const toggleTheme = () => {
    setTheme(theme.value === "dark" ? "light" : "dark");
  };

  const setExplicitTheme = (value: Theme) => setTheme(value);

  return {
    theme: readonly(theme),
    toggleTheme,
    setTheme: setExplicitTheme,
  };
};
