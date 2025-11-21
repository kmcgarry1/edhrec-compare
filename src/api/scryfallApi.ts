import { apiCall } from "./errorHandler";

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

export async function getCard(cardName: string): Promise<ScryfallCard | null> {
  const sanitizedName = sanitizeCardName(cardName);
  return apiCall<ScryfallCard | null>(
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
      return card;
    },
    "Unable to load that commander from Scryfall.",
    { context: "getCard" }
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
  const result = await apiCall<string[]>(
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
  );

  return result;
}

export async function getCardsByNames(
  cardNames: { name: string }[],
  onProgress?: (current: number, total: number) => void
): Promise<ScryfallCard[]> {
  if (!cardNames.length) {
    return [];
  }

  const result = await apiCall<ScryfallCard[]>(
    async () => {
      const allCards: ScryfallCard[] = [];
      const batchSize = 75;
      const totalBatches = Math.ceil(cardNames.length / batchSize);

      for (let i = 0; i < cardNames.length; i += batchSize) {
        const batch = cardNames.slice(i, i + batchSize);
        const batchNumber = Math.floor(i / batchSize) + 1;

        const response = await fetch(
          `https://api.scryfall.com/cards/collection`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              identifiers: batch.map((nameObj) => ({
                name: sanitizeCardName(nameObj.name),
              })),
            }),
          }
        );

        if (!response.ok) {
          throw new Error(`Scryfall API error: ${response.status}`);
        }

        const fetchResult = await response.json();
        allCards.push(...(fetchResult.data as ScryfallCard[]));

        onProgress?.(batchNumber, totalBatches);

        if (i + batchSize < cardNames.length) {
          await new Promise((resolve) => setTimeout(resolve, 300));
        }
      }

      return allCards;
    },
    "Unable to fetch detailed card data from Scryfall.",
    { context: "getCardsByNames" }
  );

  return result;
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
