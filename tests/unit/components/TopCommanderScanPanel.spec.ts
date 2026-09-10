import { beforeEach, describe, expect, it, vi } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";
import { ref } from "vue";
import TopCommanderScanPanel from "../../../src/components/TopCommanderScanPanel.vue";

const rows = ref<string[][]>([]);
const headers = ref<string[]>([]);
const mode = ref("compare");
const results = ref<
  Array<{
    slug: string;
    name: string;
    rank: number;
    deckCount: number;
    ownedCards: number;
    totalCards: number;
    ownedPercent: number;
  }>
>([]);
const lastUpdated = ref<Date | null>(null);
const error = ref<string | null>(null);
const failedCount = ref(0);
const isLoading = ref(false);
const runScan = vi.fn().mockResolvedValue(undefined);
const clearResults = vi.fn();

vi.mock("../../../src/composables/useCsvUpload", () => ({
  useCsvUpload: () => ({ rows, headers }),
}));

vi.mock("../../../src/composables/useCsvUploadMode", () => ({
  useCsvUploadMode: () => ({ mode }),
}));

vi.mock("../../../src/composables/useTopCommanderScan", () => ({
  useTopCommanderScan: () => ({
    results,
    lastUpdated,
    error,
    failedCount,
    sourceLabel: "top commanders",
    isLoading,
    scope: "top-commanders-scan",
    runScan,
    clearResults,
  }),
}));

const mountComponent = () =>
  mount(TopCommanderScanPanel, {
    global: {
      stubs: {
        GlobalLoadingBanner: { template: "<div class='loading-stub'><slot /></div>" },
      },
    },
  });

describe("TopCommanderScanPanel", () => {
  beforeEach(() => {
    rows.value = [];
    headers.value = [];
    mode.value = "compare";
    results.value = [];
    lastUpdated.value = null;
    error.value = null;
    failedCount.value = 0;
    isLoading.value = false;
    runScan.mockClear();
    clearResults.mockClear();
  });

  it("asks for a CSV and clears stale results when no rows are available", async () => {
    const wrapper = mountComponent();
    await flushPromises();

    expect(wrapper.text()).toContain("Upload a CSV to run this scan.");
    expect(clearResults).toHaveBeenCalledTimes(1);
    expect(runScan).not.toHaveBeenCalled();
  });

  it("requires top-50 upload mode before scanning", async () => {
    rows.value = [["Sol Ring"]];
    headers.value = ["Name"];

    const wrapper = mountComponent();
    await flushPromises();

    expect(wrapper.text()).toContain('Choose "Top 50 scan" in the upload modal');
    expect(runScan).not.toHaveBeenCalled();
  });

  it("runs automatically in top-50 mode and lets the user refresh", async () => {
    rows.value = [["Sol Ring"]];
    headers.value = ["Name"];
    mode.value = "top-50";
    results.value = [
      {
        slug: "atraxa-grand-unifier",
        name: "Atraxa, Grand Unifier",
        rank: 1,
        deckCount: 12345,
        ownedCards: 72,
        totalCards: 90,
        ownedPercent: 80,
      },
    ];
    lastUpdated.value = new Date("2026-09-10T13:05:00Z");
    failedCount.value = 2;

    const wrapper = mountComponent();
    await flushPromises();

    expect(runScan).toHaveBeenCalledWith(rows.value, headers.value);
    expect(wrapper.text()).toContain("Refresh scan");
    expect(wrapper.text()).toContain("72 / 90 cards owned");
    expect(wrapper.text()).toContain("12,345 decks");
    expect(wrapper.text()).toContain("80%");
    expect(wrapper.text()).toContain("2 commanders failed to load.");

    await wrapper.get("button").trigger("click");

    expect(runScan).toHaveBeenLastCalledWith(rows.value, headers.value, { force: true });
  });

  it("shows errors and empty failed scans", async () => {
    rows.value = [["Sol Ring"]];
    headers.value = ["Name"];
    mode.value = "top-50";
    error.value = "Scan failed.";
    failedCount.value = 3;

    const wrapper = mountComponent();
    await flushPromises();

    expect(wrapper.text()).toContain("Scan failed.");
    expect(wrapper.text()).toContain("No commander lists could be loaded. Try the scan again.");
  });
});
