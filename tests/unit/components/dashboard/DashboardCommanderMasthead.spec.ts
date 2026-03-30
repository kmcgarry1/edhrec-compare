import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import DashboardCommanderMasthead from "../../../../src/components/dashboard/DashboardCommanderMasthead.vue";

const baseProps = {
  commanderSelection: {
    primary: "Atraxa Grand Unifier",
    partner: "",
    hasPartner: false,
  },
  commanderProfiles: [
    {
      id: "atraxa-one",
      name: "Atraxa, Grand Unifier",
      imageUrl: "https://example.com/atraxa-card.jpg",
      artUrl: "https://example.com/atraxa-art.jpg",
      hasArtwork: true,
      scryfallUri: "https://scryfall.com/card/one/196/atraxa-grand-unifier",
      printsSearchUri: "https://api.scryfall.com/cards/search/atraxa-printings",
      prices: { usd: "45", eur: "40" },
      setCode: "ONE",
      setName: "Phyrexia: All Will Be One",
      collectorNumber: "196",
      releasedAt: "2023-02-03",
      totalPrintings: 2,
      printingPosition: 1,
      canCyclePrintings: true,
      printingsLoading: false,
    },
  ],
  spotlightLoading: false,
  backdropUrl: "https://example.com/atraxa-art.jpg",
  nextStepLabel: "Decklist ready to export.",
  canonicalEdhrecHref: "https://edhrec.com/commanders/atraxa-grand-unifier",
  statusItems: [
    { label: "Collection loaded", tone: "accent" },
    { label: "Missing", tone: "warn" },
    { label: "Average Decks", tone: "accent" },
  ],
} as const;

const mountComponent = (overrideProps = {}) =>
  mount(DashboardCommanderMasthead, {
    props: {
      ...baseProps,
      ...overrideProps,
    },
  });

describe("DashboardCommanderMasthead", () => {
  it("renders a compare-first single-commander masthead with status chips and a compact printings toggle", async () => {
    const wrapper = mountComponent();

    expect(wrapper.text()).toContain("Atraxa, Grand Unifier");
    expect(wrapper.text()).toContain("Commander");
    expect(wrapper.text()).toContain("Decklist ready to export.");
    expect(wrapper.text()).toContain("Collection loaded");
    expect(wrapper.text()).toContain("Missing");
    expect(wrapper.text()).toContain("$45.00");
    expect(wrapper.text()).toContain("EUR 40.00");
    expect(wrapper.text()).toContain("Change commander");
    expect(wrapper.text()).toContain("Compare controls");
    expect(wrapper.text()).toContain("Printings (2)");
    expect(wrapper.text()).not.toContain("Printing 1 of 2");

    const edhrecLink = wrapper.find('a[href="https://edhrec.com/commanders/atraxa-grand-unifier"]');
    expect(edhrecLink.exists()).toBe(true);

    await wrapper
      .findAll("button")
      .find((button) => button.text().includes("Change commander"))
      ?.trigger("click");
    await wrapper.get('[data-testid="dashboard-control-trigger"]').trigger("click");
    await wrapper
      .findAll("button")
      .find((button) => button.text().includes("Printings (2)"))
      ?.trigger("click");

    expect(wrapper.emitted("change-commander")?.[0]).toEqual([]);
    expect(wrapper.emitted("open-controls")?.[0]).toEqual([]);
    expect(wrapper.text()).toContain("Printing 1 of 2");

    const buttons = wrapper.findAll("button");
    const previousPrintingButton = buttons.find((button) => button.text() === "Prev");
    const nextPrintingButton = buttons.find((button) => button.text() === "Next");

    await previousPrintingButton?.trigger("click");
    await nextPrintingButton?.trigger("click");

    expect(wrapper.emitted("previous-printing")?.[0]).toEqual([0]);
    expect(wrapper.emitted("next-printing")?.[0]).toEqual([0]);
  });

  it("renders partner visuals with a merged summary and no printings toggle", () => {
    const wrapper = mountComponent({
      commanderSelection: {
        primary: "Tymna the Weaver",
        partner: "Thrasios, Triton Hero",
        hasPartner: true,
      },
      commanderProfiles: [
        {
          ...baseProps.commanderProfiles[0],
          id: "tymna",
          name: "Tymna the Weaver",
          prices: { usd: "18", eur: "16" },
          totalPrintings: 1,
          printingPosition: 1,
          canCyclePrintings: false,
        },
        {
          ...baseProps.commanderProfiles[0],
          id: "thrasios",
          name: "Thrasios, Triton Hero",
          imageUrl: "https://example.com/thrasios-card.jpg",
          artUrl: "https://example.com/thrasios-art.jpg",
          prices: { usd: "32", eur: "29" },
          totalPrintings: 1,
          printingPosition: 1,
          canCyclePrintings: false,
        },
      ],
    });

    expect(wrapper.text()).toContain("Commander");
    expect(wrapper.text()).toContain("Tymna the Weaver + Thrasios, Triton Hero");
    expect(wrapper.text()).toContain("Partner commanders selected");
    expect(wrapper.text()).toContain("Primary");
    expect(wrapper.text()).toContain("Partner");
    expect(wrapper.text()).not.toContain("Printings (");
    expect(wrapper.findAll("img")).toHaveLength(2);
  });

  it("renders placeholder spotlight cards while commander data is loading", () => {
    const wrapper = mountComponent({
      commanderProfiles: [],
      spotlightLoading: true,
      commanderSelection: {
        primary: "Tymna the Weaver",
        partner: "Thrasios, Triton Hero",
        hasPartner: true,
      },
    });

    expect(wrapper.text()).toContain("Loading commander details");
    expect(wrapper.findAll(".animate-pulse")).toHaveLength(2);
  });
});
