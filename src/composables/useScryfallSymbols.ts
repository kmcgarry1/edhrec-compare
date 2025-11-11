import { computed, ref } from "vue";
import { getAllSymbols } from "../api/scryfallApi";
import type { ScryfallSymbol } from "../api/scryfallApi";
import { useGlobalLoading } from "./useGlobalLoading";

const symbolMap = ref<Record<string, string>>({});
const hasLoaded = ref(false);
const isLoading = ref(false);
let loadPromise: Promise<void> | null = null;

const { withLoading } = useGlobalLoading();
const scope = "scryfall-symbology";

const hydrateMap = (symbols: ScryfallSymbol[]) => {
  const map: Record<string, string> = {};
  symbols.forEach((symbol) => {
    map[symbol.symbol.toUpperCase()] = symbol.svg_uri;
  });
  symbolMap.value = map;
};

export const useScryfallSymbols = () => {
  const ensureSymbolsLoaded = async () => {
    if (hasLoaded.value) {
      return;
    }

    if (isLoading.value && loadPromise) {
      await loadPromise;
      return;
    }

    isLoading.value = true;
    loadPromise = withLoading(
      async () => {
        const symbols = await getAllSymbols();
        hydrateMap(symbols);
        hasLoaded.value = true;
      },
      "Loading mana symbols...",
      scope
    ).finally(() => {
      isLoading.value = false;
      loadPromise = null;
    });

    await loadPromise;
  };

  const getSvgForSymbol = (token: string) =>
    symbolMap.value[token.toUpperCase()] ?? null;

  return {
    ensureSymbolsLoaded,
    getSvgForSymbol,
    isLoading: computed(() => isLoading.value || !hasLoaded.value),
  };
};
