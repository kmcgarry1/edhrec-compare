import { beforeEach, describe, expect, it, vi } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";
import { defineComponent, h, ref } from "vue";
import DashboardWorkspace from "../../../../src/components/dashboard/DashboardWorkspace.vue";

const setCommanderSlug = vi.fn();
const setBracket = vi.fn();
const setModifier = vi.fn();
const setPageType = vi.fn();
const setCompanion = vi.fn();
const scrollToSection = vi.fn();
const handleCopyDecklist = vi.fn();
const handleDownloadDecklist = vi.fn();
const toggleSection = vi.fn();
const expandAllSections = vi.fn();
const collapseAllSections = vi.fn();
const getTableRows = vi.fn().mockReturnValue([]);
const browseRailSelectPrimaryCommander = vi.fn();
const browseRailFocusPrimarySearch = vi.fn();

const chosenPageType = ref("commander");
const chosenBracket = ref("");
const chosenModifier = ref("");
const chosenCompanion = ref("");
const currentCommanderSlug = ref("atraxa-grand-unifier");
const commanderUrl = ref("https://json.edhrec.com/pages/commanders/atraxa-grand-unifier.json");

const cardlists = ref([
  {
    header: "New Cards",
    cardviews: [{ id: "sol-ring", name: "Sol Ring" }],
  },
]);
const error = ref("");
const readerLoading = ref(false);

const cardlistSections = ref([
  {
    id: "new-cards",
    label: "New Cards",
    iconPath: "M0 0h24v24H0z",
    iconColor: "#38d3cd",
    expanded: true,
  },
]);
const cardlistEntries = ref([
  {
    key: "new-cards-0",
    cardlist: cardlists.value[0],
    sectionMeta: cardlistSections.value[0],
    decklistText: "1 Sol Ring",
    index: 0,
  },
]);
const totalSectionCount = ref(1);
const visibleCardCount = ref(1);
const deckViewCounts = ref({ owned: 1, missing: 0, all: 1 });
const deckFilterLabel = ref("Owned cards");
const decklistPayload = ref({
  text: "1 Sol Ring",
  filterLabel: "Owned cards",
  sections: ["New Cards"],
});
const decklistCopySectionId = ref<string | null>(null);
const activeSectionId = ref("new-cards");
const allSectionsExpanded = ref(false);
const bulkCardsLoading = ref(false);

vi.mock("../../../../src/composables/useEdhrecRouteState", () => ({
  useEdhrecRouteState: () => ({
    chosenPageType,
    chosenBracket,
    chosenModifier,
    chosenCompanion,
    currentCommanderSlug,
    commanderUrl,
    setCommanderSlug,
    setBracket,
    setModifier,
    setPageType,
    setCompanion,
  }),
}));

vi.mock("../../../../src/composables/useEdhrecData", () => ({
  useEdhrecData: () => ({
    cardlists,
    error,
    readerLoading,
  }),
}));

vi.mock("../../../../src/composables/useEdhrecCardlists", () => ({
  useEdhrecCardlists: () => ({
    cardlistSections,
    cardlistEntries,
    totalSectionCount,
    visibleCardCount,
    deckViewCounts,
    deckFilterLabel,
    decklistPayload,
    decklistCopySectionId,
    activeSectionId,
    allSectionsExpanded,
    toggleSection,
    expandAllSections,
    collapseAllSections,
    scrollToSection,
    filterCardviews: vi.fn(),
    isCardInUpload: vi.fn(),
    handleCopyDecklist,
    handleDownloadDecklist,
  }),
}));

vi.mock("../../../../src/composables/useScryfallCardData", () => ({
  useScryfallCardData: () => ({
    bulkCardsLoading,
    getTableRows,
  }),
}));

const DashboardBrowseRailStub = defineComponent({
  name: "DashboardBrowseRail",
  emits: [
    "close",
    "navigate",
    "filter-change",
    "selection-change",
    "commander-selected",
    "update:bracket",
    "update:modifier",
    "update:page-type",
    "update:companion",
  ],
  setup(_, { emit, expose }) {
    expose({
      selectPrimaryCommander: browseRailSelectPrimaryCommander,
      startPartnerSelection: vi.fn(),
      focusPrimarySearch: browseRailFocusPrimarySearch,
    });

    return () =>
      h("aside", { class: "browse-rail-stub" }, [
        h(
          "button",
          {
            class: "browse-rail-close",
            onClick: () => emit("close"),
          },
          "Close"
        ),
        h(
          "button",
          {
            class: "browse-rail-filter",
            onClick: () => emit("filter-change", true),
          },
          "Filter"
        ),
        h(
          "button",
          {
            class: "browse-rail-nav",
            onClick: () => emit("navigate", "new-cards"),
          },
          "Navigate"
        ),
        h(
          "button",
          {
            class: "browse-rail-selection",
            onClick: () =>
              emit("selection-change", {
                primary: "Atraxa, Grand Unifier",
                partner: "",
                hasPartner: false,
              }),
          },
          "Selection"
        ),
        h(
          "button",
          {
            class: "browse-rail-commander",
            onClick: () => emit("commander-selected", "edgar-markov"),
          },
          "Commander"
        ),
      ]);
  },
});

const mountComponent = () =>
  mount(DashboardWorkspace, {
    props: {
      controlPanelOpen: false,
      commanderSelection: {
        primary: "Atraxa, Grand Unifier",
        partner: "",
        hasPartner: false,
      },
      commanderProfiles: [],
      commanderSpotlightLoading: false,
      commanderSpotlightBackdropUrl: "",
      canonicalEdhrecHref: "https://edhrec.com/commanders/atraxa-grand-unifier",
      nextStepLabel: "Decklist ready to export.",
      hasCsvData: true,
      inventorySummary: "42 cards loaded. Deck view now reflects your collection.",
      filterOptions: [
        { label: "Owned", value: true, active: true },
        { label: "Missing", value: false, active: false },
        { label: "All cards", value: null, active: false },
      ],
    },
    global: {
      stubs: {
        DashboardBrowseRail: DashboardBrowseRailStub,
        DashboardCommanderMasthead: {
          template:
            "<header class='masthead-stub'><button class='masthead-open' @click=\"$emit('open-controls')\">Open</button><button class='masthead-utilities' @click=\"$emit('open-utilities')\">Utilities</button><button class='masthead-change' @click=\"$emit('change-commander')\">Change</button></header>",
        },
        CardlistSection: {
          template:
            "<article class='cardlist-section-stub'><button class='section-toggle' @click=\"$emit('toggle')\">Toggle</button><button class='section-copy' @click=\"$emit('copy')\">Copy</button><button class='section-download' @click=\"$emit('download')\">Download</button></article>",
        },
        GlobalLoadingBanner: { template: "<div class='banner-stub'></div>" },
        EdhrecEmptyState: { template: "<div class='empty-state-stub'></div>" },
      },
    },
  });

describe("DashboardWorkspace", () => {
  beforeEach(() => {
    setCommanderSlug.mockClear();
    setBracket.mockClear();
    setModifier.mockClear();
    setPageType.mockClear();
    setCompanion.mockClear();
    scrollToSection.mockClear();
    handleCopyDecklist.mockClear();
    handleDownloadDecklist.mockClear();
    toggleSection.mockClear();
    expandAllSections.mockClear();
    collapseAllSections.mockClear();
    getTableRows.mockClear();
    browseRailSelectPrimaryCommander.mockClear();
    browseRailFocusPrimarySearch.mockClear();
    error.value = "";
    readerLoading.value = false;
    cardlistEntries.value = [
      {
        key: "new-cards-0",
        cardlist: cardlists.value[0],
        sectionMeta: cardlistSections.value[0],
        decklistText: "1 Sol Ring",
        index: 0,
      },
    ];
    decklistPayload.value = {
      text: "1 Sol Ring",
      filterLabel: "Owned cards",
      sections: ["New Cards"],
    };
    allSectionsExpanded.value = false;
  });

  it("renders the browse rail shell, compact masthead, and content canvas", async () => {
    const wrapper = mountComponent();
    await flushPromises();

    expect(wrapper.find(".browse-rail-stub").exists()).toBe(true);
    expect(wrapper.find(".masthead-stub").exists()).toBe(true);
    expect(wrapper.find(".surface-role-content").exists()).toBe(true);
    expect(wrapper.text()).toContain("utilities tray");
    expect(wrapper.find("[data-testid='header-copy-decklist']").exists()).toBe(false);
    expect(wrapper.find("[data-testid='header-download-decklist']").exists()).toBe(false);
    expect(wrapper.emitted("decklistUpdate")?.[0]?.[0]).toEqual(decklistPayload.value);
  });

  it("delegates rail, masthead, and section actions correctly", async () => {
    const wrapper = mountComponent();
    await flushPromises();

    await wrapper.get(".masthead-open").trigger("click");
    await wrapper.get(".masthead-utilities").trigger("click");
    await wrapper.get(".masthead-change").trigger("click");
    await wrapper.get(".browse-rail-close").trigger("click");
    await wrapper.get(".browse-rail-filter").trigger("click");
    await wrapper.get(".browse-rail-nav").trigger("click");
    await wrapper.get(".browse-rail-selection").trigger("click");
    await wrapper.get(".browse-rail-commander").trigger("click");
    await wrapper.get(".section-toggle").trigger("click");
    await wrapper.get(".section-copy").trigger("click");
    await wrapper.get(".section-download").trigger("click");

    expect(wrapper.emitted("open-control-panel")).toBeTruthy();
    expect(wrapper.emitted("open-utilities")).toBeTruthy();
    expect(wrapper.emitted("close-control-panel")).toBeTruthy();
    expect(wrapper.emitted("filter-change")?.[0]).toEqual([true]);
    expect(wrapper.emitted("selection-change")?.[0]).toEqual([
      {
        primary: "Atraxa, Grand Unifier",
        partner: "",
        hasPartner: false,
      },
    ]);
    expect(setCommanderSlug).toHaveBeenCalledWith("edgar-markov");
    expect(scrollToSection).toHaveBeenCalledWith("new-cards");
    expect(toggleSection).toHaveBeenCalledWith("new-cards");
    expect(handleCopyDecklist).toHaveBeenCalledWith(cardlists.value[0], 0);
    expect(handleDownloadDecklist).toHaveBeenCalledWith(cardlists.value[0], 0);
    expect(browseRailFocusPrimarySearch).toHaveBeenCalledTimes(1);
  });

  it("toggles expand-all through the results header", async () => {
    const wrapper = mountComponent();
    await flushPromises();

    const expandButton = wrapper
      .findAll("button")
      .find((button) => button.text().includes("Expand all"));
    await expandButton?.trigger("click");
    expect(expandAllSections).toHaveBeenCalledTimes(1);

    allSectionsExpanded.value = true;
    const nextWrapper = mountComponent();
    await flushPromises();

    const collapseButton = nextWrapper
      .findAll("button")
      .find((button) => button.text().includes("Collapse all"));
    await collapseButton?.trigger("click");

    expect(collapseAllSections).toHaveBeenCalledTimes(1);
  });
});
