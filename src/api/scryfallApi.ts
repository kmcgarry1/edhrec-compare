interface ScryfallCard {
  id: string;
  name: string;
  mana_cost?: string;
  cmc: number;
  type_line: string;
  oracle_text?: string;
  colors: string[];
  set: string;
  rarity: string;
  image_uris?: {
    small: string;
    normal: string;
    large: string;
  };
}

export async function getCard(cardName: string): Promise<ScryfallCard | null> {
  try {
    const response = await fetch(
      `https://api.scryfall.com/cards/named?fuzzy=${encodeURIComponent(
        cardName
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
  return card?.image_uris?.normal || null;
}
