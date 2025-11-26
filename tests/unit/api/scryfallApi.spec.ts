import { describe, it, expect, vi, beforeEach, type MockedFunction } from "vitest";
import {
  getCard,
  getCardImage,
  searchCardNames,
  getCardsByNames,
  getAllSymbols,
  getCardPrintings,
  type ScryfallCard,
} from "../../../src/api/scryfallApi";
import { cardCache } from "../../../src/api/indexedDbCache";

// Mock fetch globally
const mockFetch = vi.fn() as MockedFunction<typeof fetch>;
global.fetch = mockFetch;

describe("scryfallApi", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  describe("getCard", () => {
    it("should fetch and return a card successfully", async () => {
      const mockCard: ScryfallCard = {
        id: "123",
        name: "Lightning Bolt",
        cmc: 1,
        type_line: "Instant",
        colors: ["R"],
        set: "lea",
        rarity: "common",
        prices: {},
      };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockCard,
      });

      const result = await getCard("Lightning Bolt");
      expect(result).toEqual(mockCard);
      expect(global.fetch).toHaveBeenCalledWith(
        "https://api.scryfall.com/cards/named?fuzzy=Lightning%20Bolt"
      );
    });

    it("should sanitize double-faced card names", async () => {
      const mockCard: ScryfallCard = {
        id: "456",
        name: "Delver of Secrets",
        cmc: 1,
        type_line: "Creature",
        colors: ["U"],
        set: "isd",
        rarity: "common",
        prices: {},
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockCard,
      });

      await getCard("Delver of Secrets // Insectile Aberration");
      expect(global.fetch).toHaveBeenCalledWith(
        "https://api.scryfall.com/cards/named?fuzzy=Delver%20of%20Secrets"
      );
    });

    it("should return null for 404 responses", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      const result = await getCard("Nonexistent Card");
      expect(result).toBeNull();
    });

    it("should throw error for non-404 failures", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      await expect(getCard("Some Card")).rejects.toThrow("Scryfall API error: 500");
    });

    it("should return cached card when available", async () => {
      const cachedCard: ScryfallCard = {
        id: "cached",
        name: "Cached Commander",
        cmc: 4,
        type_line: "Legendary Creature",
        colors: ["G", "U"],
        set: "cmm",
        rarity: "mythic",
        prices: {},
      };

      const getCacheSpy = vi.spyOn(cardCache, "getCachedCard").mockResolvedValueOnce(cachedCard);
      const setCacheSpy = vi.spyOn(cardCache, "setCachedCard");

      const result = await getCard("Cached Commander");

      expect(result).toBe(cachedCard);
      expect(global.fetch).not.toHaveBeenCalled();
      expect(setCacheSpy).not.toHaveBeenCalled();

      getCacheSpy.mockRestore();
      setCacheSpy.mockRestore();
    });
  });

  describe("getCardImage", () => {
    it("should return image from image_uris", async () => {
      const mockCard: ScryfallCard = {
        id: "123",
        name: "Lightning Bolt",
        cmc: 1,
        type_line: "Instant",
        colors: ["R"],
        set: "lea",
        rarity: "common",
        image_uris: { normal: "https://example.com/image.jpg" },
        prices: {},
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockCard,
      });

      const result = await getCardImage("Lightning Bolt");
      expect(result).toBe("https://example.com/image.jpg");
    });

    it("should return image from card_faces", async () => {
      const mockCard: ScryfallCard = {
        id: "456",
        name: "Delver of Secrets",
        cmc: 1,
        type_line: "Creature",
        colors: ["U"],
        set: "isd",
        rarity: "common",
        card_faces: [
          {
            name: "Delver of Secrets",
            image_uris: { normal: "https://example.com/delver.jpg" },
          },
        ],
        prices: {},
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockCard,
      });

      const result = await getCardImage("Delver of Secrets");
      expect(result).toBe("https://example.com/delver.jpg");
    });

    it("should return null when card not found", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      const result = await getCardImage("Nonexistent Card");
      expect(result).toBeNull();
    });
  });

  describe("searchCardNames", () => {
    it("should search and return card names", async () => {
      const mockResponse = {
        data: [
          { name: "Atraxa, Praetors' Voice" } as ScryfallCard,
          { name: "Atraxa, Grand Unifier" } as ScryfallCard,
        ],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await searchCardNames("Atraxa");
      expect(result).toEqual(["Atraxa, Praetors' Voice", "Atraxa, Grand Unifier"]);
    });

    it("should return empty array for empty input", async () => {
      const result = await searchCardNames("  ");
      expect(result).toEqual([]);
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it("should deduplicate card names", async () => {
      const mockResponse = {
        data: [
          { name: "Atraxa" } as ScryfallCard,
          { name: "Atraxa" } as ScryfallCard,
          { name: "ATRAXA" } as ScryfallCard,
        ],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await searchCardNames("Atraxa");
      expect(result).toEqual(["Atraxa"]);
    });

    it("should return empty array on 404", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      const result = await searchCardNames("xyz");
      expect(result).toEqual([]);
    });
  });

  describe("getCardsByNames", () => {
    it("should fetch cards in batches", async () => {
      const mockCards: ScryfallCard[] = Array.from({ length: 10 }, (_, i) => ({
        id: `${i}`,
        name: `Card ${i}`,
        cmc: 1,
        type_line: "Instant",
        colors: [],
        set: "lea",
        rarity: "common",
        prices: {},
      }));

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockCards }),
      });

      const cardNames = mockCards.map((c) => ({ name: c.name }));
      const result = await getCardsByNames(cardNames);
      expect(result).toHaveLength(10);
    });

    it("should handle multiple batches with delay", async () => {
      vi.useFakeTimers();
      const mockCards = Array.from({ length: 150 }, (_, i) => ({
        id: `${i}`,
        name: `Card ${i}`,
        cmc: 1,
        type_line: "Instant",
        colors: [],
        set: "lea",
        rarity: "common",
        prices: {},
      }));

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ data: [] }),
      });

      const cardNames = mockCards.map((c) => ({ name: c.name }));
      const promise = getCardsByNames(cardNames);

      await vi.runAllTimersAsync();
      await promise;

      expect(global.fetch).toHaveBeenCalledTimes(2);
      vi.useRealTimers();
    });

    it("should throw on API error", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      await expect(getCardsByNames([{ name: "Card" }])).rejects.toThrow();
    });

    it("should use cached results before fetching missing cards", async () => {
      const cachedCard: ScryfallCard = {
        id: "cached",
        name: "Cached Card",
        cmc: 3,
        type_line: "Creature",
        colors: ["W"],
        set: "dom",
        rarity: "rare",
        prices: {},
      };
      const freshCard: ScryfallCard = {
        id: "fresh",
        name: "New Card",
        cmc: 2,
        type_line: "Instant",
        colors: ["U"],
        set: "neo",
        rarity: "uncommon",
        prices: {},
      };

      const getCacheSpy = vi
        .spyOn(cardCache, "getCachedCard")
        .mockImplementation(async (key) => (key === "cached card" ? cachedCard : null));
      const setCacheSpy = vi.spyOn(cardCache, "setCachedCard").mockResolvedValue(undefined);

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [freshCard] }),
      });

      const result = await getCardsByNames([{ name: "Cached Card" }, { name: "New Card" }]);

      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(result).toContainEqual(cachedCard);
      expect(result).toContainEqual(freshCard);
      expect(setCacheSpy).toHaveBeenCalledWith("new card", freshCard);

      getCacheSpy.mockRestore();
      setCacheSpy.mockRestore();
    });
  });

  describe("getAllSymbols", () => {
    it("should fetch and return all symbols", async () => {
      const mockSymbols = [
        { symbol: "{W}", svg_uri: "https://example.com/w.svg" },
        { symbol: "{U}", svg_uri: "https://example.com/u.svg" },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockSymbols }),
      });

      const result = await getAllSymbols();
      expect(result).toEqual(mockSymbols);
    });

    it("should throw on API error", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      await expect(getAllSymbols()).rejects.toThrow("Scryfall API error: 500");
    });
  });

  describe("getCardPrintings", () => {
    it("should fetch single page of printings", async () => {
      const mockPrintings: ScryfallCard[] = [
        {
          id: "1",
          name: "Lightning Bolt",
          cmc: 1,
          type_line: "Instant",
          colors: ["R"],
          set: "lea",
          rarity: "common",
          prices: {},
        },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockPrintings, has_more: false }),
      });

      const result = await getCardPrintings("https://api.scryfall.com/cards/search?q=test");
      expect(result).toEqual(mockPrintings);
    });

    it("should fetch multiple pages with delay", async () => {
      vi.useFakeTimers();

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            data: [
              {
                id: "1",
                name: "Card 1",
                cmc: 1,
                type_line: "Instant",
                colors: [],
                set: "lea",
                rarity: "common",
                prices: {},
              },
            ],
            has_more: true,
            next_page: "https://api.scryfall.com/page2",
          }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            data: [
              {
                id: "2",
                name: "Card 2",
                cmc: 1,
                type_line: "Instant",
                colors: [],
                set: "lea",
                rarity: "common",
                prices: {},
              },
            ],
            has_more: false,
          }),
        });

      const promise = getCardPrintings("https://api.scryfall.com/cards/search?q=test");
      await vi.runAllTimersAsync();
      const result = await promise;

      expect(result).toHaveLength(2);
      vi.useRealTimers();
    });

    it("should respect MAX_PRINTING_RESULTS limit", async () => {
      const mockData = Array.from({ length: 30 }, (_, i) => ({
        id: `${i}`,
        name: `Card ${i}`,
        cmc: 1,
        type_line: "Instant",
        colors: [],
        set: "lea",
        rarity: "common",
        prices: {},
      }));

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            data: mockData,
            has_more: true,
            next_page: "https://api.scryfall.com/page2",
          }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            data: mockData,
            has_more: true,
            next_page: "https://api.scryfall.com/page3",
          }),
        });

      const result = await getCardPrintings("https://api.scryfall.com/cards/search?q=test");
      expect(result.length).toBeLessThanOrEqual(60);
    });

    it("should throw on API error", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      await expect(getCardPrintings("https://api.scryfall.com/test")).rejects.toThrow();
    });
  });
});
