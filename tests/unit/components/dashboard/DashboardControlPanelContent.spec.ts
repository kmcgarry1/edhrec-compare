import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import DashboardControlPanelContent from "../../../../src/components/dashboard/DashboardControlPanelContent.vue";

const baseProps = {
  selectedSlug: "atraxa-grand-unifier",
  selection: {
    primary: "Atraxa, Grand Unifier",
    partner: "",
    hasPartner: false,
  },
  bracket: "",
  modifier: "",
  pageType: "average-decks",
  companion: "",
  hasCsvData: true,
  csvCount: 18432,
  inventorySummary: "18,432 cards loaded. Deck view now reflects your collection.",
  collectionSourceName: "collection.csv",
  collectionImportedAt: new Date("2026-03-25T12:00:00Z"),
  collectionModeLabel: "Commander compare",
  collectionModeHint: "This upload is active for owned and missing deck views in the compare workflow.",
  filterOptions: [
    { label: "Owned", value: true, active: true, count: 128 },
    { label: "Missing", value: false, active: false, count: 243 },
    { label: "All cards", value: null, active: false, count: 371 },
  ],
} as const;

const mountComponent = (overrideProps = {}) =>
  mount(DashboardControlPanelContent, {
    props: {
      ...baseProps,
      ...overrideProps,
    },
    global: {
      stubs: {
        CommanderSearch: {
          template: "<div class='commander-search-stub'>CommanderSearch</div>",
        },
        CommanderFilters: {
          template: "<div class='commander-filters-stub'>CommanderFilters</div>",
        },
      },
    },
  });

describe("DashboardControlPanelContent", () => {
  it("starts with a compact commander summary when a commander is already selected", async () => {
    const wrapper = mountComponent();

    expect(wrapper.text()).toContain("Current deck");
    expect(wrapper.text()).toContain("Atraxa, Grand Unifier");
    expect(wrapper.find(".commander-search-stub").exists()).toBe(false);

    await wrapper.get("button").trigger("click");

    expect(wrapper.find(".commander-search-stub").exists()).toBe(true);
  });

  it("shows collection metadata and emits clear-upload", async () => {
    const wrapper = mountComponent();

    expect(wrapper.text()).toContain("collection.csv");
    expect(wrapper.text()).toContain("18,432 cards");
    expect(wrapper.text()).toContain("Commander compare");

    const clearButton = wrapper.findAll("button").find((button) => button.text() === "Clear");
    expect(clearButton?.exists()).toBe(true);

    await clearButton?.trigger("click");

    expect(wrapper.emitted("clear-upload")).toBeTruthy();
  });

  it("renders count-backed deck view options and emits filter changes", async () => {
    const wrapper = mountComponent();

    expect(wrapper.text()).toContain("Owned");
    expect(wrapper.text()).toContain("128");
    expect(wrapper.text()).toContain("243");
    expect(wrapper.text()).toContain("371");

    const missingButton = wrapper
      .findAll("button")
      .find((button) => button.text().includes("Missing"));

    await missingButton?.trigger("click");

    expect(wrapper.emitted("filter-change")?.[0]).toEqual([false]);
  });

  it("keeps advanced filters collapsed until explicitly opened", async () => {
    const wrapper = mountComponent();

    expect(wrapper.find(".commander-filters-stub").exists()).toBe(false);
    expect(wrapper.text()).toContain("Average Decks • All brackets • Any budget • No companion");

    const toggleButton = wrapper
      .findAll("button")
      .find((button) => button.text().includes("Edit filters"));

    await toggleButton?.trigger("click");

    expect(wrapper.find(".commander-filters-stub").exists()).toBe(true);
  });
});
