import { readonly, ref } from "vue";

const STORAGE_KEY = "edhrec-background-enabled";
const backgroundEnabled = ref(true);
let initialized = false;

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

const persist = (value: boolean) => {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(STORAGE_KEY, value ? "true" : "false");
};

export const useBackgroundPreference = () => {
  ensureInitialized();

  const setBackgroundEnabled = (value: boolean) => {
    backgroundEnabled.value = value;
    persist(value);
  };

  const toggleBackground = () => {
    setBackgroundEnabled(!backgroundEnabled.value);
  };

  return {
    backgroundEnabled: readonly(backgroundEnabled),
    setBackgroundEnabled,
    toggleBackground,
  };
};
