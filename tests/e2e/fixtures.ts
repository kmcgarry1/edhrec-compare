export const EDHREC_FIXTURE = {
  container: {
    json_dict: {
      card: {
        name: "Atraxa, Grand Unifier",
      },
      cardlists: [
        {
          header: "New Cards",
          cardviews: [
            { id: "sr", name: "Sol Ring" },
            { id: "lg", name: "Lightning Greaves" },
          ],
        },
        {
          header: "High Synergy Cards",
          cardviews: [
            { id: "st", name: "Smothering Tithe" },
            { id: "ar", name: "Arcane Signet" },
          ],
        },
      ],
    },
  },
};

export const SCRYFALL_SEARCH_RESPONSE = {
  data: [
    {
      id: "atraxa-grand-unifier",
      name: "Atraxa, Grand Unifier",
    },
  ],
};

export const SCRYFALL_COLLECTION_RESPONSE = {
  data: [
    {
      id: "sol-ring-id",
      name: "Sol Ring",
      mana_cost: "{1}",
      type_line: "Artifact",
      set: "cmm",
      rarity: "rare",
      prices: { usd: "2.00", eur: "1.80" },
      scryfall_uri: "https://scryfall.com/card/test/sol-ring",
      card_faces: null,
    },
    {
      id: "lightning-greaves-id",
      name: "Lightning Greaves",
      mana_cost: "{2}",
      type_line: "Artifact — Equipment",
      set: "cmm",
      rarity: "rare",
      prices: { usd: "3.50", eur: "3.10" },
      scryfall_uri: "https://scryfall.com/card/test/lightning-greaves",
      card_faces: null,
    },
    {
      id: "smothering-tithe-id",
      name: "Smothering Tithe",
      mana_cost: "{3}{W}",
      type_line: "Enchantment",
      set: "rna",
      rarity: "rare",
      prices: { usd: "34.00", eur: "31.00" },
      scryfall_uri: "https://scryfall.com/card/test/smothering-tithe",
      card_faces: null,
    },
    {
      id: "arcane-signet-id",
      name: "Arcane Signet",
      mana_cost: "{2}",
      type_line: "Artifact",
      set: "cmm",
      rarity: "uncommon",
      prices: { usd: "0.50", eur: "0.40" },
      scryfall_uri: "https://scryfall.com/card/test/arcane-signet",
      card_faces: null,
    },
  ],
};

export const SCRYFALL_SYMBOLS_RESPONSE = {
  data: [
    { symbol: "{G}", svg_uri: "https://example.com/g.svg" },
    { symbol: "{W}", svg_uri: "https://example.com/w.svg" },
    { symbol: "{1}", svg_uri: "https://example.com/1.svg" },
  ],
};

export const SCRYFALL_COMMANDER_RESPONSE = {
  id: "atraxa-grand-unifier",
  name: "Atraxa, Grand Unifier",
  mana_cost: "{G}{W}{U}{B}",
  cmc: 7,
  type_line: "Legendary Creature",
  colors: ["G", "W", "U", "B"],
  color_identity: ["W", "U", "B", "G"],
  set: "one",
  set_name: "Phyrexia: All Will Be One",
  collector_number: "196",
  released_at: "2023-02-03",
  prices: { usd: "12.00", eur: "11.00" },
  prints_search_uri: "https://api.scryfall.com/cards/search?q=atraxa-printings",
  image_uris: {
    normal: "https://example.com/atraxa.jpg",
    art_crop: "https://example.com/atraxa-art.jpg",
  },
  scryfall_uri: "https://scryfall.com/card/one/196/atraxa-grand-unifier",
};

export const SCRYFALL_CARD_IMAGE = {
  id: "modal-card",
  name: "Sol Ring",
  image_uris: {
    normal: "https://example.com/sol-ring.jpg",
  },
  prices: { usd: "2.00", eur: "1.80" },
  set: "cmm",
  set_name: "Commander Masters",
  released_at: "2023-08-04",
  scryfall_uri: "https://scryfall.com/card/test/sol-ring",
};

export const SCRYFALL_RANDOM_CARD_RESPONSE = {
  id: "random-spotlight-card",
  name: "Atraxa, Grand Unifier",
  image_uris: {
    art_crop: "https://example.com/atraxa-art.jpg",
    normal: "https://example.com/atraxa.jpg",
  },
  scryfall_uri: "https://scryfall.com/card/test/atraxa-grand-unifier",
};
