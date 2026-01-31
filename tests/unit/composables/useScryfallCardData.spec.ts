import { describe, it, expect, beforeEach, vi } from "vitest";
import { ref, nextTick } from "vue";
import type { EdhrecCardlist, EdhrecCardview } from "../../../src/types/edhrec";
import type { ScryfallCard } from "../../../src/api/scryfallApi";

const mockGetCardsByNames = vi.fn();
const mockWithLoading = vi.fn();
const mockGetScopeLoading = vi.fn();
const mockUpdateProgress = vi.fn();
const mockSetBackgroundArtUrls = vi.fn();

vi.mock("../../../src/api/scryfallApi", () => ({
  getCardsByNames: mockGetCardsByNames,
}));

vi.mock("../../../src/composables/useGlobalLoading", () => ({
  useGlobalLoading: () => ({
    withLoading: mockWithLoading,
    getScopeLoading: mockGetScopeLoading,
    updateProgress: mockUpdateProgress,
  }),
}));

vi.mock("../../../src/composables/useBackgroundArt", () => ({
  useBackgroundArt: () => ({
    setBackgroundArtUrls: mockSetBackgroundArtUrls,
  }),
}));

type ScryfallCardDataModule = typeof import("../../../src/composables/useScryfallCardData");
let useScryfallCardData: ScryfallCardDataModule["useScryfallCardData"];

beforeEach(async () => {
  vi.clearAllMocks();
  vi.resetModules();

  // Default mock implementations
  mockWithLoading.mockImplementation(async (fn) => await fn());
  mockGetScopeLoading.mockReturnValue(ref(false));
  mockGetCardsByNames.mockResolvedValue([]);

  const module = await import("../../../src/composables/useScryfallCardData");
  useScryfallCardData = module.useScryfallCardData;
});

describe("useScryfallCardData", () => {
  const createMockCardview = (name: string, id: string = "1"): EdhrecCardview => ({
    id,
    name,
    num_decks: 100,
    synergy: 0.5,
    inclusion: 50,
    type: "creature",
  });

  const createMockCardlist = (
    header: string,
    cardviews: EdhrecCardview[]
  ): EdhrecCardlist => ({
    header,
    tag: header.toLowerCase(),
    cardviews,
  });

  const createMockScryfallCard = (
    name: string,
    overrides: Partial<ScryfallCard> = {}
  ): ScryfallCard => ({
    id: `id-${name}`,
    name,
    mana_cost: "{2}{U}",
    type_line: "Creature — Test",
    power: "2",
    toughness: "2",
    set: "test",
    rarity: "rare",
    prices: { usd: "1.00", eur: "0.90" },
    scryfall_uri: `https://scryfall.com/card/${name}`,
    image_uris: {
      art_crop: `https://example.com/${name}-art.jpg`,
      large: `https://example.com/${name}-large.jpg`,
      normal: `https://example.com/${name}.jpg`,
    },
    ...overrides,
  });

  describe("initialization", () => {
    it("should initialize with empty card data", () => {
      const cardlists = ref<EdhrecCardlist[]>([]);
      const options = {
        filterCardviews: (cv: EdhrecCardview[]) => cv,
        isCardInUpload: () => false,
      };

      const composable = useScryfallCardData(cardlists, options);

      expect(composable.bulkCardsLoading.value).toBe(false);
    });

    it("should fetch card data when cardlists are provided", async () => {
      const cardlists = ref<EdhrecCardlist[]>([
        createMockCardlist("Creatures", [
          createMockCardview("Test Card 1"),
          createMockCardview("Test Card 2"),
        ]),
      ]);

      const options = {
        filterCardviews: (cv: EdhrecCardview[]) => cv,
        isCardInUpload: () => false,
      };

      mockGetCardsByNames.mockResolvedValue([
        createMockScryfallCard("Test Card 1"),
        createMockScryfallCard("Test Card 2"),
      ]);

      useScryfallCardData(cardlists, options);

      await nextTick();
      await vi.waitFor(() => mockGetCardsByNames.mock.calls.length > 0);

      expect(mockGetCardsByNames).toHaveBeenCalledWith(
        [{ name: "Test Card 1" }, { name: "Test Card 2" }],
        expect.any(Function)
      );
    });
  });

  describe("batch fetching", () => {
    it("should calculate correct batch size", async () => {
      const cards = Array.from({ length: 100 }, (_, i) =>
        createMockCardview(`Card ${i}`)
      );
      const cardlists = ref<EdhrecCardlist[]>([createMockCardlist("Creatures", cards)]);

      const options = {
        filterCardviews: (cv: EdhrecCardview[]) => cv,
        isCardInUpload: () => false,
      };

      useScryfallCardData(cardlists, options);

      await nextTick();
      await vi.waitFor(() => mockWithLoading.mock.calls.length > 0);

      // Should calculate 2 batches for 100 cards (75 per batch)
      expect(mockWithLoading).toHaveBeenCalledWith(
        expect.any(Function),
        "Fetching detailed card data...",
        "scryfall-bulk",
        2
      );
    });

    it("should handle progress updates", async () => {
      const cardlists = ref<EdhrecCardlist[]>([
        createMockCardlist("Creatures", [createMockCardview("Test Card")]),
      ]);

      const options = {
        filterCardviews: (cv: EdhrecCardview[]) => cv,
        isCardInUpload: () => false,
      };

      let progressCallback: ((current: number) => void) | undefined;
      mockGetCardsByNames.mockImplementation((cards, callback) => {
        progressCallback = callback;
        return Promise.resolve([]);
      });

      useScryfallCardData(cardlists, options);

      await nextTick();
      await vi.waitFor(() => mockGetCardsByNames.mock.calls.length > 0);

      // Simulate progress update
      if (progressCallback) {
        progressCallback(1);
      }

      expect(mockUpdateProgress).toHaveBeenCalledWith("scryfall-bulk", 1);
    });

    it("should handle fetch errors gracefully", async () => {
      const cardlists = ref<EdhrecCardlist[]>([
        createMockCardlist("Creatures", [createMockCardview("Test Card")]),
      ]);

      const options = {
        filterCardviews: (cv: EdhrecCardview[]) => cv,
        isCardInUpload: () => false,
      };

      mockGetCardsByNames.mockRejectedValue(new Error("Network error"));

      useScryfallCardData(cardlists, options);

      await nextTick();
      await vi.waitFor(() => mockGetCardsByNames.mock.calls.length > 0);

      // Should handle error without throwing
      expect(mockGetCardsByNames).toHaveBeenCalled();
    });
  });

  describe("card index building", () => {
    it("should build index by normalized card names", async () => {
      const cardlists = ref<EdhrecCardlist[]>([
        createMockCardlist("Creatures", [createMockCardview("Test Card")]),
      ]);

      const options = {
        filterCardviews: (cv: EdhrecCardview[]) => cv,
        isCardInUpload: () => false,
      };

      mockGetCardsByNames.mockResolvedValue([
        createMockScryfallCard("Test Card", { id: "test-id" }),
      ]);

      const composable = useScryfallCardData(cardlists, options);

      await nextTick();
      await vi.waitFor(() => mockGetCardsByNames.mock.calls.length > 0);

      const rows = composable.getTableRows(cardlists.value[0]);
      expect(rows[0].card.id).toBe("test-id");
    });

    it("should index double-faced cards by both full name and face names", async () => {
      const cardlists = ref<EdhrecCardlist[]>([
        createMockCardlist("Creatures", [
          createMockCardview("Delver of Secrets // Insectile Aberration"),
        ]),
      ]);

      const options = {
        filterCardviews: (cv: EdhrecCardview[]) => cv,
        isCardInUpload: () => false,
      };

      const doubleFacedCard = createMockScryfallCard(
        "Delver of Secrets // Insectile Aberration",
        {
          id: "delver-id",
          card_faces: [
            {
              name: "Delver of Secrets",
              mana_cost: "{U}",
              type_line: "Creature — Human Wizard",
            },
            {
              name: "Insectile Aberration",
              mana_cost: "",
              type_line: "Creature — Human Insect",
            },
          ],
        }
      );

      mockGetCardsByNames.mockResolvedValue([doubleFacedCard]);

      const composable = useScryfallCardData(cardlists, options);

      await nextTick();
      await vi.waitFor(() => mockGetCardsByNames.mock.calls.length > 0);

      const rows = composable.getTableRows(cardlists.value[0]);
      expect(rows[0].card.id).toBe("delver-id");
    });
  });

  describe("background art URLs", () => {
    it("should extract art URLs from cards", async () => {
      const cardlists = ref<EdhrecCardlist[]>([
        createMockCardlist("Creatures", [
          createMockCardview("Card 1"),
          createMockCardview("Card 2"),
        ]),
      ]);

      const options = {
        filterCardviews: (cv: EdhrecCardview[]) => cv,
        isCardInUpload: () => false,
      };

      mockGetCardsByNames.mockResolvedValue([
        createMockScryfallCard("Card 1"),
        createMockScryfallCard("Card 2"),
      ]);

      useScryfallCardData(cardlists, options);

      await nextTick();
      await vi.waitFor(() => mockGetCardsByNames.mock.calls.length > 0);
      await nextTick();
      await vi.waitFor(() => mockSetBackgroundArtUrls.mock.calls.length > 0);

      expect(mockSetBackgroundArtUrls).toHaveBeenCalledWith(
        expect.arrayContaining([
          "https://example.com/Card 1-art.jpg",
          "https://example.com/Card 2-art.jpg",
        ])
      );
    });

    it("should limit background art URLs to 8", async () => {
      const cards = Array.from({ length: 20 }, (_, i) => createMockCardview(`Card ${i}`));
      const cardlists = ref<EdhrecCardlist[]>([createMockCardlist("Creatures", cards)]);

      const options = {
        filterCardviews: (cv: EdhrecCardview[]) => cv,
        isCardInUpload: () => false,
      };

      const scryfallCards = Array.from({ length: 20 }, (_, i) =>
        createMockScryfallCard(`Card ${i}`)
      );
      mockGetCardsByNames.mockResolvedValue(scryfallCards);

      useScryfallCardData(cardlists, options);

      await nextTick();
      await vi.waitFor(() => mockGetCardsByNames.mock.calls.length > 0);
      await nextTick();
      await vi.waitFor(() => mockSetBackgroundArtUrls.mock.calls.length > 0);

      const urls = mockSetBackgroundArtUrls.mock.calls[0][0];
      expect(urls).toHaveLength(8);
    });

    it("should handle cards with no art URLs", async () => {
      const cardlists = ref<EdhrecCardlist[]>([
        createMockCardlist("Creatures", [createMockCardview("Card 1")]),
      ]);

      const options = {
        filterCardviews: (cv: EdhrecCardview[]) => cv,
        isCardInUpload: () => false,
      };

      mockGetCardsByNames.mockResolvedValue([
        createMockScryfallCard("Card 1", { image_uris: undefined }),
      ]);

      useScryfallCardData(cardlists, options);

      await nextTick();
      await vi.waitFor(() => mockGetCardsByNames.mock.calls.length > 0);
      await nextTick();
      await vi.waitFor(() => mockSetBackgroundArtUrls.mock.calls.length > 0);

      expect(mockSetBackgroundArtUrls).toHaveBeenCalledWith([]);
    });

    it("should use card_faces art for double-faced cards", async () => {
      const cardlists = ref<EdhrecCardlist[]>([
        createMockCardlist("Creatures", [createMockCardview("DFC Card")]),
      ]);

      const options = {
        filterCardviews: (cv: EdhrecCardview[]) => cv,
        isCardInUpload: () => false,
      };

      mockGetCardsByNames.mockResolvedValue([
        createMockScryfallCard("DFC Card", {
          image_uris: undefined,
          card_faces: [
            {
              name: "Front Face",
              mana_cost: "{1}{U}",
              type_line: "Creature",
              image_uris: {
                art_crop: "https://example.com/dfc-art.jpg",
                large: "https://example.com/dfc-large.jpg",
                normal: "https://example.com/dfc.jpg",
              },
            },
          ],
        }),
      ]);

      useScryfallCardData(cardlists, options);

      await nextTick();
      await vi.waitFor(() => mockGetCardsByNames.mock.calls.length > 0);
      await nextTick();
      await vi.waitFor(() => mockSetBackgroundArtUrls.mock.calls.length > 0);

      expect(mockSetBackgroundArtUrls).toHaveBeenCalledWith([
        "https://example.com/dfc-art.jpg",
      ]);
    });

    it("should not duplicate art URLs", async () => {
      const cardlists = ref<EdhrecCardlist[]>([
        createMockCardlist("Creatures", [
          createMockCardview("Card 1"),
          createMockCardview("Card 1"), // Duplicate
        ]),
      ]);

      const options = {
        filterCardviews: (cv: EdhrecCardview[]) => cv,
        isCardInUpload: () => false,
      };

      mockGetCardsByNames.mockResolvedValue([
        createMockScryfallCard("Card 1"),
        createMockScryfallCard("Card 1"),
      ]);

      useScryfallCardData(cardlists, options);

      await nextTick();
      await vi.waitFor(() => mockGetCardsByNames.mock.calls.length > 0);
      await nextTick();
      await vi.waitFor(() => mockSetBackgroundArtUrls.mock.calls.length > 0);

      const urls = mockSetBackgroundArtUrls.mock.calls[0][0];
      expect(urls).toHaveLength(1);
    });
  });

  describe("getTableRows", () => {
    it("should generate table rows from cardlist", async () => {
      const cardlists = ref<EdhrecCardlist[]>([
        createMockCardlist("Creatures", [createMockCardview("Test Card", "cv-1")]),
      ]);

      const options = {
        filterCardviews: (cv: EdhrecCardview[]) => cv,
        isCardInUpload: () => false,
      };

      mockGetCardsByNames.mockResolvedValue([
        createMockScryfallCard("Test Card", { id: "sf-1" }),
      ]);

      const composable = useScryfallCardData(cardlists, options);

      await nextTick();
      await vi.waitFor(() => mockGetCardsByNames.mock.calls.length > 0);

      const rows = composable.getTableRows(cardlists.value[0]);

      expect(rows).toHaveLength(1);
      expect(rows[0].id).toBe("sf-1");
      expect(rows[0].card.name).toBe("Test Card");
      expect(rows[0].have).toBe(false);
    });

    it("should apply filter to cardviews", async () => {
      const cardlists = ref<EdhrecCardlist[]>([
        createMockCardlist("Creatures", [
          createMockCardview("Card 1"),
          createMockCardview("Card 2"),
        ]),
      ]);

      const options = {
        filterCardviews: (cv: EdhrecCardview[]) => cv.filter((c) => c.name === "Card 1"),
        isCardInUpload: () => false,
      };

      mockGetCardsByNames.mockResolvedValue([
        createMockScryfallCard("Card 1"),
        createMockScryfallCard("Card 2"),
      ]);

      const composable = useScryfallCardData(cardlists, options);

      await nextTick();
      await vi.waitFor(() => mockGetCardsByNames.mock.calls.length > 0);

      const rows = composable.getTableRows(cardlists.value[0]);

      expect(rows).toHaveLength(1);
      expect(rows[0].card.name).toBe("Card 1");
    });

    it("should mark cards in upload as owned", async () => {
      const cardlists = ref<EdhrecCardlist[]>([
        createMockCardlist("Creatures", [
          createMockCardview("Card 1"),
          createMockCardview("Card 2"),
        ]),
      ]);

      const options = {
        filterCardviews: (cv: EdhrecCardview[]) => cv,
        isCardInUpload: (name: string) => name === "Card 1",
      };

      mockGetCardsByNames.mockResolvedValue([
        createMockScryfallCard("Card 1"),
        createMockScryfallCard("Card 2"),
      ]);

      const composable = useScryfallCardData(cardlists, options);

      await nextTick();
      await vi.waitFor(() => mockGetCardsByNames.mock.calls.length > 0);

      const rows = composable.getTableRows(cardlists.value[0]);

      expect(rows[0].have).toBe(true);
      expect(rows[1].have).toBe(false);
    });

    it("should handle cards with no Scryfall data", async () => {
      const cardlists = ref<EdhrecCardlist[]>([
        createMockCardlist("Creatures", [createMockCardview("Unknown Card", "cv-1")]),
      ]);

      const options = {
        filterCardviews: (cv: EdhrecCardview[]) => cv,
        isCardInUpload: () => false,
      };

      mockGetCardsByNames.mockResolvedValue([]);

      const composable = useScryfallCardData(cardlists, options);

      await nextTick();
      await vi.waitFor(() => mockGetCardsByNames.mock.calls.length > 0);

      const rows = composable.getTableRows(cardlists.value[0]);

      expect(rows).toHaveLength(1);
      expect(rows[0].id).toBe("Creatures-cv-1");
      expect(rows[0].card.name).toBe("Unknown Card");
      expect(rows[0].card.mana_cost).toBe("");
    });

    it("should handle double-faced cards with face selection", async () => {
      const cardlists = ref<EdhrecCardlist[]>([
        createMockCardlist("Creatures", [
          createMockCardview("Delver of Secrets // Insectile Aberration"),
        ]),
      ]);

      const options = {
        filterCardviews: (cv: EdhrecCardview[]) => cv,
        isCardInUpload: () => false,
      };

      const doubleFacedCard = createMockScryfallCard(
        "Delver of Secrets // Insectile Aberration",
        {
          card_faces: [
            {
              name: "Delver of Secrets",
              mana_cost: "{U}",
              type_line: "Creature — Human Wizard",
              power: "1",
              toughness: "1",
            },
            {
              name: "Insectile Aberration",
              mana_cost: "",
              type_line: "Creature — Human Insect",
              power: "3",
              toughness: "2",
            },
          ],
        }
      );

      mockGetCardsByNames.mockResolvedValue([doubleFacedCard]);

      const composable = useScryfallCardData(cardlists, options);

      await nextTick();
      await vi.waitFor(() => mockGetCardsByNames.mock.calls.length > 0);

      const rows = composable.getTableRows(cardlists.value[0]);

      expect(rows[0].card.faces).toHaveLength(2);
      expect(rows[0].card.faces![0].name).toBe("Delver of Secrets");
      expect(rows[0].card.faces![1].name).toBe("Insectile Aberration");
    });

    it("should use matched face for stats when name contains //", async () => {
      const cardlists = ref<EdhrecCardlist[]>([
        createMockCardlist("Creatures", [
          createMockCardview("Delver of Secrets // Insectile Aberration"),
        ]),
      ]);

      const options = {
        filterCardviews: (cv: EdhrecCardview[]) => cv,
        isCardInUpload: () => false,
      };

      const doubleFacedCard = createMockScryfallCard(
        "Delver of Secrets // Insectile Aberration",
        {
          mana_cost: "",
          type_line: "",
          card_faces: [
            {
              name: "Delver of Secrets",
              mana_cost: "{U}",
              type_line: "Creature — Human Wizard",
            },
            {
              name: "Insectile Aberration",
              mana_cost: "",
              type_line: "Creature — Human Insect",
            },
          ],
        }
      );

      mockGetCardsByNames.mockResolvedValue([doubleFacedCard]);

      const composable = useScryfallCardData(cardlists, options);

      await nextTick();
      await vi.waitFor(() => mockGetCardsByNames.mock.calls.length > 0);

      const rows = composable.getTableRows(cardlists.value[0]);

      // Should use first face's mana cost
      expect(rows[0].card.mana_cost).toBe("{U}");
      expect(rows[0].card.type_line).toBe("Creature — Human Wizard");
    });
  });

  describe("reactive updates", () => {
    it("should refetch when cardlists change", async () => {
      const cardlists = ref<EdhrecCardlist[]>([
        createMockCardlist("Creatures", [createMockCardview("Card 1")]),
      ]);

      const options = {
        filterCardviews: (cv: EdhrecCardview[]) => cv,
        isCardInUpload: () => false,
      };

      mockGetCardsByNames.mockResolvedValue([createMockScryfallCard("Card 1")]);

      useScryfallCardData(cardlists, options);

      await nextTick();
      await vi.waitFor(() => mockGetCardsByNames.mock.calls.length > 0);

      mockGetCardsByNames.mockClear();

      // Update cardlists
      cardlists.value = [
        createMockCardlist("Creatures", [createMockCardview("Card 2")]),
      ];

      await nextTick();
      await vi.waitFor(() => mockGetCardsByNames.mock.calls.length > 0);

      expect(mockGetCardsByNames).toHaveBeenCalledWith(
        [{ name: "Card 2" }],
        expect.any(Function)
      );
    });

    it("should clear data when cardlists becomes empty", async () => {
      const cardlists = ref<EdhrecCardlist[]>([
        createMockCardlist("Creatures", [createMockCardview("Card 1")]),
      ]);

      const options = {
        filterCardviews: (cv: EdhrecCardview[]) => cv,
        isCardInUpload: () => false,
      };

      mockGetCardsByNames.mockResolvedValue([createMockScryfallCard("Card 1")]);

      useScryfallCardData(cardlists, options);

      await nextTick();
      await vi.waitFor(() => mockGetCardsByNames.mock.calls.length > 0);

      mockGetCardsByNames.mockClear();

      // Clear cardlists
      cardlists.value = [];

      await nextTick();

      // Should not fetch anything
      expect(mockGetCardsByNames).not.toHaveBeenCalled();
    });
  });
});
