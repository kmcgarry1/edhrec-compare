import { describe, expect, it } from "vitest";
import { mount, RouterLinkStub } from "@vue/test-utils";
import TopCommanderCard from "../../../../src/components/top-commanders/TopCommanderCard.vue";
import type { CommanderColor } from "../../../../src/utils/colorIdentity";

const commander = {
  slug: "atraxa-grand-unifier",
  name: "Atraxa, Grand Unifier",
  deckCount: 12345,
  rank: 1,
};

const mountComponent = (overrides = {}) =>
  mount(TopCommanderCard, {
    props: {
      commander,
      scanResult: null,
      hasCsvData: false,
      imageStack: [],
      imageLoading: false,
      colors: [],
      ...overrides,
    },
    global: {
      stubs: {
        RouterLink: RouterLinkStub,
      },
    },
  });

describe("TopCommanderCard", () => {
  it("links to the average deck route and prompts for collection data", () => {
    const wrapper = mountComponent();

    expect(wrapper.getComponent(RouterLinkStub).props("to")).toEqual({
      name: "commander",
      params: { slug: "atraxa-grand-unifier" },
      query: { pageType: "average-decks" },
    });
    expect(wrapper.text()).toContain("#1");
    expect(wrapper.text()).toContain("12,345 decks");
    expect(wrapper.text()).toContain("Unknown");
    expect(wrapper.text()).toContain("Upload collection");
  });

  it("renders scan ownership details and highlights strong matches", () => {
    const wrapper = mountComponent({
      hasCsvData: true,
      scanResult: {
        slug: "atraxa-grand-unifier",
        name: "Atraxa, Grand Unifier",
        rank: 1,
        deckCount: 12345,
        ownedCards: 72,
        totalCards: 90,
        ownedPercent: 80,
      },
      imageStack: ["primary.jpg", "partner.jpg"],
      colors: ["W", "U", "B", "G"] satisfies CommanderColor[],
    });

    expect(wrapper.text()).toContain("80% owned");
    expect(wrapper.text()).toContain("72 of 90");
    expect(wrapper.findAll("img")).toHaveLength(2);
    expect(wrapper.get("img").classes()).toContain("object-contain");
    expect(wrapper.findAll("[aria-label='White']")).toHaveLength(1);
    expect(wrapper.getComponent({ name: "CSurface" }).attributes("style")).toContain(
      "border-color: var(--accent)"
    );
  });

  it("colors the card border by ownership percentage bands", () => {
    const low = mountComponent({
      hasCsvData: true,
      scanResult: {
        slug: "atraxa-grand-unifier",
        name: "Atraxa, Grand Unifier",
        rank: 1,
        deckCount: 12345,
        ownedCards: 20,
        totalCards: 100,
        ownedPercent: 20,
      },
    });
    const medium = mountComponent({
      hasCsvData: true,
      scanResult: {
        slug: "atraxa-grand-unifier",
        name: "Atraxa, Grand Unifier",
        rank: 1,
        deckCount: 12345,
        ownedCards: 50,
        totalCards: 100,
        ownedPercent: 50,
      },
    });

    expect(low.getComponent({ name: "CSurface" }).attributes("style")).toContain(
      "border-color: var(--danger)"
    );
    expect(medium.getComponent({ name: "CSurface" }).attributes("style")).toContain(
      "border-color: var(--warn)"
    );
  });

  it("shows loading and scanning states before scan results arrive", () => {
    const wrapper = mountComponent({
      hasCsvData: true,
      imageLoading: true,
    });

    expect(wrapper.text()).toContain("Loading");
    expect(wrapper.text()).toContain("Scanning");
    expect(wrapper.text()).toContain("Waiting for results");
  });
});
