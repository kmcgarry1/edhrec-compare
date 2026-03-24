import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import DashboardCommanderMasthead from "../../../../src/components/dashboard/DashboardCommanderMasthead.vue";

const baseProps = {
  commanderSelection: {
    primary: "Atraxa Grand Unifier",
    partner: "",
    hasPartner: false,
  },
  spotlightCards: [
    {
      name: "Atraxa, Grand Unifier",
      imageUrl: "https://example.com/atraxa-card.jpg",
      artUrl: "https://example.com/atraxa-art.jpg",
    },
  ],
  spotlightLoading: false,
  backdropUrl: "https://example.com/atraxa-art.jpg",
  csvCount: 243,
  hasCsvData: true,
  decklistReady: true,
  decklistSectionCount: 8,
  nextStepLabel: "Decklist ready to export.",
} as const;

const mountComponent = (overrideProps = {}) =>
  mount(DashboardCommanderMasthead, {
    props: {
      ...baseProps,
      ...overrideProps,
    },
  });

describe("DashboardCommanderMasthead", () => {
  it("renders commander spotlight imagery and prefers resolved card names", () => {
    const wrapper = mountComponent();

    expect(wrapper.text()).toContain("Atraxa, Grand Unifier");

    const spotlightImage = wrapper.find("img");
    expect(spotlightImage.exists()).toBe(true);
    expect(spotlightImage.attributes("src")).toBe("https://example.com/atraxa-card.jpg");
    expect(spotlightImage.attributes("alt")).toBe("Atraxa, Grand Unifier");
  });

  it("renders placeholder spotlight cards while artwork is loading", () => {
    const wrapper = mountComponent({
      spotlightCards: [],
      spotlightLoading: true,
      commanderSelection: {
        primary: "Tymna the Weaver",
        partner: "Thrasios, Triton Hero",
        hasPartner: true,
      },
    });

    expect(
      wrapper.findAll('.aspect-\\[63\\/88\\].rounded-\\[24px\\].border').length
    ).toBeGreaterThanOrEqual(2);
    expect(wrapper.text()).toContain("Partner pair");
  });
});
