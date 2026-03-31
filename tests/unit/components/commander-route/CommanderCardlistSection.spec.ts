import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import CommanderCardlistSection from "../../../../src/components/commander-route/CommanderCardlistSection.vue";
import type { CardTableRow } from "../../../../src/types/cards";

const rows: CardTableRow[] = [
  {
    id: "1",
    have: true,
    card: { id: "1", name: "Sol Ring" },
  },
  {
    id: "2",
    have: false,
    card: { id: "2", name: "Arcane Signet" },
  },
];

const columns = [
  { key: "name", label: "Name" },
  { key: "type", label: "Type" },
];

const baseProps = {
  cardlist: { header: "New Cards", cardviews: [] },
  sectionMeta: {
    id: "new-cards",
    label: "New Cards",
    iconPath: "M0 0h24v24H0z",
    iconColor: "#38d3cd",
    tone: "accent",
    summary: "Fresh options from the latest release window.",
    isPopulated: true,
    defaultExpanded: true,
    expanded: true,
    summaryCounts: {
      totalCards: 2,
      ownedCount: 1,
      unownedCount: 1,
      ownedPercent: 50,
    },
  },
  rows,
  columns,
  decklistText: "1 Sol Ring",
  copiedSectionId: null,
} as const;

const mountComponent = (overrideProps = {}) =>
  mount(CommanderCardlistSection, {
    props: {
      ...baseProps,
      ...overrideProps,
    },
    global: {
      stubs: {
        SkeletonCard: { template: "<div class='skeleton-stub' />" },
        ScryfallCardRow: { template: "<div class='row-stub' />" },
        CardTable: {
          props: ["rows"],
          template: "<div class='table-stub'><slot v-for='row in rows' :row='row' /></div>",
        },
      },
    },
  });

describe("CommanderCardlistSection", () => {
  const originalInnerWidth = window.innerWidth;

  beforeEach(() => {
    Object.defineProperty(window, "innerWidth", {
      configurable: true,
      writable: true,
      value: 1280,
    });
  });

  afterEach(() => {
    Object.defineProperty(window, "innerWidth", {
      configurable: true,
      writable: true,
      value: originalInnerWidth,
    });
  });

  it("renders the route-specific summary copy and desktop table view", () => {
    const wrapper = mountComponent();

    expect(wrapper.text()).toContain("Fresh options from the latest release window.");
    expect(wrapper.text()).toContain("50% owned");
    expect(wrapper.find(".table-stub").exists()).toBe(true);
    expect(wrapper.findAll(".row-stub")).toHaveLength(rows.length);
  });

  it("shows skeleton rows when loading", () => {
    const wrapper = mountComponent({ loading: true });

    expect(wrapper.findAll(".skeleton-stub")).toHaveLength(5);
    expect(wrapper.find(".table-stub").exists()).toBe(false);
  });

  it("renders mobile card rows on narrow viewports", async () => {
    Object.defineProperty(window, "innerWidth", {
      configurable: true,
      writable: true,
      value: 640,
    });

    const wrapper = mountComponent();
    await wrapper.vm.$nextTick();

    expect(wrapper.find(".table-stub").exists()).toBe(false);
    expect(wrapper.findAll(".row-stub")).toHaveLength(rows.length);
  });

  it("emits copy, download, and toggle actions", async () => {
    const wrapper = mountComponent({ copiedSectionId: "new-cards" });
    const buttons = wrapper.findAll("button");

    await buttons[1]?.trigger("click");
    await buttons[2]?.trigger("click");
    await buttons[0]?.trigger("click");

    expect(wrapper.emitted("copy")).toBeTruthy();
    expect(wrapper.emitted("download")).toBeTruthy();
    expect(wrapper.emitted("toggle")).toBeTruthy();
    expect(wrapper.text()).toContain("Copied!");
  });

  it("renders a collapsed section summary without export actions", () => {
    const wrapper = mountComponent({
      sectionMeta: {
        ...baseProps.sectionMeta,
        expanded: false,
      },
    });

    expect(wrapper.text()).toContain("Expand");
    expect(wrapper.find(".table-stub").exists()).toBe(false);
    expect(wrapper.findAll("button")).toHaveLength(1);
  });
});
