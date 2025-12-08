import { cardCache } from "./indexedDbCache";
import { apiCall } from "./errorHandler";
import { requestCache } from "./requestCache";

interface CardFaceImageUris {
  small?: string;
  normal?: string;
  large?: string;
}

interface CardFace {
  name: string;
  mana_cost?: string;
  type_line?: string;
  oracle_text?: string;
  power?: string;
  toughness?: string;
  image_uris?: CardFaceImageUris;
}

export interface ScryfallCard {
  id: string;
  name: string;
  mana_cost?: string;
  cmc: number;
  type_line: string;
  oracle_text?: string;
  colors: string[];
  power?: string;
  toughness?: string;
  set: string;
  set_name?: string;
  collector_number?: string;
  rarity: string;
  released_at?: string;
  lang?: string;
  scryfall_uri?: string;
  prints_search_uri?: string;
  digital?: boolean;
  image_uris?: CardFaceImageUris;
  card_faces?: CardFace[];
  prices: {
    usd: string | null;
    usd_foil?: string | null;
    eur: string | null;
    eur_foil?: string | null;
  };
}

export interface ScryfallSymbol {
  symbol: string;
  svg_uri: string;
}

interface ScryfallListResponse<T> {
  data: T[];
  has_more: boolean;
  next_page?: string;
}

function sanitizeCardName(cardName: string): string {
  const trimmedName = cardName.trim();
  if (!trimmedName.includes("//")) {
    return trimmedName;
  }

  const [frontFace] = trimmedName.split("//");
  return frontFace?.trim() || trimmedName;
}

function getCacheKey(cardName: string): string {
  return sanitizeCardName(cardName).toLowerCase();
}

export async function getCard(cardName: string): Promise<ScryfallCard | null> {
  const sanitizedName = sanitizeCardName(cardName);
  const cacheKey = sanitizedName.toLowerCase();
  const cachedCard = await cardCache.getCachedCard(cacheKey);
  if (cachedCard) {
    return cachedCard;
  }

  // Deduplicate in-flight requests
  const requestKey = `scryfall:card:${cacheKey}`;
  return requestCache.dedupe(requestKey, () =>
    apiCall<ScryfallCard | null>(
      async () => {
        const response = await fetch(
          `https://api.scryfall.com/cards/named?fuzzy=${encodeURIComponent(
            sanitizedName
          )}`
        );

        if (!response.ok) {
          if (response.status === 404) {
            return null;
          }
          throw new Error(`Scryfall API error: ${response.status}`);
        }

        const card: ScryfallCard = await response.json();
        await cardCache.setCachedCard(cacheKey, card);
        return card;
      },
      "Unable to load that commander from Scryfall.",
      { context: "getCard" }
    )
  );
}

export async function getCardImage(cardName: string): Promise<string | null> {
  const card = await getCard(cardName);
  if (!card) {
    return null;
  }

  if (card.image_uris?.normal) {
    return card.image_uris.normal;
  }

  const faceWithImage = card.card_faces?.find(
    (face) => face.image_uris?.normal
  );
  return faceWithImage?.image_uris?.normal ?? null;
}

export async function searchCardNames(partialName: string): Promise<string[]> {
  const trimmed = partialName.trim();
  if (!trimmed) {
    return [];
  }

  const searchTerm = sanitizeCardName(trimmed) || trimmed;
  // Deduplicate search requests by normalized search term
  const requestKey = `scryfall:search:${searchTerm.toLowerCase()}`;
  
  return requestCache.dedupe(requestKey, () =>
    apiCall<string[]>(
      async () => {
        const response = await fetch(
          `https://api.scryfall.com/cards/search?q=${encodeURIComponent(
            `name:${searchTerm} is:commander`
          )}`
        );

        if (!response.ok) {
          if (response.status === 404) {
            return [];
          }
          throw new Error(`Scryfall API error: ${response.status}`);
        }

        const searchResult = await response.json();
        const seen = new Set<string>();

        return (
          searchResult.data
            ?.map(
              (card: ScryfallCard) => sanitizeCardName(card.name) || card.name
            )
            .filter((name: string) => {
              const normalized = name.trim().toLowerCase();
              if (!normalized || seen.has(normalized)) {
                return false;
              }
              seen.add(normalized);
              return true;
            }) || []
        );
      },
      "Unable to search Scryfall for commander names.",
      {
        context: "searchCardNames",
        suppressError: true,
        fallbackValue: [],
      }
    )
  );
}

export async function getCardsByNames(
  cardNames: { name: string }[],
  onProgress?: (current: number, total: number) => void
): Promise<ScryfallCard[]> {
  if (!cardNames.length) {
    return [];
  }

  // Deduplicate batch requests by sorted card names
  const uniqueNames = [...new Set(cardNames.map((c) => getCacheKey(c.name)))];
  const requestKey = `scryfall:batch:${uniqueNames.sort().join(",")}`;

  return requestCache.dedupe(requestKey, () =>
    apiCall<ScryfallCard[]>(
    async () => {
      const batchSize = 75;
      const totalBatches = Math.ceil(cardNames.length / batchSize);
      const requests = cardNames.map(({ name }) => {
        const sanitized = sanitizeCardName(name);
        return {
          sanitized,
          cacheKey: sanitized.toLowerCase(),
        };
      });

      const cachedResults = new Map<string, ScryfallCard>();
      const missingRequests = new Map<string, string>();

      for (const request of requests) {
        const cached = await cardCache.getCachedCard(request.cacheKey);
        if (cached) {
          cachedResults.set(request.cacheKey, cached);
        } else if (!missingRequests.has(request.cacheKey)) {
          missingRequests.set(request.cacheKey, request.sanitized);
        }
      }

      const missingIdentifiers = Array.from(missingRequests.values());
      const fetchedResults = new Map<string, ScryfallCard>();
      let batchesCompleted = 0;

      for (let i = 0; i < missingIdentifiers.length; i += batchSize) {
        const batch = missingIdentifiers.slice(i, i + batchSize);
        const response = await fetch(
          `https://api.scryfall.com/cards/collection`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              identifiers: batch.map((name) => ({
                name,
              })),
            }),
          }
        );

        if (!response.ok) {
          throw new Error(`Scryfall API error: ${response.status}`);
        }

        const fetchResult = await response.json();
        const cards = (fetchResult.data as ScryfallCard[]) ?? [];

        for (const card of cards) {
          const cacheKey = getCacheKey(card.name);
          fetchedResults.set(cacheKey, card);
          await cardCache.setCachedCard(cacheKey, card);
        }

        batchesCompleted += 1;
        onProgress?.(
          Math.min(batchesCompleted, totalBatches),
          totalBatches
        );

        if (i + batchSize < missingIdentifiers.length) {
          await new Promise((resolve) => setTimeout(resolve, 300));
        }
      }

      if (!missingIdentifiers.length || batchesCompleted < totalBatches) {
        onProgress?.(totalBatches, totalBatches);
      }

      const resolvedCards: ScryfallCard[] = [];
      for (const request of requests) {
        const card =
          cachedResults.get(request.cacheKey) ??
          fetchedResults.get(request.cacheKey);
        if (card) {
          resolvedCards.push(card);
        }
      }

      return resolvedCards;
    },
      "Unable to fetch detailed card data from Scryfall.",
      { context: "getCardsByNames" }
    )
  );
}

export async function getAllSymbols(): Promise<ScryfallSymbol[]> {
  const result = await apiCall<ScryfallSymbol[]>(
    async () => {
      const response = await fetch(`https://api.scryfall.com/symbology`);
      if (!response.ok) {
        throw new Error(`Scryfall API error: ${response.status}`);
      }
      const payload = await response.json();
      const symbols =
        (payload.data as Array<{ symbol: string; svg_uri: string }>) ?? [];
      return symbols.map(({ symbol, svg_uri }) => ({
        symbol,
        svg_uri,
      }));
    },
    "Unable to load mana symbols from Scryfall.",
    { context: "getAllSymbols" }
  );

  return result;
}

const PRINTINGS_PAGE_DELAY = 150;
const MAX_PRINTING_RESULTS = 60;

export async function getCardPrintings(
  printsSearchUri: string
): Promise<ScryfallCard[]> {
  const result = await apiCall<ScryfallCard[]>(
    async () => {
      let nextPage: string | null = printsSearchUri;
      const allPrintings: ScryfallCard[] = [];

      while (nextPage) {
        const response = await fetch(nextPage);
        if (!response.ok) {
          throw new Error(`Scryfall API error: ${response.status}`);
        }

        const page: ScryfallListResponse<ScryfallCard> = await response.json();
        allPrintings.push(...page.data);

        if (!page.has_more || allPrintings.length >= MAX_PRINTING_RESULTS) {
          break;
        }

        nextPage = page.next_page ?? null;

        if (nextPage) {
          await new Promise((resolve) =>
            setTimeout(resolve, PRINTINGS_PAGE_DELAY)
          );
        }
      }

      return allPrintings;
    },
    "Unable to load commander printings from Scryfall.",
    { context: "getCardPrintings" }
  );

  return result;
}
