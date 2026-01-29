/**
 * Top commander scan logic
 *
 * Compares the uploaded CSV against EDHREC average decks for the
 * top commanders list.
 */

import { ref } from "vue";
import { getAverageDeckCards, getTopCommanders } from "../api/edhrecApi";
import {
  buildCardNameSet,
  cardNameVariants,
  getNameColumnIndex,
  normalizeCardName,
} from "../utils/cardName";
import { handleError } from "../utils/errorHandler";
import { useGlobalLoading } from "./useGlobalLoading";

export type CommanderScanResult = {
  name: string;
  slug: string;
  rank: number;
  deckCount: number;
  totalCards: number;
  ownedCards: number;
  ownedPercent: number;
};

type ScanOptions = {
  force?: boolean;
  limit?: number;
  path?: string;
};

const SCAN_SCOPE = "commander-scout";
const CONCURRENCY_LIMIT = 5;

const createScanKey = (
  rows: string[][],
  headers: string[],
  limit: number,
  path: string
) => {
  const headerKey = headers.join("|");
  const firstRow = rows[0]?.[0] ?? "";
  return `${path}:${limit}:${rows.length}:${headerKey}:${firstRow}`;
};

const mapWithConcurrency = async <T, R>(
  items: T[],
  limit: number,
  mapper: (item: T, index: number) => Promise<R>
) => {
  const results: R[] = new Array(items.length);
  let currentIndex = 0;
  const workers = Array.from(
    { length: Math.min(limit, items.length) },
    async () => {
      while (currentIndex < items.length) {
        const index = currentIndex;
        currentIndex += 1;
        results[index] = await mapper(items[index], index);
      }
    }
  );

  await Promise.all(workers);
  return results;
};

export const useTopCommanderScan = () => {
  const results = ref<CommanderScanResult[]>([]);
  const lastUpdated = ref<Date | null>(null);
  const error = ref<string | null>(null);
  const failedCount = ref(0);
  const sourceLabel = ref<string>("Top Commanders (Past 2 Years)");
  const lastScanKey = ref<string | null>(null);
  let activeScanId = 0;

  const { startLoading, stopLoading, updateProgress, getScopeLoading } =
    useGlobalLoading();
  const isLoading = getScopeLoading(SCAN_SCOPE);

  const clearResults = () => {
    activeScanId += 1;
    results.value = [];
    lastUpdated.value = null;
    error.value = null;
    failedCount.value = 0;
    lastScanKey.value = null;
  };

  const runScan = async (
    rows: string[][],
    headers: string[],
    options?: ScanOptions
  ) => {
    if (!rows.length) {
      error.value = "Upload a CSV to run the commander scan.";
      return;
    }

    const limit = options?.limit ?? 50;
    const path = options?.path ?? "commanders/year";
    const scanKey = createScanKey(rows, headers, limit, path);
    if (!options?.force && lastScanKey.value === scanKey && results.value.length) {
      return;
    }

    const scanId = ++activeScanId;
    error.value = null;
    failedCount.value = 0;

    let loadingStarted = false;
    const isStale = () => scanId !== activeScanId;

    try {
      const { header, commanders } = await getTopCommanders(limit, { path });
      if (!commanders.length) {
        throw new Error("No commanders returned from EDHREC.");
      }

      sourceLabel.value = header || sourceLabel.value;

      startLoading("Scanning top commanders...", SCAN_SCOPE, commanders.length);
      loadingStarted = true;
      updateProgress(SCAN_SCOPE, 0);

      const nameIndex = getNameColumnIndex(headers);
      const ownedSet = buildCardNameSet(rows, nameIndex);

      let completed = 0;
      const scanResults = await mapWithConcurrency(
        commanders,
        CONCURRENCY_LIMIT,
        async (commander) => {
          if (isStale()) {
            return null;
          }
          const cardNames = await getAverageDeckCards(commander.slug);
          if (isStale()) {
            return null;
          }
          completed += 1;
          updateProgress(SCAN_SCOPE, completed);

          if (!cardNames || cardNames.length === 0) {
            if (!isStale()) {
              failedCount.value += 1;
            }
            return null;
          }

          const uniqueNames = new Set<string>();
          let totalCards = 0;
          let ownedCards = 0;

          cardNames.forEach((name) => {
            const normalized = normalizeCardName(name);
            if (!normalized || uniqueNames.has(normalized)) {
              return;
            }
            uniqueNames.add(normalized);
            totalCards += 1;
            const isOwned = cardNameVariants(name).some((variant) =>
              ownedSet.has(variant)
            );
            if (isOwned) {
              ownedCards += 1;
            }
          });

          const ownedPercent =
            totalCards > 0 ? (ownedCards / totalCards) * 100 : 0;

          return {
            name: commander.name,
            slug: commander.slug,
            rank: commander.rank,
            deckCount: commander.deckCount,
            totalCards,
            ownedCards,
            ownedPercent,
          } satisfies CommanderScanResult;
        }
      );

      if (scanId !== activeScanId) {
        return;
      }

      results.value = scanResults.filter(
        (entry): entry is CommanderScanResult => Boolean(entry)
      );
      lastUpdated.value = new Date();
      lastScanKey.value = scanKey;
    } catch (scanError) {
      if (scanId !== activeScanId) {
        return;
      }
      const handled = handleError(scanError, {
        notify: true,
        fallbackMessage:
          "Unable to scan top commanders right now. Please try again.",
        context: "TopCommanderScan",
      });
      error.value = handled.userMessage;
    } finally {
      if (loadingStarted) {
        stopLoading(SCAN_SCOPE);
      }
    }
  };

  return {
    results,
    lastUpdated,
    error,
    failedCount,
    sourceLabel,
    isLoading,
    scope: SCAN_SCOPE,
    runScan,
    clearResults,
  };
};
