import { describe, it, expect } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import DashboardToolbar from "../../../../src/components/dashboard/DashboardToolbar.vue";

const baseProps = {
  nextStepLabel: "Decklist ready to export.",
  nextStepActionLabel: "Copy decklist",
  hasCommander: true,
  hasCsvData: true,
  csvCount: 243,
  inventorySummary: "243 cards loaded. Filters now match your collection.",
  filterOptions: [
    { label: "Owned", value: true, active: true },
    { label: "Unowned", value: false, active: false },
    { label: "All", value: null, active: false },
  ],
  decklistText: "1 Sol Ring",
  decklistSectionCount: 8,
  copied: false,
  density: "cozy",
  densityOptions: [
    { value: "comfortable", label: "Comfortable" },
    { value: "cozy", label: "Cozy" },
    { value: "compact", label: "Compact" },
  ] as const,
  theme: "light",
  backgroundEnabled: true,
  browseRailOpen: true,
  utilityDrawerOpen: false,
} as const;

const mountComponent = (overrideProps = {}) =>
  mount(DashboardToolbar, {
    props: {
      ...baseProps,
      ...overrideProps,
    },
    global: {
      stubs: {
        DashboardDisplaySettings: {
          template: "<div class='display-settings-stub'></div>",
        },
      },
    },
  });

describe("DashboardToolbar", () => {
  it("emits collection, filter, and utility actions", async () => {
    const wrapper = mountComponent();
    await flushPromises();

    const buttons = wrapper.findAll("button");
    const uploadButton = buttons.find((button) => button.text().includes("Replace CSV"));
    const ownedFilterButton = buttons.find((button) => button.text() === "Owned");
    const utilityButton = buttons.find((button) => button.text().includes("Display"));

    await uploadButton?.trigger("click");
    await ownedFilterButton?.trigger("click");
    await utilityButton?.trigger("click");

    expect(wrapper.emitted("open-upload")).toBeTruthy();
    expect(wrapper.emitted("filter-change")?.[0]).toEqual([true]);
    expect(wrapper.emitted("toggle-utility")).toBeTruthy();
  });

  it("renders export controls as disabled when no decklist exists", async () => {
    const wrapper = mountComponent({ decklistText: "" });
    await flushPromises();

    const exportButtons = wrapper.findAll('[data-testid^="header-"]');
    expect(exportButtons).toHaveLength(2);
    expect(exportButtons[0]?.attributes("disabled")).toBeDefined();
    expect(exportButtons[1]?.attributes("disabled")).toBeDefined();
  });
});
