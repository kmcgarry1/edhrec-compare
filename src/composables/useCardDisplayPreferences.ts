import { readonly, ref, watch } from "vue";

export type CardDisplayMode = "rows" | "gallery";
export type PriceDisplayMode = "both" | "usd" | "eur";

const DISPLAY_MODE_KEY = "commander-scout-card-display-mode";
const PRICE_MODE_KEY = "commander-scout-price-display-mode";

const isCardDisplayMode = (value: string | null): value is CardDisplayMode =>
  value === "rows" || value === "gallery";

const isPriceDisplayMode = (value: string | null): value is PriceDisplayMode =>
  value === "both" || value === "usd" || value === "eur";

const readStoredValue = (key: string) => {
  if (typeof window === "undefined") {
    return null;
  }
  return window.localStorage.getItem(key);
};

const displayMode = ref<CardDisplayMode>(
  isCardDisplayMode(readStoredValue(DISPLAY_MODE_KEY))
    ? (readStoredValue(DISPLAY_MODE_KEY) as CardDisplayMode)
    : "rows"
);
const priceMode = ref<PriceDisplayMode>(
  isPriceDisplayMode(readStoredValue(PRICE_MODE_KEY))
    ? (readStoredValue(PRICE_MODE_KEY) as PriceDisplayMode)
    : "both"
);

if (typeof window !== "undefined") {
  watch(displayMode, (value) => window.localStorage.setItem(DISPLAY_MODE_KEY, value), {
    immediate: true,
  });
  watch(priceMode, (value) => window.localStorage.setItem(PRICE_MODE_KEY, value), {
    immediate: true,
  });
}

export const useCardDisplayPreferences = () => {
  const setDisplayMode = (value: CardDisplayMode) => {
    displayMode.value = value;
  };

  const setPriceMode = (value: PriceDisplayMode) => {
    priceMode.value = value;
  };

  return {
    displayMode: readonly(displayMode),
    priceMode: readonly(priceMode),
    setDisplayMode,
    setPriceMode,
  };
};
