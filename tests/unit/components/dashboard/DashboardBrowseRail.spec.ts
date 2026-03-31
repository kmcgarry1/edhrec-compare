import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";
import DashboardBrowseRail from "../../../../src/components/dashboard/DashboardBrowseRail.vue";

const baseProps = {
  selectedSlug: "atraxa-grand-unifier",
  selection: {
    primary: "Atraxa, Grand Unifier",
    partner: "",
    hasPartner: false,
  },
  bracket: "all",
  modifier: "budget",
  pageType: "commander",
  companion: "",
  sections: [
    {
      id: "new-cards",
      label: "New Cards",
      iconPath: "M0 0h24v24H0z",
      iconColor: "#38d3cd",
    },
  ],
  activeId: "new-cards",
  open: false,
  loading: false,
  hasCsvData: true,
  inventorySummary: "243 cards loaded. Filters now match your collection.",
  filterOptions: [
    { label: "Owned", value: true, active: true },
    { label: "Unowned", value: false, active: false },
    { label: "All", value: null, active: false },
  ],
} as const;

const setViewportWidth = (width: number) => {
  Object.defineProperty(window, "innerWidth", {
    configurable: true,
    writable: true,
    value: width,
  });
  window.dispatchEvent(new Event("resize"));
};

const mountComponent = (overrideProps = {}) =>
  mount(DashboardBrowseRail, {
    props: {
      ...baseProps,
      ...overrideProps,
    },
    attachTo: document.body,
    global: {
      stubs: {
        Teleport: true,
        CommanderSearch: {
          template: "<div class='commander-search-stub'>Commander search</div>",
          props: ["selectedSlug", "selection"],
        },
        CommanderFilters: {
          template: "<div class='commander-filters-stub'>Filters</div>",
          props: ["bracket", "modifier", "pageType", "companion", "layout"],
        },
      },
    },
  });

describe("DashboardBrowseRail", () => {
  beforeEach(() => {
    setViewportWidth(1440);
  });

  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("renders the desktop workbench with search open by default and filter/section groups collapsed", async () => {
    const wrapper = mountComponent();
    await flushPromises();

    expect(wrapper.text()).toContain("Commander workbench");
    expect(wrapper.find(".commander-search-stub").exists()).toBe(true);
    expect(wrapper.find(".commander-filters-stub").exists()).toBe(false);

    await wrapper.get('[data-testid="browse-rail-collection-toggle"]').trigger("click");
    expect(wrapper.find(".commander-filters-stub").exists()).toBe(true);

    const ownedButton = wrapper.findAll("button").find((button) => button.text() === "Owned");
    await ownedButton?.trigger("click");
    expect(wrapper.emitted("filter-change")?.[0]).toEqual([true]);

    await wrapper.get('[data-testid="browse-rail-sections-toggle"]').trigger("click");
    await flushPromises();
    const sectionButton = wrapper
      .findAll("button")
      .find(
        (button) =>
          button.text().trim() === "New Cards" && button.attributes("aria-pressed") !== undefined
      );
    expect(sectionButton).toBeDefined();
    await sectionButton?.trigger("click");
    expect(wrapper.emitted("navigate")?.[0]).toEqual(["new-cards"]);
  });

  it("uses a mobile bottom sheet with Search, Filters, and Sections tabs", async () => {
    setViewportWidth(390);
    const wrapper = mountComponent({ open: true });
    await flushPromises();

    const dialog = wrapper.get('[data-testid="dashboard-browse-sheet"]');
    expect(dialog.attributes("role")).toBe("dialog");
    expect(dialog.attributes("aria-modal")).toBe("true");

    await wrapper.get('[data-testid="browse-sheet-tab-filters"]').trigger("click");
    expect(wrapper.find(".commander-filters-stub").exists()).toBe(true);

    await wrapper.get('[data-testid="browse-sheet-tab-sections"]').trigger("click");
    await wrapper.findAll("button").find((button) => button.text().includes("New Cards"))?.trigger("click");

    expect(wrapper.emitted("navigate")?.[0]).toEqual(["new-cards"]);
    expect(wrapper.emitted("close")).toBeTruthy();
  });

  it("keeps search and filters available when section navigation is intentionally hidden", async () => {
    const wrapper = mountComponent({ showSectionNavigation: false });
    await flushPromises();

    expect(wrapper.find(".commander-search-stub").exists()).toBe(true);
    expect(wrapper.find('[data-testid="browse-rail-sections-toggle"]').exists()).toBe(false);

    setViewportWidth(390);
    await wrapper.setProps({ open: true });
    await flushPromises();

    expect(wrapper.get('[data-testid="browse-sheet-tab-search"]').exists()).toBe(true);
    expect(wrapper.get('[data-testid="browse-sheet-tab-filters"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="browse-sheet-tab-sections"]').exists()).toBe(false);
  });
});
