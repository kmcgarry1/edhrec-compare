/**
 * Scryfall mana symbol management
 *
 * Loads and caches SVG URIs for all mana symbols from Scryfall's symbology API.
 * Symbols are loaded once on first use and cached for the session.
 *
 * @module composables/useScryfallSymbols
 *
 * @example
 * ```typescript
 * const { ensureSymbolsLoaded, getSvgForSymbol } = useScryfallSymbols();
 *
 * // Load symbols (call once before rendering mana costs)
 * await ensureSymbolsLoaded();
 *
 * // Get SVG URI for a symbol
 * const whiteManaSvg = getSvgForSymbol('{W}');
 * const blueManaSvg = getSvgForSymbol('{U}');
 * ```
 */

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

/**
 * Build symbol lookup map from Scryfall symbol data
 *
 * @param symbols - Array of symbol data from Scryfall API
 */
const hydrateMap = (symbols: ScryfallSymbol[]) => {
  const map: Record<string, string> = {};
  symbols.forEach((symbol) => {
    map[symbol.symbol.toUpperCase()] = symbol.svg_uri;
  });
  symbolMap.value = map;
};

/**
 * Composable for accessing Scryfall mana symbols
 *
 * @returns Object containing symbol loading and lookup methods
 */
export const useScryfallSymbols = () => {
  /**
   * Ensure mana symbols are loaded
   *
   * Fetches symbols from Scryfall API if not already loaded.
   * Subsequent calls return immediately if symbols are loaded.
   * Multiple concurrent calls share the same loading promise.
   *
   * @returns Promise that resolves when symbols are loaded
   */
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

  /**
   * Get SVG URI for a mana symbol
   *
   * @param token - Mana symbol token (e.g., "{W}", "{U}", "{B}", "{R}", "{G}")
   * @returns SVG URI for the symbol, or null if not found
   *
   * @example
   * ```typescript
   * const uri = getSvgForSymbol('{2}{R}{R}');
   * ```
   */
  const getSvgForSymbol = (token: string) =>
    symbolMap.value[token.toUpperCase()] ?? null;

  return {
    /** Load mana symbols from Scryfall API */
    ensureSymbolsLoaded,
    /** Get SVG URI for a symbol token */
    getSvgForSymbol,
    /** Whether symbols are currently loading or not yet loaded */
    isLoading: computed(() => isLoading.value || !hasLoaded.value),
  };
};
