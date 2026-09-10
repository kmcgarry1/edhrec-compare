import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import CommanderResultsCommandBar from "../../../../src/components/commander-route/CommanderResultsCommandBar.vue";

const mountComponent = (overrideProps = {}) =>
  mount(CommanderResultsCommandBar, {
    props: {
      sections: [
        {
          id: "new-cards",
          label: "New Cards",
          iconPath: "M0 0h24v24H0z",
          iconColor: "#38d3cd",
        },
        {
          id: "high-synergy-cards",
          label: "High Synergy Cards",
        },
      ],
      activeId: "new-cards",
      listCount: 2,
      totalSectionCount: 4,
      cardCount: 18,
      deckViewLabel: "Owned cards",
      ownershipSummary: "Showing owned cards across 2 active sections.",
      allExpanded: false,
      hasCsvData: true,
      filterOptions: [
        { label: "All", value: null, active: false, count: 18 },
        { label: "Owned", value: true, active: true, count: 8 },
        { label: "Missing", value: false, active: false, count: 10 },
      ],
      decklistAvailable: true,
      decklistCopied: false,
      displayMode: "rows",
      priceMode: "both",
      ...overrideProps,
    },
  });

describe("CommanderResultsCommandBar", () => {
  it("renders the integrated summary and section chips", async () => {
    const wrapper = mountComponent();

    expect(wrapper.get('[data-testid="commander-results-command-bar"]').exists()).toBe(true);
    expect(wrapper.text()).toContain("Cards");
    expect(wrapper.text()).toContain("New Cards");
    expect(wrapper.text()).toContain("High Synergy Cards");

    await wrapper.findAll("select")[1]?.setValue("high-synergy-cards");
    await wrapper
      .findAll("button")
      .find((button) => button.text().includes("Expand all"))
      ?.trigger("click");
    await wrapper
      .findAll("button")
      .find((button) => button.text().includes("Missing"))
      ?.trigger("click");
    await wrapper
      .findAll("button")
      .find((button) => button.text().includes("Filters"))
      ?.trigger("click");
    await wrapper
      .findAll("button")
      .find((button) => button.text().includes("Gallery"))
      ?.trigger("click");
    await wrapper.findAll("select")[0]?.setValue("usd");
    await wrapper
      .findAll("button")
      .find((button) => button.text().includes("Copy"))
      ?.trigger("click");
    await wrapper
      .findAll("button")
      .find((button) => button.text().includes("Export"))
      ?.trigger("click");

    expect(wrapper.emitted("navigate")?.[0]).toEqual(["high-synergy-cards"]);
    expect(wrapper.emitted("toggle-expand-all")?.[0]).toEqual([]);
    expect(wrapper.emitted("filter-change")?.[0]).toEqual([false]);
    expect(wrapper.emitted("open-filters")?.[0]).toEqual([]);
    expect(wrapper.emitted("display-mode-change")?.[0]).toEqual(["gallery"]);
    expect(wrapper.emitted("price-mode-change")?.[0]).toEqual(["usd"]);
    expect(wrapper.emitted("copy-decklist")?.[0]).toEqual([]);
    expect(wrapper.emitted("download-decklist")?.[0]).toEqual([]);
  });

  it("disables owned and missing filters before collection upload", () => {
    const wrapper = mountComponent({ hasCsvData: false });
    const buttons = wrapper.findAll("button");

    expect(buttons.find((button) => button.text().includes("Owned"))?.attributes("disabled")).toBeDefined();
    expect(buttons.find((button) => button.text().includes("Missing"))?.attributes("disabled")).toBeDefined();
  });
});
