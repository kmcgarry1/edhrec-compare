export const EDHREC_FIXTURE = {
  container: {
    json_dict: {
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

export const SCRYFALL_CARD_IMAGE = {
  id: "modal-card",
  name: "Sol Ring",
  image_uris: {
    normal: "https://example.com/sol-ring.jpg",
  },
  scryfall_uri: "https://scryfall.com/card/test/sol-ring",
};
