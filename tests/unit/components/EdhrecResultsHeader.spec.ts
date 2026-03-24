import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import EdhrecResultsHeader from "../../../src/components/edhrec/EdhrecResultsHeader.vue";

describe("EdhrecResultsHeader", () => {
  it("renders the heading and stat badges", () => {
    const wrapper = mount(EdhrecResultsHeader, {
      props: {
        listCount: 4,
        cardCount: 123,
      },
    });

    expect(wrapper.text()).toContain("Results");
    expect(wrapper.text()).toContain("Cardlists");
    expect(wrapper.text()).toContain("4 lists");
    expect(wrapper.text()).toContain("123 cards");

    const badges = wrapper.findAll(".c-badge");
    expect(badges).toHaveLength(2);
    expect(badges[0]?.classes()).toContain("normal-case");
  });
});
