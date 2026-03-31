import { beforeEach, describe, expect, it, vi } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import { ref } from "vue";
import TopCommandersPage from "../../../src/components/TopCommandersPage.vue";

const rows = ref<string[][]>([]);
const headers = ref<string[]>([]);
const results = ref<Array<{ slug: string; ownedPercent?: number }>>([]);
const lastUpdated = ref<Date | null>(null);
const scanError = ref<string | null>(null);
const failedCount = ref(0);
const topCommanders = ref<Array<{ slug: string; name: string; deckCount: number; rank: number }>>([]);
const topHeader = ref("EDHREC leaders");
const topLoading = ref(false);
const topError = ref<string | null>(null);
const topLimit = ref(25);
const sortMode = ref<"rank" | "owned">("rank");

const runScan = vi.fn().mockResolvedValue(undefined);
const clearResults = vi.fn();
const fetchTopCommanders = vi.fn().mockResolvedValue([]);
const setSortMode = vi.fn();
const setTopLimit = vi.fn().mockReturnValue(true);
const ensureSymbolsLoaded = vi.fn().mockResolvedValue(undefined);
const loadCommanderImages = vi.fn().mockResolvedValue(undefined);
const getImageStack = vi.fn().mockReturnValue([]);
const toggleColor = vi.fn();
const clearColors = vi.fn();

vi.mock("../../../src/composables/useCsvUpload", () => ({
  useCsvUpload: () => ({
    rows,
    headers,
  }),
}));

vi.mock("../../../src/composables/useTopCommanderScan", () => ({
  useTopCommanderScan: () => ({
    results,
    lastUpdated,
    error: scanError,
    failedCount,
    scope: "top-commanders-scan",
    runScan,
    clearResults,
  }),
}));

vi.mock("../../../src/composables/useScryfallSymbols", () => ({
  useScryfallSymbols: () => ({
    ensureSymbolsLoaded,
    getSvgForSymbol: vi.fn(),
  }),
}));

vi.mock("../../../src/composables/useTopCommandersData", () => ({
  useTopCommandersData: () => ({
    topCommanders,
    topHeader,
    topLoading,
    topError,
    topLimit,
    sortMode,
    sortOptions: [
      { value: "rank", label: "Rank" },
      { value: "owned", label: "Owned" },
    ],
    limitOptions: [25, 50, 100],
    fetchTopCommanders,
    setSortMode,
    setTopLimit,
  }),
}));

vi.mock("../../../src/composables/useTopCommanderImages", () => ({
  useTopCommanderImages: () => ({
    imageLoading: ref(false),
    getImageStack,
    loadCommanderImages,
    combinedColorIdentity: vi.fn(),
  }),
}));

vi.mock("../../../src/composables/useTopCommanderFilters", () => ({
  useTopCommanderFilters: () => ({
    selectedColors: ref([]),
    colorOptions: ["W", "U", "B", "R", "G"],
    toggleColor,
    clearColors,
    selectedColorPath: ref(""),
    colorDotClass: vi.fn().mockReturnValue("bg-white"),
    colorPillClass: vi.fn().mockReturnValue("border-[color:var(--accent)]"),
    colorLabel: vi.fn().mockReturnValue("White"),
    matchesColorFilter: () => true,
  }),
}));

const mountComponent = () =>
  mount(TopCommandersPage, {
    global: {
      stubs: {
        CsvUploadModal: {
          template: "<div v-if='open' class='csv-modal-stub'></div>",
          props: ["open"],
        },
        TopCommandersHero: { template: "<header class='hero-stub'></header>" },
        TopCommandersStatusCard: { template: "<section class='status-stub'></section>" },
        TopCommandersControls: { template: "<section class='controls-stub'></section>" },
        TopCommandersColorFilter: { template: "<section class='filter-stub'></section>" },
        TopCommandersOwnedLegend: { template: "<section class='legend-stub'></section>" },
        TopCommanderCard: { template: "<article class='commander-card-stub'></article>" },
        SiteNotice: { template: "<footer class='site-notice-stub'></footer>" },
      },
    },
  });

describe("TopCommandersPage", () => {
  beforeEach(() => {
    rows.value = [];
    headers.value = [];
    results.value = [];
    lastUpdated.value = null;
    scanError.value = null;
    failedCount.value = 0;
    topCommanders.value = [];
    topHeader.value = "EDHREC leaders";
    topLoading.value = false;
    topError.value = null;
    topLimit.value = 25;
    sortMode.value = "rank";
    runScan.mockClear();
    clearResults.mockClear();
    fetchTopCommanders.mockClear();
    setSortMode.mockClear();
    setTopLimit.mockClear();
    ensureSymbolsLoaded.mockClear();
    loadCommanderImages.mockClear();
    getImageStack.mockClear();
    toggleColor.mockClear();
    clearColors.mockClear();
  });

  it("renders loading notice while top commanders are loading", async () => {
    topLoading.value = true;
    const wrapper = mountComponent();
    await flushPromises();

    expect(wrapper.find(".surface-role-command").exists()).toBe(true);
    expect(wrapper.find(".surface-role-utility").exists()).toBe(true);
    expect(wrapper.find(".surface-role-content").exists()).toBe(true);
    expect(wrapper.text()).toContain("Loading top commanders...");
  });

  it("renders commander cards when top commander data is available", async () => {
    topCommanders.value = [
      { slug: "atraxa-grand-unifier", name: "Atraxa, Grand Unifier", deckCount: 1000, rank: 1 },
      { slug: "edgar-markov", name: "Edgar Markov", deckCount: 900, rank: 2 },
    ];

    const wrapper = mountComponent();
    await flushPromises();

    expect(wrapper.findAll(".commander-card-stub")).toHaveLength(2);
  });

  it("renders top commander fetch errors as alerts", async () => {
    topError.value = "Unable to load top commanders.";

    const wrapper = mountComponent();
    await flushPromises();

    const alert = wrapper.get("[role='alert']");
    expect(alert.text()).toContain("Unable to load top commanders.");
    expect(alert.attributes("aria-live")).toBe("assertive");
  });
});
