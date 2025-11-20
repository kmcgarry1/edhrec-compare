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
    usd?: string;
    usd_foil?: string;
    eur?: string;
    eur_foil?: string;
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
  try {
    const sanitizedName = sanitizeCardName(cardName);
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
  } catch (error) {
    console.error("Error fetching card from Scryfall:", error);
    throw error;
  }
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
  try {
    const trimmed = partialName.trim();
    if (!trimmed) {
      return [];
    }

    const searchTerm = sanitizeCardName(trimmed) || trimmed;
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

    const result = await response.json();
    const seen = new Set<string>();

    return (
      result.data
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
  } catch (error) {
    console.error("Error searching card names from Scryfall:", error);
    return [];
  }
}

export async function getCardsByNames(
  cardNames: { name: string }[]
): Promise<ScryfallCard[]> {
  try {
    const allCards: ScryfallCard[] = [];
    const batchSize = 75;

    for (let i = 0; i < cardNames.length; i += batchSize) {
      const batch = cardNames.slice(i, i + batchSize);

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

      const result = await response.json();
      allCards.push(...(result.data as ScryfallCard[]));

      // Wait 300ms before next batch (except for the last batch)
      if (i + batchSize < cardNames.length) {
        await new Promise((resolve) => setTimeout(resolve, 300));
      }
    }

    return allCards;
  } catch (error) {
    console.error("Error fetching cards by names from Scryfall:", error);
    throw error;
  }
}

export async function getAllSymbols(): Promise<ScryfallSymbol[]> {
  try {
    const response = await fetch(`https://api.scryfall.com/symbology`);
    if (!response.ok) {
      throw new Error(`Scryfall API error: ${response.status}`);
    }
    const result = await response.json();
    return result.data.map((symbol: any) => ({
      symbol: symbol.symbol,
      svg_uri: symbol.svg_uri,
    }));
  } catch (error) {
    console.error("Error fetching symbols from Scryfall:", error);
    throw error;
  }
}

const PRINTINGS_PAGE_DELAY = 150;
const MAX_PRINTING_RESULTS = 60;

export async function getCardPrintings(
  printsSearchUri: string
): Promise<ScryfallCard[]> {
  try {
    let nextPage: string | null = printsSearchUri;
    const allPrintings: ScryfallCard[] = [];

    while (nextPage) {
      const response = await fetch(nextPage);
      if (!response.ok) {
        throw new Error(`Scryfall API error: ${response.status}`);
      }

      const result: ScryfallListResponse<ScryfallCard> = await response.json();
      allPrintings.push(...result.data);

      if (!result.has_more || allPrintings.length >= MAX_PRINTING_RESULTS) {
        break;
      }

      nextPage = result.next_page ?? null;

      if (nextPage) {
        await new Promise((resolve) => setTimeout(resolve, PRINTINGS_PAGE_DELAY));
      }
    }

    return allPrintings;
  } catch (error) {
    console.error("Error fetching card printings from Scryfall:", error);
    throw error;
  }
}
