export type CardFaceSummary = {
  name: string;
  mana_cost?: string;
  type_line?: string;
};

export type CardPriceSummary = {
  usd: string | null;
  eur: string | null;
};

export type DisplayCard = {
  id: string;
  name: string;
  mana_cost?: string;
  type_line?: string;
  power?: string | null;
  toughness?: string | null;
  set?: string;
  rarity?: string;
  prices?: CardPriceSummary;
  faces?: CardFaceSummary[];
  scryfall_uri?: string;
};

export type CardTableRow = {
  id: string;
  have: boolean;
  card: DisplayCard;
};
