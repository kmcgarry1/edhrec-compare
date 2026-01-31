import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { ref, nextTick } from "vue";

const mockGetCard = vi.fn();
const mockSearchCardNames = vi.fn();
const mockWithLoading = vi.fn();
const mockNotifyError = vi.fn();

vi.mock("../../../src/api/scryfallApi", () => ({
  getCard: mockGetCard,
  searchCardNames: mockSearchCardNames,
}));

vi.mock("../../../src/composables/useGlobalLoading", () => ({
  useGlobalLoading: () => ({
    withLoading: mockWithLoading,
  }),
}));

vi.mock("../../../src/composables/useGlobalNotices", () => ({
  useGlobalNotices: () => ({
    notifyError: mockNotifyError,
  }),
}));

type CommanderSearchModule = typeof import("../../../src/composables/useCommanderSearch");
let useCommanderSearch: CommanderSearchModule["useCommanderSearch"];

beforeEach(async () => {
  vi.clearAllMocks();
  vi.resetModules();

  // Default mock implementations
  mockWithLoading.mockImplementation(async (fn) => await fn());
  mockGetCard.mockResolvedValue({ mana_cost: "{2}{U}{B}" });
  mockSearchCardNames.mockResolvedValue(["Test Commander", "Another Commander"]);

  const module = await import("../../../src/composables/useCommanderSearch");
  useCommanderSearch = module.useCommanderSearch;
});

afterEach(() => {
  vi.clearAllTimers();
});

describe("useCommanderSearch", () => {
  describe("initialization", () => {
    it("should initialize with empty state", () => {
      const selectedSlug = ref<string | null>(null);
      const onCommanderSelected = vi.fn();
      const onSelectionChange = vi.fn();

      const composable = useCommanderSearch({
        selectedSlug,
        onCommanderSelected,
        onSelectionChange,
      });

      expect(composable.primarySelection.value).toBe("");
      expect(composable.partnerSelection.value).toBe("");
      expect(composable.hasPartner.value).toBe(false);
      expect(composable.summaryName.value).toBe("");
      expect(composable.summaryManaCost.value).toBe("");
    });
  });

  describe("partner disabled state", () => {
    it("should disable partner when no primary selection", () => {
      const selectedSlug = ref<string | null>(null);
      const onCommanderSelected = vi.fn();
      const onSelectionChange = vi.fn();

      const composable = useCommanderSearch({
        selectedSlug,
        onCommanderSelected,
        onSelectionChange,
      });

      expect(composable.partnerDisabled.value).toBe(true);
    });

    it("should enable partner when primary selection exists", async () => {
      const selectedSlug = ref<string | null>(null);
      const onCommanderSelected = vi.fn();
      const onSelectionChange = vi.fn();

      const composable = useCommanderSearch({
        selectedSlug,
        onCommanderSelected,
        onSelectionChange,
      });

      composable.primarySelection.value = "Atraxa";
      await nextTick();

      expect(composable.partnerDisabled.value).toBe(false);
    });
  });

  describe("summary name", () => {
    it("should return empty string when no primary selection", () => {
      const selectedSlug = ref<string | null>(null);
      const onCommanderSelected = vi.fn();
      const onSelectionChange = vi.fn();

      const composable = useCommanderSearch({
        selectedSlug,
        onCommanderSelected,
        onSelectionChange,
      });

      expect(composable.summaryName.value).toBe("");
    });

    it("should return primary name when no partner", () => {
      const selectedSlug = ref<string | null>(null);
      const onCommanderSelected = vi.fn();
      const onSelectionChange = vi.fn();

      const composable = useCommanderSearch({
        selectedSlug,
        onCommanderSelected,
        onSelectionChange,
      });

      composable.primarySelection.value = "Atraxa";

      expect(composable.summaryName.value).toBe("Atraxa");
    });

    it("should return combined name for partners", () => {
      const selectedSlug = ref<string | null>(null);
      const onCommanderSelected = vi.fn();
      const onSelectionChange = vi.fn();

      const composable = useCommanderSearch({
        selectedSlug,
        onCommanderSelected,
        onSelectionChange,
      });

      composable.primarySelection.value = "Thrasios";
      composable.hasPartner.value = true;
      composable.partnerSelection.value = "Tymna";

      expect(composable.summaryName.value).toBe("Thrasios + Tymna");
    });
  });

  describe("mana cost loading", () => {
    it("should load mana cost for primary commander", async () => {
      const selectedSlug = ref<string | null>(null);
      const onCommanderSelected = vi.fn();
      const onSelectionChange = vi.fn();

      mockGetCard.mockResolvedValue({ mana_cost: "{2}{U}{B}" });

      const composable = useCommanderSearch({
        selectedSlug,
        onCommanderSelected,
        onSelectionChange,
      });

      composable.primarySelection.value = "Atraxa";
      await nextTick();
      await vi.waitFor(() => mockGetCard.mock.calls.length > 0);

      expect(mockGetCard).toHaveBeenCalledWith("Atraxa");
    });

    it("should load mana cost for partner commander", async () => {
      const selectedSlug = ref<string | null>(null);
      const onCommanderSelected = vi.fn();
      const onSelectionChange = vi.fn();

      mockGetCard.mockResolvedValue({ mana_cost: "{G}{W}" });

      const composable = useCommanderSearch({
        selectedSlug,
        onCommanderSelected,
        onSelectionChange,
      });

      composable.primarySelection.value = "Thrasios";
      composable.hasPartner.value = true;
      composable.partnerSelection.value = "Tymna";
      await nextTick();
      await vi.waitFor(() => mockGetCard.mock.calls.length >= 2);

      expect(mockGetCard).toHaveBeenCalledWith("Tymna");
    });

    it("should handle mana cost fetch failure gracefully", async () => {
      const selectedSlug = ref<string | null>(null);
      const onCommanderSelected = vi.fn();
      const onSelectionChange = vi.fn();

      mockGetCard.mockRejectedValue(new Error("API Error"));

      const composable = useCommanderSearch({
        selectedSlug,
        onCommanderSelected,
        onSelectionChange,
      });

      composable.primarySelection.value = "Unknown Card";
      await nextTick();
      await vi.waitFor(() => mockGetCard.mock.calls.length > 0);

      // Should not throw and should have empty mana cost
      expect(composable.summaryManaCost.value).toBe("...");
    });
  });

  describe("search functionality", () => {
    it("should debounce search queries", async () => {
      vi.useFakeTimers();
      const selectedSlug = ref<string | null>(null);
      const onCommanderSelected = vi.fn();
      const onSelectionChange = vi.fn();

      const composable = useCommanderSearch({
        selectedSlug,
        onCommanderSelected,
        onSelectionChange,
      });

      composable.primaryQuery.value = "A";
      composable.primaryQuery.value = "At";
      composable.primaryQuery.value = "Atr";

      expect(mockSearchCardNames).not.toHaveBeenCalled();

      vi.advanceTimersByTime(300);
      await nextTick();

      expect(mockSearchCardNames).toHaveBeenCalledTimes(1);
      expect(mockSearchCardNames).toHaveBeenCalledWith("Atr");

      vi.useRealTimers();
    });

    it("should not search when query is less than 2 characters", async () => {
      vi.useFakeTimers();
      const selectedSlug = ref<string | null>(null);
      const onCommanderSelected = vi.fn();
      const onSelectionChange = vi.fn();

      const composable = useCommanderSearch({
        selectedSlug,
        onCommanderSelected,
        onSelectionChange,
      });

      composable.primaryQuery.value = "A";
      vi.advanceTimersByTime(300);
      await nextTick();

      expect(mockSearchCardNames).not.toHaveBeenCalled();
      expect(composable.primaryResults.value).toEqual([]);

      vi.useRealTimers();
    });

    it("should limit results to 20 items", async () => {
      vi.useFakeTimers();
      const selectedSlug = ref<string | null>(null);
      const onCommanderSelected = vi.fn();
      const onSelectionChange = vi.fn();

      const manyResults = Array.from({ length: 50 }, (_, i) => `Commander ${i}`);
      mockSearchCardNames.mockResolvedValue(manyResults);

      const composable = useCommanderSearch({
        selectedSlug,
        onCommanderSelected,
        onSelectionChange,
      });

      composable.primaryQuery.value = "Commander";
      vi.advanceTimersByTime(300);
      await nextTick();
      await vi.waitFor(() => composable.primaryResults.value.length > 0);

      expect(composable.primaryResults.value).toHaveLength(20);

      vi.useRealTimers();
    });

    it("should handle search errors", async () => {
      vi.useFakeTimers();
      const selectedSlug = ref<string | null>(null);
      const onCommanderSelected = vi.fn();
      const onSelectionChange = vi.fn();

      mockSearchCardNames.mockRejectedValue(new Error("Search failed"));

      const composable = useCommanderSearch({
        selectedSlug,
        onCommanderSelected,
        onSelectionChange,
      });

      composable.primaryQuery.value = "Test";
      vi.advanceTimersByTime(300);
      await nextTick();
      await vi.waitFor(() => mockNotifyError.mock.calls.length > 0);

      expect(mockNotifyError).toHaveBeenCalled();
      expect(composable.primaryError.value).toBe("Search failed");
      expect(composable.primaryResults.value).toEqual([]);

      vi.useRealTimers();
    });

    it("should not search partner when primary is not selected", async () => {
      vi.useFakeTimers();
      const selectedSlug = ref<string | null>(null);
      const onCommanderSelected = vi.fn();
      const onSelectionChange = vi.fn();

      const composable = useCommanderSearch({
        selectedSlug,
        onCommanderSelected,
        onSelectionChange,
      });

      composable.partnerQuery.value = "Test";
      vi.advanceTimersByTime(300);
      await nextTick();

      expect(mockSearchCardNames).not.toHaveBeenCalled();
      expect(composable.partnerResults.value).toEqual([]);

      vi.useRealTimers();
    });
  });

  describe("commander selection", () => {
    it("should handle primary commander selection", () => {
      const selectedSlug = ref<string | null>(null);
      const onCommanderSelected = vi.fn();
      const onSelectionChange = vi.fn();

      const composable = useCommanderSearch({
        selectedSlug,
        onCommanderSelected,
        onSelectionChange,
      });

      composable.handleSelection("primary", "Atraxa");

      expect(composable.primarySelection.value).toBe("Atraxa");
      expect(composable.primaryQuery.value).toBe("Atraxa");
      expect(composable.primaryResults.value).toEqual([]);
      expect(onCommanderSelected).toHaveBeenCalledWith("atraxa");
    });

    it("should clear partner when selecting new primary", () => {
      const selectedSlug = ref<string | null>(null);
      const onCommanderSelected = vi.fn();
      const onSelectionChange = vi.fn();

      const composable = useCommanderSearch({
        selectedSlug,
        onCommanderSelected,
        onSelectionChange,
      });

      composable.primarySelection.value = "Thrasios";
      composable.hasPartner.value = true;
      composable.partnerSelection.value = "Tymna";

      composable.handleSelection("primary", "Atraxa");

      expect(composable.partnerSelection.value).toBe("");
      expect(composable.partnerQuery.value).toBe("");
      expect(composable.partnerResults.value).toEqual([]);
    });

    it("should handle partner commander selection", () => {
      const selectedSlug = ref<string | null>(null);
      const onCommanderSelected = vi.fn();
      const onSelectionChange = vi.fn();

      const composable = useCommanderSearch({
        selectedSlug,
        onCommanderSelected,
        onSelectionChange,
      });

      composable.primarySelection.value = "Thrasios";
      composable.hasPartner.value = true;

      composable.handleSelection("partner", "Tymna");

      expect(composable.partnerSelection.value).toBe("Tymna");
      expect(composable.partnerQuery.value).toBe("Tymna");
      expect(composable.partnerResults.value).toEqual([]);
    });
  });

  describe("clearing selection", () => {
    it("should clear primary selection and partner", () => {
      const selectedSlug = ref<string | null>(null);
      const onCommanderSelected = vi.fn();
      const onSelectionChange = vi.fn();

      const composable = useCommanderSearch({
        selectedSlug,
        onCommanderSelected,
        onSelectionChange,
      });

      composable.primarySelection.value = "Thrasios";
      composable.hasPartner.value = true;
      composable.partnerSelection.value = "Tymna";

      composable.clearSelection("primary");

      expect(composable.primarySelection.value).toBe("");
      expect(composable.primaryQuery.value).toBe("");
      expect(composable.partnerSelection.value).toBe("");
      expect(composable.partnerQuery.value).toBe("");
      expect(composable.hasPartner.value).toBe(false);
      expect(onCommanderSelected).toHaveBeenCalledWith("");
    });

    it("should clear only partner selection", () => {
      const selectedSlug = ref<string | null>(null);
      const onCommanderSelected = vi.fn();
      const onSelectionChange = vi.fn();

      const composable = useCommanderSearch({
        selectedSlug,
        onCommanderSelected,
        onSelectionChange,
      });

      composable.primarySelection.value = "Thrasios";
      composable.hasPartner.value = true;
      composable.partnerSelection.value = "Tymna";

      composable.clearSelection("partner");

      expect(composable.primarySelection.value).toBe("Thrasios");
      expect(composable.partnerSelection.value).toBe("");
      expect(composable.partnerQuery.value).toBe("");
    });
  });

  describe("hydration from slug", () => {
    it("should hydrate from initial slug", async () => {
      const selectedSlug = ref<string | null>("atraxa-praetors-voice");
      const onCommanderSelected = vi.fn();
      const onSelectionChange = vi.fn();

      const composable = useCommanderSearch({
        selectedSlug,
        onCommanderSelected,
        onSelectionChange,
      });

      await nextTick();

      expect(composable.primarySelection.value).toBe("Atraxa Praetors Voice");
      expect(composable.primaryQuery.value).toBe("Atraxa Praetors Voice");
    });

    it("should clear when slug is null", async () => {
      const selectedSlug = ref<string | null>("atraxa-praetors-voice");
      const onCommanderSelected = vi.fn();
      const onSelectionChange = vi.fn();

      const composable = useCommanderSearch({
        selectedSlug,
        onCommanderSelected,
        onSelectionChange,
      });

      await nextTick();
      expect(composable.primarySelection.value).toBe("Atraxa Praetors Voice");

      selectedSlug.value = null;
      await nextTick();

      expect(composable.primarySelection.value).toBe("");
      expect(composable.primaryQuery.value).toBe("");
      expect(composable.hasPartner.value).toBe(false);
    });

    it("should not hydrate if current slug matches", async () => {
      const selectedSlug = ref<string | null>("atraxa-praetors-voice");
      const onCommanderSelected = vi.fn();
      const onSelectionChange = vi.fn();

      const composable = useCommanderSearch({
        selectedSlug,
        onCommanderSelected,
        onSelectionChange,
      });

      await nextTick();

      const currentQuery = composable.primaryQuery.value;
      
      // Set to same slug again
      selectedSlug.value = "atraxa-praetors-voice";
      await nextTick();

      // Should not have changed
      expect(composable.primaryQuery.value).toBe(currentQuery);
    });
  });

  describe("add/remove partner", () => {
    it("should enable partner mode", () => {
      const selectedSlug = ref<string | null>(null);
      const onCommanderSelected = vi.fn();
      const onSelectionChange = vi.fn();

      const composable = useCommanderSearch({
        selectedSlug,
        onCommanderSelected,
        onSelectionChange,
      });

      composable.addPartner();

      expect(composable.hasPartner.value).toBe(true);
    });

    it("should clear partner when disabling partner mode", () => {
      const selectedSlug = ref<string | null>(null);
      const onCommanderSelected = vi.fn();
      const onSelectionChange = vi.fn();

      const composable = useCommanderSearch({
        selectedSlug,
        onCommanderSelected,
        onSelectionChange,
      });

      composable.primarySelection.value = "Thrasios";
      composable.hasPartner.value = true;
      composable.partnerSelection.value = "Tymna";

      composable.removePartner();

      expect(composable.hasPartner.value).toBe(false);
      expect(composable.partnerSelection.value).toBe("");
      expect(composable.partnerQuery.value).toBe("");
    });

    it("should clear partner fields when hasPartner becomes false", async () => {
      const selectedSlug = ref<string | null>(null);
      const onCommanderSelected = vi.fn();
      const onSelectionChange = vi.fn();

      const composable = useCommanderSearch({
        selectedSlug,
        onCommanderSelected,
        onSelectionChange,
      });

      composable.primarySelection.value = "Thrasios";
      composable.hasPartner.value = true;
      composable.partnerSelection.value = "Tymna";

      composable.hasPartner.value = false;
      await nextTick();

      expect(composable.partnerSelection.value).toBe("");
      expect(composable.partnerQuery.value).toBe("");
    });
  });

  describe("selection change events", () => {
    it("should emit selection change when primary changes", async () => {
      const selectedSlug = ref<string | null>(null);
      const onCommanderSelected = vi.fn();
      const onSelectionChange = vi.fn();

      const composable = useCommanderSearch({
        selectedSlug,
        onCommanderSelected,
        onSelectionChange,
      });

      composable.primarySelection.value = "Atraxa";
      await nextTick();

      expect(onSelectionChange).toHaveBeenCalledWith({
        primary: "Atraxa",
        partner: "",
        hasPartner: false,
      });
    });

    it("should emit selection change when partner changes", async () => {
      const selectedSlug = ref<string | null>(null);
      const onCommanderSelected = vi.fn();
      const onSelectionChange = vi.fn();

      const composable = useCommanderSearch({
        selectedSlug,
        onCommanderSelected,
        onSelectionChange,
      });

      composable.primarySelection.value = "Thrasios";
      composable.hasPartner.value = true;
      await nextTick();

      composable.partnerSelection.value = "Tymna";
      await nextTick();

      expect(onSelectionChange).toHaveBeenCalledWith({
        primary: "Thrasios",
        partner: "Tymna",
        hasPartner: true,
      });
    });
  });
});
