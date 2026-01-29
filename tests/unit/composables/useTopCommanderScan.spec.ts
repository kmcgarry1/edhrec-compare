import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";

// Mock dependencies before imports
vi.mock("../../../src/api/edhrecApi", () => ({
  getTopCommanders: vi.fn(),
  getAverageDeckCards: vi.fn(),
}));

vi.mock("../../../src/composables/useGlobalLoading", () => ({
  useGlobalLoading: vi.fn(() => ({
    startLoading: vi.fn(),
    stopLoading: vi.fn(),
    updateProgress: vi.fn(),
    getScopeLoading: vi.fn(() => ({ value: false })),
  })),
}));

vi.mock("../../../src/utils/errorHandler", () => ({
  handleError: vi.fn((error) => ({
    userMessage:
      error instanceof Error ? error.message : "An error occurred",
  })),
}));

type TopCommanderScanModule = typeof import("../../../src/composables/useTopCommanderScan");
type EdhrecApiModule = typeof import("../../../src/api/edhrecApi");
type GlobalLoadingModule = typeof import("../../../src/composables/useGlobalLoading");

let useTopCommanderScan: TopCommanderScanModule["useTopCommanderScan"];
let getTopCommanders: EdhrecApiModule["getTopCommanders"];
let getAverageDeckCards: EdhrecApiModule["getAverageDeckCards"];
let useGlobalLoading: GlobalLoadingModule["useGlobalLoading"];

let mockStartLoading: ReturnType<typeof vi.fn>;
let mockStopLoading: ReturnType<typeof vi.fn>;
let mockUpdateProgress: ReturnType<typeof vi.fn>;
let mockGetScopeLoading: ReturnType<typeof vi.fn>;

beforeEach(async () => {
  vi.resetModules();
  vi.clearAllMocks();

  // Import mocked modules
  const edhrecApi = await import("../../../src/api/edhrecApi");
  getTopCommanders = edhrecApi.getTopCommanders;
  getAverageDeckCards = edhrecApi.getAverageDeckCards;

  // Setup loading mocks
  mockStartLoading = vi.fn();
  mockStopLoading = vi.fn();
  mockUpdateProgress = vi.fn();
  mockGetScopeLoading = vi.fn(() => ({ value: false }));

  const loadingModule = await import("../../../src/composables/useGlobalLoading");
  useGlobalLoading = loadingModule.useGlobalLoading;
  vi.mocked(useGlobalLoading).mockReturnValue({
    startLoading: mockStartLoading,
    stopLoading: mockStopLoading,
    updateProgress: mockUpdateProgress,
    getScopeLoading: mockGetScopeLoading,
    isLoading: { value: false },
    loadingMessage: { value: "Loading..." },
    getScopeMessage: vi.fn(),
    getScopeProgress: vi.fn(),
    withLoading: vi.fn(),
  });

  // Import the composable fresh
  const module = await import("../../../src/composables/useTopCommanderScan");
  useTopCommanderScan = module.useTopCommanderScan;
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("useTopCommanderScan", () => {
  describe("initial state", () => {
    it("should initialize with empty results", () => {
      const scan = useTopCommanderScan();
      expect(scan.results.value).toEqual([]);
    });

    it("should initialize with null lastUpdated", () => {
      const scan = useTopCommanderScan();
      expect(scan.lastUpdated.value).toBeNull();
    });

    it("should initialize with null error", () => {
      const scan = useTopCommanderScan();
      expect(scan.error.value).toBeNull();
    });

    it("should initialize with zero failedCount", () => {
      const scan = useTopCommanderScan();
      expect(scan.failedCount.value).toBe(0);
    });

    it("should initialize with default sourceLabel", () => {
      const scan = useTopCommanderScan();
      expect(scan.sourceLabel.value).toBe("Top Commanders (Past 2 Years)");
    });

    it("should expose the correct scope", () => {
      const scan = useTopCommanderScan();
      expect(scan.scope).toBe("commander-scout");
    });
  });

  describe("runScan - basic functionality", () => {
    it("should set error when no rows provided", async () => {
      const scan = useTopCommanderScan();
      await scan.runScan([], ["Name"]);
      
      expect(scan.error.value).toBe("Upload a CSV to run the commander scan.");
      expect(getTopCommanders).not.toHaveBeenCalled();
    });

    it("should fetch top commanders with default limit", async () => {
      vi.mocked(getTopCommanders).mockResolvedValue({
        header: "Top Commanders",
        commanders: [
          {
            name: "Atraxa, Praetors' Voice",
            slug: "atraxa-praetors-voice",
            rank: 1,
            deckCount: 1000,
          },
        ],
      });
      vi.mocked(getAverageDeckCards).mockResolvedValue([
        "Sol Ring",
        "Command Tower",
      ]);

      const scan = useTopCommanderScan();
      await scan.runScan([["Sol Ring"], ["Command Tower"]], ["Name"]);

      expect(getTopCommanders).toHaveBeenCalledWith(50, { path: "commanders/year" });
    });

    it("should fetch top commanders with custom limit", async () => {
      vi.mocked(getTopCommanders).mockResolvedValue({
        header: "Top Commanders",
        commanders: [],
      });

      const scan = useTopCommanderScan();
      await scan.runScan([["Sol Ring"]], ["Name"], { limit: 100 });

      expect(getTopCommanders).toHaveBeenCalledWith(100, { path: "commanders/year" });
    });

    it("should fetch top commanders with custom path", async () => {
      vi.mocked(getTopCommanders).mockResolvedValue({
        header: "Top Commanders",
        commanders: [],
      });

      const scan = useTopCommanderScan();
      await scan.runScan([["Sol Ring"]], ["Name"], { path: "commanders/month" });

      expect(getTopCommanders).toHaveBeenCalledWith(50, { path: "commanders/month" });
    });

    it("should update sourceLabel from API response", async () => {
      vi.mocked(getTopCommanders).mockResolvedValue({
        header: "Monthly Top Commanders",
        commanders: [
          {
            name: "Atraxa, Praetors' Voice",
            slug: "atraxa-praetors-voice",
            rank: 1,
            deckCount: 1000,
          },
        ],
      });
      vi.mocked(getAverageDeckCards).mockResolvedValue(["Sol Ring"]);

      const scan = useTopCommanderScan();
      await scan.runScan([["Sol Ring"]], ["Name"]);

      expect(scan.sourceLabel.value).toBe("Monthly Top Commanders");
    });
  });

  describe("runScan - card ownership calculation", () => {
    it("should calculate owned cards correctly", async () => {
      vi.mocked(getTopCommanders).mockResolvedValue({
        header: "Top Commanders",
        commanders: [
          {
            name: "Atraxa, Praetors' Voice",
            slug: "atraxa-praetors-voice",
            rank: 1,
            deckCount: 1000,
          },
        ],
      });
      vi.mocked(getAverageDeckCards).mockResolvedValue([
        "Sol Ring",
        "Command Tower",
        "Arcane Signet",
      ]);

      const scan = useTopCommanderScan();
      await scan.runScan(
        [["Sol Ring"], ["Command Tower"]],
        ["Name"]
      );

      expect(scan.results.value).toHaveLength(1);
      expect(scan.results.value[0]).toMatchObject({
        name: "Atraxa, Praetors' Voice",
        slug: "atraxa-praetors-voice",
        rank: 1,
        deckCount: 1000,
        totalCards: 3,
        ownedCards: 2,
        ownedPercent: expect.closeTo(66.67, 0.1),
      });
    });

    it("should handle double-faced card names", async () => {
      vi.mocked(getTopCommanders).mockResolvedValue({
        header: "Top Commanders",
        commanders: [
          {
            name: "Test Commander",
            slug: "test-commander",
            rank: 1,
            deckCount: 500,
          },
        ],
      });
      vi.mocked(getAverageDeckCards).mockResolvedValue([
        "Delver of Secrets // Insectile Aberration",
        "Sol Ring",
      ]);

      const scan = useTopCommanderScan();
      await scan.runScan(
        [["Delver of Secrets"]],
        ["Name"]
      );

      expect(scan.results.value[0]?.ownedCards).toBe(1);
    });

    it("should normalize card names for matching", async () => {
      vi.mocked(getTopCommanders).mockResolvedValue({
        header: "Top Commanders",
        commanders: [
          {
            name: "Test Commander",
            slug: "test-commander",
            rank: 1,
            deckCount: 500,
          },
        ],
      });
      vi.mocked(getAverageDeckCards).mockResolvedValue([
        "sol ring",
        "COMMAND TOWER",
      ]);

      const scan = useTopCommanderScan();
      await scan.runScan(
        [["Sol Ring"], ["Command Tower"]],
        ["Name"]
      );

      expect(scan.results.value[0]?.ownedCards).toBe(2);
    });

    it("should handle duplicate card names in average deck", async () => {
      vi.mocked(getTopCommanders).mockResolvedValue({
        header: "Top Commanders",
        commanders: [
          {
            name: "Test Commander",
            slug: "test-commander",
            rank: 1,
            deckCount: 500,
          },
        ],
      });
      vi.mocked(getAverageDeckCards).mockResolvedValue([
        "Sol Ring",
        "Sol Ring",
        "Sol Ring",
      ]);

      const scan = useTopCommanderScan();
      await scan.runScan([["Sol Ring"]], ["Name"]);

      expect(scan.results.value[0]?.totalCards).toBe(1);
    });

    it("should calculate 0% when no cards owned", async () => {
      vi.mocked(getTopCommanders).mockResolvedValue({
        header: "Top Commanders",
        commanders: [
          {
            name: "Test Commander",
            slug: "test-commander",
            rank: 1,
            deckCount: 500,
          },
        ],
      });
      vi.mocked(getAverageDeckCards).mockResolvedValue([
        "Sol Ring",
        "Command Tower",
      ]);

      const scan = useTopCommanderScan();
      await scan.runScan([["Arcane Signet"]], ["Name"]);

      expect(scan.results.value[0]?.ownedPercent).toBe(0);
    });

    it("should calculate 100% when all cards owned", async () => {
      vi.mocked(getTopCommanders).mockResolvedValue({
        header: "Top Commanders",
        commanders: [
          {
            name: "Test Commander",
            slug: "test-commander",
            rank: 1,
            deckCount: 500,
          },
        ],
      });
      vi.mocked(getAverageDeckCards).mockResolvedValue([
        "Sol Ring",
        "Command Tower",
      ]);

      const scan = useTopCommanderScan();
      await scan.runScan(
        [["Sol Ring"], ["Command Tower"]],
        ["Name"]
      );

      expect(scan.results.value[0]?.ownedPercent).toBe(100);
    });
  });

  describe("runScan - multiple commanders", () => {
    it("should process multiple commanders", async () => {
      vi.mocked(getTopCommanders).mockResolvedValue({
        header: "Top Commanders",
        commanders: [
          {
            name: "Commander 1",
            slug: "commander-1",
            rank: 1,
            deckCount: 1000,
          },
          {
            name: "Commander 2",
            slug: "commander-2",
            rank: 2,
            deckCount: 900,
          },
          {
            name: "Commander 3",
            slug: "commander-3",
            rank: 3,
            deckCount: 800,
          },
        ],
      });
      vi.mocked(getAverageDeckCards)
        .mockResolvedValueOnce(["Sol Ring", "Command Tower"])
        .mockResolvedValueOnce(["Sol Ring", "Arcane Signet"])
        .mockResolvedValueOnce(["Command Tower", "Arcane Signet"]);

      const scan = useTopCommanderScan();
      await scan.runScan([["Sol Ring"]], ["Name"]);

      expect(scan.results.value).toHaveLength(3);
      expect(scan.results.value[0]?.name).toBe("Commander 1");
      expect(scan.results.value[1]?.name).toBe("Commander 2");
      expect(scan.results.value[2]?.name).toBe("Commander 3");
    });

    it("should call getAverageDeckCards for each commander", async () => {
      vi.mocked(getTopCommanders).mockResolvedValue({
        header: "Top Commanders",
        commanders: [
          {
            name: "Commander 1",
            slug: "commander-1",
            rank: 1,
            deckCount: 1000,
          },
          {
            name: "Commander 2",
            slug: "commander-2",
            rank: 2,
            deckCount: 900,
          },
        ],
      });
      vi.mocked(getAverageDeckCards).mockResolvedValue(["Sol Ring"]);

      const scan = useTopCommanderScan();
      await scan.runScan([["Sol Ring"]], ["Name"]);

      expect(getAverageDeckCards).toHaveBeenCalledTimes(2);
      expect(getAverageDeckCards).toHaveBeenCalledWith("commander-1");
      expect(getAverageDeckCards).toHaveBeenCalledWith("commander-2");
    });
  });

  describe("runScan - loading state", () => {
    it("should start loading with correct scope", async () => {
      vi.mocked(getTopCommanders).mockResolvedValue({
        header: "Top Commanders",
        commanders: [
          {
            name: "Test Commander",
            slug: "test-commander",
            rank: 1,
            deckCount: 500,
          },
        ],
      });
      vi.mocked(getAverageDeckCards).mockResolvedValue(["Sol Ring"]);

      const scan = useTopCommanderScan();
      await scan.runScan([["Sol Ring"]], ["Name"]);

      expect(mockStartLoading).toHaveBeenCalledWith(
        "Scanning top commanders...",
        "commander-scout",
        1
      );
    });

    it("should stop loading after scan completes", async () => {
      vi.mocked(getTopCommanders).mockResolvedValue({
        header: "Top Commanders",
        commanders: [
          {
            name: "Test Commander",
            slug: "test-commander",
            rank: 1,
            deckCount: 500,
          },
        ],
      });
      vi.mocked(getAverageDeckCards).mockResolvedValue(["Sol Ring"]);

      const scan = useTopCommanderScan();
      await scan.runScan([["Sol Ring"]], ["Name"]);

      expect(mockStopLoading).toHaveBeenCalledWith("commander-scout");
    });

    it("should update progress during scan", async () => {
      vi.mocked(getTopCommanders).mockResolvedValue({
        header: "Top Commanders",
        commanders: [
          {
            name: "Commander 1",
            slug: "commander-1",
            rank: 1,
            deckCount: 1000,
          },
          {
            name: "Commander 2",
            slug: "commander-2",
            rank: 2,
            deckCount: 900,
          },
        ],
      });
      vi.mocked(getAverageDeckCards).mockResolvedValue(["Sol Ring"]);

      const scan = useTopCommanderScan();
      await scan.runScan([["Sol Ring"]], ["Name"]);

      expect(mockUpdateProgress).toHaveBeenCalledWith("commander-scout", 1);
      expect(mockUpdateProgress).toHaveBeenCalledWith("commander-scout", 2);
    });

    it("should initialize progress to 0", async () => {
      vi.mocked(getTopCommanders).mockResolvedValue({
        header: "Top Commanders",
        commanders: [
          {
            name: "Test Commander",
            slug: "test-commander",
            rank: 1,
            deckCount: 500,
          },
        ],
      });
      vi.mocked(getAverageDeckCards).mockResolvedValue(["Sol Ring"]);

      const scan = useTopCommanderScan();
      await scan.runScan([["Sol Ring"]], ["Name"]);

      expect(mockUpdateProgress).toHaveBeenCalledWith("commander-scout", 0);
    });
  });

  describe("runScan - error handling", () => {
    it("should handle error when fetching top commanders fails", async () => {
      vi.mocked(getTopCommanders).mockRejectedValue(
        new Error("Network error")
      );

      const scan = useTopCommanderScan();
      await scan.runScan([["Sol Ring"]], ["Name"]);

      expect(scan.error.value).toBeTruthy();
      expect(scan.results.value).toEqual([]);
    });

    it("should handle error when no commanders returned", async () => {
      vi.mocked(getTopCommanders).mockResolvedValue({
        header: "Top Commanders",
        commanders: [],
      });

      const scan = useTopCommanderScan();
      await scan.runScan([["Sol Ring"]], ["Name"]);

      expect(scan.error.value).toBeTruthy();
    });

    it("should stop loading even if error occurs during scan", async () => {
      vi.mocked(getTopCommanders).mockResolvedValue({
        header: "Top Commanders",
        commanders: [
          {
            name: "Test Commander",
            slug: "test-commander",
            rank: 1,
            deckCount: 500,
          },
        ],
      });
      vi.mocked(getAverageDeckCards).mockRejectedValue(
        new Error("Network error during card fetch")
      );

      const scan = useTopCommanderScan();
      await scan.runScan([["Sol Ring"]], ["Name"]);

      expect(mockStopLoading).toHaveBeenCalledWith("commander-scout");
    });

    it("should increment failedCount when average deck fetch fails", async () => {
      vi.mocked(getTopCommanders).mockResolvedValue({
        header: "Top Commanders",
        commanders: [
          {
            name: "Commander 1",
            slug: "commander-1",
            rank: 1,
            deckCount: 1000,
          },
          {
            name: "Commander 2",
            slug: "commander-2",
            rank: 2,
            deckCount: 900,
          },
        ],
      });
      vi.mocked(getAverageDeckCards)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(["Sol Ring"]);

      const scan = useTopCommanderScan();
      await scan.runScan([["Sol Ring"]], ["Name"]);

      expect(scan.failedCount.value).toBe(1);
      expect(scan.results.value).toHaveLength(1);
    });

    it("should filter out null results from failed fetches", async () => {
      vi.mocked(getTopCommanders).mockResolvedValue({
        header: "Top Commanders",
        commanders: [
          {
            name: "Commander 1",
            slug: "commander-1",
            rank: 1,
            deckCount: 1000,
          },
          {
            name: "Commander 2",
            slug: "commander-2",
            rank: 2,
            deckCount: 900,
          },
        ],
      });
      vi.mocked(getAverageDeckCards)
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce(["Sol Ring"]);

      const scan = useTopCommanderScan();
      await scan.runScan([["Sol Ring"]], ["Name"]);

      expect(scan.results.value).toHaveLength(1);
      expect(scan.results.value[0]?.name).toBe("Commander 2");
    });

    it("should clear error when starting new scan", async () => {
      vi.mocked(getTopCommanders).mockRejectedValueOnce(
        new Error("First error")
      );

      const scan = useTopCommanderScan();
      await scan.runScan([["Sol Ring"]], ["Name"]);
      expect(scan.error.value).toBeTruthy();

      vi.mocked(getTopCommanders).mockResolvedValueOnce({
        header: "Top Commanders",
        commanders: [
          {
            name: "Test Commander",
            slug: "test-commander",
            rank: 1,
            deckCount: 500,
          },
        ],
      });
      vi.mocked(getAverageDeckCards).mockResolvedValue(["Sol Ring"]);

      await scan.runScan([["Sol Ring"]], ["Name"], { force: true });
      expect(scan.error.value).toBeNull();
    });
  });

  describe("runScan - caching behavior", () => {
    it("should not re-run scan with same parameters", async () => {
      vi.mocked(getTopCommanders).mockResolvedValue({
        header: "Top Commanders",
        commanders: [
          {
            name: "Test Commander",
            slug: "test-commander",
            rank: 1,
            deckCount: 500,
          },
        ],
      });
      vi.mocked(getAverageDeckCards).mockResolvedValue(["Sol Ring"]);

      const scan = useTopCommanderScan();
      await scan.runScan([["Sol Ring"]], ["Name"]);
      
      vi.clearAllMocks();
      await scan.runScan([["Sol Ring"]], ["Name"]);

      expect(getTopCommanders).not.toHaveBeenCalled();
    });

    it("should re-run scan when force option is true", async () => {
      vi.mocked(getTopCommanders).mockResolvedValue({
        header: "Top Commanders",
        commanders: [
          {
            name: "Test Commander",
            slug: "test-commander",
            rank: 1,
            deckCount: 500,
          },
        ],
      });
      vi.mocked(getAverageDeckCards).mockResolvedValue(["Sol Ring"]);

      const scan = useTopCommanderScan();
      await scan.runScan([["Sol Ring"]], ["Name"]);
      
      vi.clearAllMocks();
      await scan.runScan([["Sol Ring"]], ["Name"], { force: true });

      expect(getTopCommanders).toHaveBeenCalled();
    });

    it("should re-run scan when CSV data changes", async () => {
      vi.mocked(getTopCommanders).mockResolvedValue({
        header: "Top Commanders",
        commanders: [
          {
            name: "Test Commander",
            slug: "test-commander",
            rank: 1,
            deckCount: 500,
          },
        ],
      });
      vi.mocked(getAverageDeckCards).mockResolvedValue(["Sol Ring"]);

      const scan = useTopCommanderScan();
      await scan.runScan([["Sol Ring"]], ["Name"]);
      
      vi.clearAllMocks();
      await scan.runScan([["Command Tower"]], ["Name"]);

      expect(getTopCommanders).toHaveBeenCalled();
    });

    it("should re-run scan when limit changes", async () => {
      vi.mocked(getTopCommanders).mockResolvedValue({
        header: "Top Commanders",
        commanders: [
          {
            name: "Test Commander",
            slug: "test-commander",
            rank: 1,
            deckCount: 500,
          },
        ],
      });
      vi.mocked(getAverageDeckCards).mockResolvedValue(["Sol Ring"]);

      const scan = useTopCommanderScan();
      await scan.runScan([["Sol Ring"]], ["Name"], { limit: 50 });
      
      vi.clearAllMocks();
      await scan.runScan([["Sol Ring"]], ["Name"], { limit: 100 });

      expect(getTopCommanders).toHaveBeenCalled();
    });

    it("should re-run scan when path changes", async () => {
      vi.mocked(getTopCommanders).mockResolvedValue({
        header: "Top Commanders",
        commanders: [
          {
            name: "Test Commander",
            slug: "test-commander",
            rank: 1,
            deckCount: 500,
          },
        ],
      });
      vi.mocked(getAverageDeckCards).mockResolvedValue(["Sol Ring"]);

      const scan = useTopCommanderScan();
      await scan.runScan([["Sol Ring"]], ["Name"], { path: "commanders/year" });
      
      vi.clearAllMocks();
      await scan.runScan([["Sol Ring"]], ["Name"], { path: "commanders/month" });

      expect(getTopCommanders).toHaveBeenCalled();
    });
  });

  describe("runScan - concurrency handling", () => {
    it("should cancel previous scan when new scan starts", async () => {
      vi.mocked(getTopCommanders).mockResolvedValue({
        header: "Top Commanders",
        commanders: [
          {
            name: "Commander 1",
            slug: "commander-1",
            rank: 1,
            deckCount: 1000,
          },
        ],
      });

      let resolveFirst: ((value: string[]) => void) | undefined;
      const firstPromise = new Promise<string[]>((resolve) => {
        resolveFirst = resolve;
      });

      vi.mocked(getAverageDeckCards).mockReturnValueOnce(firstPromise);

      const scan = useTopCommanderScan();
      const firstScan = scan.runScan([["Sol Ring"]], ["Name"], { force: true });
      
      // Start second scan before first completes
      vi.mocked(getAverageDeckCards).mockResolvedValue(["Command Tower"]);
      const secondScan = scan.runScan([["Command Tower"]], ["Name"], { force: true });

      // Resolve first scan
      resolveFirst!(["Sol Ring"]);
      await firstScan;
      await secondScan;

      // Second scan should win
      expect(scan.results.value).toHaveLength(1);
      expect(scan.results.value[0]?.totalCards).toBe(1);
    });
  });

  describe("runScan - result tracking", () => {
    it("should update lastUpdated timestamp", async () => {
      vi.mocked(getTopCommanders).mockResolvedValue({
        header: "Top Commanders",
        commanders: [
          {
            name: "Test Commander",
            slug: "test-commander",
            rank: 1,
            deckCount: 500,
          },
        ],
      });
      vi.mocked(getAverageDeckCards).mockResolvedValue(["Sol Ring"]);

      const scan = useTopCommanderScan();
      const beforeScan = new Date();
      await scan.runScan([["Sol Ring"]], ["Name"]);
      const afterScan = new Date();

      expect(scan.lastUpdated.value).not.toBeNull();
      expect(scan.lastUpdated.value!.getTime()).toBeGreaterThanOrEqual(
        beforeScan.getTime()
      );
      expect(scan.lastUpdated.value!.getTime()).toBeLessThanOrEqual(
        afterScan.getTime()
      );
    });

    it("should preserve all commander data in results", async () => {
      vi.mocked(getTopCommanders).mockResolvedValue({
        header: "Top Commanders",
        commanders: [
          {
            name: "Atraxa, Praetors' Voice",
            slug: "atraxa-praetors-voice",
            rank: 5,
            deckCount: 12345,
          },
        ],
      });
      vi.mocked(getAverageDeckCards).mockResolvedValue([
        "Sol Ring",
        "Command Tower",
      ]);

      const scan = useTopCommanderScan();
      await scan.runScan([["Sol Ring"]], ["Name"]);

      expect(scan.results.value[0]).toMatchObject({
        name: "Atraxa, Praetors' Voice",
        slug: "atraxa-praetors-voice",
        rank: 5,
        deckCount: 12345,
      });
    });
  });

  describe("clearResults", () => {
    it("should clear all results", async () => {
      vi.mocked(getTopCommanders).mockResolvedValue({
        header: "Top Commanders",
        commanders: [
          {
            name: "Test Commander",
            slug: "test-commander",
            rank: 1,
            deckCount: 500,
          },
        ],
      });
      vi.mocked(getAverageDeckCards).mockResolvedValue(["Sol Ring"]);

      const scan = useTopCommanderScan();
      await scan.runScan([["Sol Ring"]], ["Name"]);
      
      expect(scan.results.value).not.toEqual([]);
      scan.clearResults();
      expect(scan.results.value).toEqual([]);
    });

    it("should clear lastUpdated", async () => {
      vi.mocked(getTopCommanders).mockResolvedValue({
        header: "Top Commanders",
        commanders: [
          {
            name: "Test Commander",
            slug: "test-commander",
            rank: 1,
            deckCount: 500,
          },
        ],
      });
      vi.mocked(getAverageDeckCards).mockResolvedValue(["Sol Ring"]);

      const scan = useTopCommanderScan();
      await scan.runScan([["Sol Ring"]], ["Name"]);
      
      expect(scan.lastUpdated.value).not.toBeNull();
      scan.clearResults();
      expect(scan.lastUpdated.value).toBeNull();
    });

    it("should clear error", async () => {
      vi.mocked(getTopCommanders).mockRejectedValue(new Error("Test error"));

      const scan = useTopCommanderScan();
      await scan.runScan([["Sol Ring"]], ["Name"]);
      
      expect(scan.error.value).not.toBeNull();
      scan.clearResults();
      expect(scan.error.value).toBeNull();
    });

    it("should reset failedCount", async () => {
      vi.mocked(getTopCommanders).mockResolvedValue({
        header: "Top Commanders",
        commanders: [
          {
            name: "Test Commander",
            slug: "test-commander",
            rank: 1,
            deckCount: 500,
          },
        ],
      });
      vi.mocked(getAverageDeckCards).mockResolvedValue(null);

      const scan = useTopCommanderScan();
      await scan.runScan([["Sol Ring"]], ["Name"]);
      
      expect(scan.failedCount.value).toBeGreaterThan(0);
      scan.clearResults();
      expect(scan.failedCount.value).toBe(0);
    });

    it("should cancel any in-progress scan", async () => {
      vi.mocked(getTopCommanders).mockResolvedValue({
        header: "Top Commanders",
        commanders: [
          {
            name: "Commander 1",
            slug: "commander-1",
            rank: 1,
            deckCount: 1000,
          },
        ],
      });

      let resolveCards: ((value: string[]) => void) | undefined;
      const cardsPromise = new Promise<string[]>((resolve) => {
        resolveCards = resolve;
      });

      vi.mocked(getAverageDeckCards).mockReturnValue(cardsPromise);

      const scan = useTopCommanderScan();
      const scanPromise = scan.runScan([["Sol Ring"]], ["Name"], { force: true });
      
      scan.clearResults();
      resolveCards!(["Sol Ring"]);
      await scanPromise;

      // Scan should not update results after being cleared
      expect(scan.results.value).toEqual([]);
    });
  });

  describe("edge cases", () => {
    it("should handle empty average deck", async () => {
      vi.mocked(getTopCommanders).mockResolvedValue({
        header: "Top Commanders",
        commanders: [
          {
            name: "Test Commander",
            slug: "test-commander",
            rank: 1,
            deckCount: 500,
          },
        ],
      });
      vi.mocked(getAverageDeckCards).mockResolvedValue([]);

      const scan = useTopCommanderScan();
      await scan.runScan([["Sol Ring"]], ["Name"]);

      expect(scan.results.value).toEqual([]);
      expect(scan.failedCount.value).toBe(1);
    });

    it("should handle average deck with only empty strings", async () => {
      vi.mocked(getTopCommanders).mockResolvedValue({
        header: "Top Commanders",
        commanders: [
          {
            name: "Test Commander",
            slug: "test-commander",
            rank: 1,
            deckCount: 500,
          },
        ],
      });
      vi.mocked(getAverageDeckCards).mockResolvedValue(["", "", ""]);

      const scan = useTopCommanderScan();
      await scan.runScan([["Sol Ring"]], ["Name"]);

      const result = scan.results.value[0];
      expect(result?.totalCards).toBe(0);
      expect(result?.ownedCards).toBe(0);
      expect(result?.ownedPercent).toBe(0);
    });

    it("should detect custom name column", async () => {
      vi.mocked(getTopCommanders).mockResolvedValue({
        header: "Top Commanders",
        commanders: [
          {
            name: "Test Commander",
            slug: "test-commander",
            rank: 1,
            deckCount: 500,
          },
        ],
      });
      vi.mocked(getAverageDeckCards).mockResolvedValue(["Sol Ring"]);

      const scan = useTopCommanderScan();
      await scan.runScan(
        [["Sol Ring", "1"], ["Command Tower", "2"]],
        ["Card Name", "Quantity"]
      );

      expect(scan.results.value[0]?.ownedCards).toBe(1);
    });

    it("should handle CSV with no Name column (use first column)", async () => {
      vi.mocked(getTopCommanders).mockResolvedValue({
        header: "Top Commanders",
        commanders: [
          {
            name: "Test Commander",
            slug: "test-commander",
            rank: 1,
            deckCount: 500,
          },
        ],
      });
      vi.mocked(getAverageDeckCards).mockResolvedValue(["Sol Ring"]);

      const scan = useTopCommanderScan();
      await scan.runScan(
        [["Sol Ring", "1"], ["Command Tower", "2"]],
        ["CardList", "Count"]
      );

      expect(scan.results.value[0]?.ownedCards).toBe(1);
    });
  });
});
