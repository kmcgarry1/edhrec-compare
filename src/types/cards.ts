export type CardFaceSummary = {
  name: string;
  mana_cost?: string;
  type_line?: string;
};

export type CardPriceSummary = {
  usd: string | null;
  eur: string | null;
};

export type DisplayCardManaSymbol = {
  token: string;
  svg: string;
};

export type DisplayCardMeta = {
  cardName: string;
  hasSplitName: boolean;
  primaryName: string;
  secondaryName: string;
  cardTypeFull: string;
  cardTypeShort: string;
  cardSet: string;
  cardRarity: string;
  cardMana: string;
  manaSymbols: DisplayCardManaSymbol[];
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
  display?: DisplayCardMeta;
};

export type CardTableRow = {
  id: string;
  have: boolean;
  card: DisplayCard;
};
