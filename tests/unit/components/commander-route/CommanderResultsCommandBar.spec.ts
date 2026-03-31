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
      ...overrideProps,
    },
  });

describe("CommanderResultsCommandBar", () => {
  it("renders the integrated summary and section chips", async () => {
    const wrapper = mountComponent();

    expect(wrapper.get('[data-testid="commander-results-command-bar"]').exists()).toBe(true);
    expect(wrapper.text()).toContain("Results command bar");
    expect(wrapper.text()).toContain("2 active of 4");
    expect(wrapper.text()).toContain("18 cards");
    expect(wrapper.text()).toContain("Owned cards");
    expect(wrapper.text()).toContain("New Cards");
    expect(wrapper.text()).toContain("High Synergy Cards");

    await wrapper
      .findAll("button")
      .find((button) => button.text().includes("High Synergy Cards"))
      ?.trigger("click");
    await wrapper
      .findAll("button")
      .find((button) => button.text().includes("Expand all"))
      ?.trigger("click");

    expect(wrapper.emitted("navigate")?.[0]).toEqual(["high-synergy-cards"]);
    expect(wrapper.emitted("toggle-expand-all")?.[0]).toEqual([]);
  });
});
