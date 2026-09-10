import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import TopCommandersStatusCard from "../../../../src/components/top-commanders/TopCommandersStatusCard.vue";

const mountComponent = (overrides = {}) =>
  mount(TopCommandersStatusCard, {
    props: {
      hasCsvData: false,
      csvCount: 0,
      lastUpdated: null,
      failedCount: 0,
      scanScope: "top-commanders-scan",
      scanError: null,
      ...overrides,
    },
    global: {
      stubs: {
        GlobalLoadingBanner: { template: "<div class='loading-stub'><slot /></div>" },
      },
    },
  });

describe("TopCommandersStatusCard", () => {
  it("prompts for upload when no CSV data is loaded", () => {
    const wrapper = mountComponent();

    expect(wrapper.text()).toContain("Upload a CSV to calculate owned percentages.");
    expect(wrapper.text()).toContain("Scanning commander averages...");
  });

  it("summarizes loaded CSV state and scan problems", () => {
    const wrapper = mountComponent({
      hasCsvData: true,
      csvCount: 1,
      lastUpdated: new Date("2026-09-10T13:05:00Z"),
      failedCount: 2,
      scanError: "Unable to load commanders.",
    });

    expect(wrapper.text()).toContain("1 card loaded.");
    expect(wrapper.text()).toContain("Last updated");
    expect(wrapper.text()).toContain("2 commanders failed to load.");
    expect(wrapper.get("[role='alert']").text()).toContain("Unable to load commanders.");
  });
});
