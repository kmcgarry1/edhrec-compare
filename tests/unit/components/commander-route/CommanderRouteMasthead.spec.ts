import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import CommanderRouteMasthead from "../../../../src/components/commander-route/CommanderRouteMasthead.vue";

const baseProps = {
  commanderSelection: {
    primary: "Atraxa, Grand Unifier",
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
      colorIdentity: ["W", "U", "B", "G"],
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
  commanderColorIdentity: ["W", "U", "B", "G"],
  spotlightLoading: false,
  backdropUrl: "https://example.com/atraxa-art.jpg",
  nextStepLabel: "Decklist ready to export.",
  canonicalEdhrecHref: "https://edhrec.com/commanders/atraxa-grand-unifier",
  statusItems: [
    { label: "Collection loaded", tone: "accent" },
    { label: "Owned cards", tone: "success" },
    { label: "Commander", tone: "default" },
  ],
  statItems: [
    { label: "Active sections", value: "2 of 4" },
    { label: "Visible cards", value: "18", tone: "accent" },
  ],
} as const;

const mountComponent = (overrideProps = {}) =>
  mount(CommanderRouteMasthead, {
    props: {
      ...baseProps,
      ...overrideProps,
    },
  });

describe("CommanderRouteMasthead", () => {
  it("renders the destination masthead with color identity, stats, and primary actions", async () => {
    const wrapper = mountComponent();

    expect(wrapper.text()).toContain("Commander destination");
    expect(wrapper.text()).toContain("Atraxa, Grand Unifier");
    expect(wrapper.text()).toContain("Decklist ready to export.");
    expect(wrapper.text()).toContain("Collection loaded");
    expect(wrapper.text()).toContain("Visible cards");
    expect(wrapper.text()).toContain("18");
    expect(wrapper.text()).toContain("W");
    expect(wrapper.text()).toContain("U");
    expect(wrapper.text()).toContain("$45.00");
    expect(wrapper.text()).toContain("Printings (2)");

    const edhrecLink = wrapper.find('a[href="https://edhrec.com/commanders/atraxa-grand-unifier"]');
    expect(edhrecLink.exists()).toBe(true);

    await wrapper
      .findAll("button")
      .find((button) => button.text().includes("Change commander"))
      ?.trigger("click");
    await wrapper.get('[data-testid="dashboard-control-trigger"]').trigger("click");
    await wrapper.get('[data-testid="dashboard-utility-trigger"]').trigger("click");
    await wrapper
      .findAll("button")
      .find((button) => button.text().includes("Printings (2)"))
      ?.trigger("click");

    expect(wrapper.emitted("change-commander")?.[0]).toEqual([]);
    expect(wrapper.emitted("open-controls")?.[0]).toEqual([]);
    expect(wrapper.emitted("open-utilities")?.[0]).toEqual([]);
    expect(wrapper.text()).toContain("Printing 1 of 2");
  });

  it("renders partner profiles without a printings toggle", () => {
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
          colorIdentity: ["W", "B"],
          canCyclePrintings: false,
          totalPrintings: 1,
        },
        {
          ...baseProps.commanderProfiles[0],
          id: "thrasios",
          name: "Thrasios, Triton Hero",
          imageUrl: "https://example.com/thrasios-card.jpg",
          artUrl: "https://example.com/thrasios-art.jpg",
          colorIdentity: ["U", "G"],
          canCyclePrintings: false,
          totalPrintings: 1,
        },
      ],
      commanderColorIdentity: ["W", "U", "B", "G"],
    });

    expect(wrapper.text()).toContain("Tymna the Weaver + Thrasios, Triton Hero");
    expect(wrapper.text()).toContain("Partner commanders selected");
    expect(wrapper.text()).toContain("Primary");
    expect(wrapper.text()).toContain("Partner");
    expect(wrapper.text()).not.toContain("Printings (");
    expect(wrapper.findAll("img")).toHaveLength(2);
  });
});
