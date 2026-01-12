import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import CardlistSection from "../../../src/components/CardlistSection.vue";
import type { CardTableRow } from "../../../src/types/cards";

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
  cardlist: { header: "Top Picks", cardviews: [] },
  sectionMeta: {
    id: "core",
    label: "Core",
    iconPath: "M0 0h24v24H0z",
    iconColor: "#ff0000",
  },
  rows,
  columns,
  decklistText: "Sol Ring",
  copiedSectionId: null,
};

const mountComponent = (overrideProps = {}) =>
  mount(CardlistSection, {
    props: {
      ...baseProps,
      ...overrideProps,
    },
    global: {
      stubs: {
        Card: { template: "<div class='card-stub'><slot /></div>" },
        SkeletonCard: { template: "<div class='skeleton-stub' />" },
        ScryfallCardRow: { template: "<div class='row-stub' />" },
        CardTable: {
          props: ["rows"],
          template:
            "<div class='table-stub'><slot v-for='row in rows' :row='row' /></div>",
        },
      },
    },
  });

describe("CardlistSection", () => {
  it("shows skeletons when loading", () => {
    const wrapper = mountComponent({ loading: true });
    expect(wrapper.findAll(".skeleton-stub")).toHaveLength(5);
    expect(wrapper.find(".table-stub").exists()).toBe(false);
  });

  it("renders rows for desktop and mobile when not loading", () => {
    const wrapper = mountComponent({ loading: false });
    expect(wrapper.find(".table-stub").exists()).toBe(true);
    expect(wrapper.findAll(".row-stub")).toHaveLength(rows.length * 2);
  });

  it("emits copy and download when decklist is available", async () => {
    const wrapper = mountComponent({ copiedSectionId: "core" });
    const buttons = wrapper.findAll("button");
    await buttons[0]?.trigger("click");
    await buttons[1]?.trigger("click");

    expect(wrapper.emitted("copy")).toBeTruthy();
    expect(wrapper.emitted("download")).toBeTruthy();
    expect(wrapper.text()).toContain("Copied!");
  });

  it("disables export actions when decklist is empty", async () => {
    const wrapper = mountComponent({ decklistText: "" });
    const buttons = wrapper.findAll("button");
    expect(buttons[0]?.attributes("disabled")).toBeDefined();
    expect(buttons[1]?.attributes("disabled")).toBeDefined();

    await buttons[0]?.trigger("click");
    expect(wrapper.emitted("copy")).toBeFalsy();
  });
});
