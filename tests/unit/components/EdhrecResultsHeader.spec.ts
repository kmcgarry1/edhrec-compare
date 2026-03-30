import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import EdhrecResultsHeader from "../../../src/components/edhrec/EdhrecResultsHeader.vue";

describe("EdhrecResultsHeader", () => {
  it("renders the heading, stat badges, ownership summary, and expand control", async () => {
    const wrapper = mount(EdhrecResultsHeader, {
      props: {
        listCount: 4,
        totalSectionCount: 7,
        cardCount: 123,
        deckViewLabel: "Missing cards",
        ownershipSummary: "Showing owned cards across 4 active sections.",
        allExpanded: false,
      },
    });

    expect(wrapper.text()).toContain("Results");
    expect(wrapper.text()).toContain("Cardlists");
    expect(wrapper.text()).toContain("4 active of 7");
    expect(wrapper.text()).toContain("123 cards");
    expect(wrapper.text()).toContain("Showing owned cards across 4 active sections.");
    expect(wrapper.text()).toContain("Expand all");

    const badges = wrapper.findAll(".c-badge");
    expect(badges).toHaveLength(3);
    expect(badges[0]?.classes()).toContain("normal-case");
    expect(wrapper.text()).toContain("Missing cards");

    await wrapper.get("button").trigger("click");
    expect(wrapper.emitted("toggle-expand-all")).toBeTruthy();
  });
});
