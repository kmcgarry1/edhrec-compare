import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import TopCommandersControls from "../../../../src/components/top-commanders/TopCommandersControls.vue";

const mountComponent = (overrides = {}) =>
  mount(TopCommandersControls, {
    props: {
      topHeader: "EDHREC leaders",
      topLimit: 50,
      sortMode: "rank",
      limitOptions: [25, 50, 100],
      sortOptions: [
        { value: "rank", label: "Rank" },
        { value: "owned", label: "Owned" },
      ],
      topLoading: false,
      canSortOwned: false,
      ...overrides,
    },
  });

describe("TopCommandersControls", () => {
  it("renders selected range and disables owned sorting until scan data is available", () => {
    const wrapper = mountComponent();

    expect(wrapper.text()).toContain("Top 50 commanders");
    expect(wrapper.get("button[aria-pressed='true']").text()).toContain("Top 50");
    expect(wrapper.findAll("button").find((button) => button.text() === "Owned")?.attributes("disabled")).toBeDefined();
  });

  it("emits range, sort, and refresh actions", async () => {
    const wrapper = mountComponent({ canSortOwned: true });
    const buttons = wrapper.findAll("button");

    await buttons.find((button) => button.text() === "Top 100")?.trigger("click");
    await buttons.find((button) => button.text() === "Owned")?.trigger("click");
    await buttons.find((button) => button.text() === "Refresh list")?.trigger("click");

    expect(wrapper.emitted("limit-change")).toEqual([[100]]);
    expect(wrapper.emitted("sort-change")).toEqual([["owned"]]);
    expect(wrapper.emitted("refresh")).toHaveLength(1);
  });
});
