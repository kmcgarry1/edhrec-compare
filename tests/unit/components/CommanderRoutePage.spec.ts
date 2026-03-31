import { beforeEach, describe, expect, it, vi } from "vitest";
import { defineComponent, h, ref } from "vue";
import { flushPromises, mount } from "@vue/test-utils";
import CommanderRoutePage from "../../../src/components/CommanderRoutePage.vue";

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
const openControlPanel = vi.fn();
const closeControlPanel = vi.fn();
const openUtilityTray = vi.fn();
const closeUtilityTray = vi.fn();
const openUploadModal = vi.fn();
const clearUploadedCollection = vi.fn();
const handleDecklistUpdate = vi.fn();
const handleSelectionChange = vi.fn();
const copyDecklistFromHeader = vi.fn();
const downloadDecklistFromHeader = vi.fn();
const showNextCommanderPrinting = vi.fn();
const showPreviousCommanderPrinting = vi.fn();
const setOwnedFilter = vi.fn();
const toggleTheme = vi.fn();
const toggleBackground = vi.fn();
const setDensity = vi.fn();
const browseRailFocusPrimarySearch = vi.fn();

const chosenPageType = ref("commander");
const chosenBracket = ref("all");
const chosenModifier = ref("budget");
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
    tone: "accent",
    summary: "Fresh release options.",
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

vi.mock("../../../src/composables/useEdhrecRouteState", () => ({
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

vi.mock("../../../src/composables/useDashboardState", () => ({
  useDashboardState: () => ({
    decklistExport: ref({ text: "1 Sol Ring" }),
    decklistCopied: ref(false),
    mainContentRef: ref<HTMLElement | null>(null),
    controlPanelOpen: ref(false),
    utilityTrayOpen: ref(false),
    commanderSelection: ref({
      primary: "Atraxa, Grand Unifier",
      partner: "",
      hasPartner: false,
    }),
    commanderProfiles: ref([]),
    commanderColorIdentity: ref(["W", "U", "B", "G"]),
    commanderSpotlightLoading: ref(false),
    commanderSpotlightBackdropUrl: ref("https://example.com/atraxa-art.jpg"),
    canonicalEdhrecHref: ref("https://edhrec.com/commanders/atraxa-grand-unifier"),
    hasCsvData: ref(true),
    inventorySummary: ref("42 cards loaded. Deck view now reflects your collection."),
    theme: ref("dark"),
    toggleTheme,
    backgroundEnabled: ref(true),
    toggleBackground,
    density: ref("comfortable"),
    setDensity,
    densityOptions: ref([
      { value: "comfortable", label: "Comfortable" },
      { value: "cozy", label: "Cozy" },
    ]),
    collectionModeLabel: ref("Commander compare"),
    collectionModeHint: ref("Collection ready for compare."),
    collectionSourceName: ref("collection.csv"),
    collectionImportedAt: ref(new Date("2026-03-25T12:00:00Z")),
    nextStepLabel: ref("Decklist ready to export."),
    exportHelperText: ref("Copy or download the filtered decklist."),
    filterOptions: ref([
      { label: "Owned", value: true, active: true },
      { label: "Missing", value: false, active: false },
      { label: "All cards", value: null, active: false },
    ]),
    openUploadModal,
    clearUploadedCollection,
    openControlPanel,
    closeControlPanel,
    openUtilityTray,
    closeUtilityTray,
    handleDecklistUpdate,
    handleSelectionChange,
    copyDecklistFromHeader,
    downloadDecklistFromHeader,
    showNextCommanderPrinting,
    showPreviousCommanderPrinting,
    setOwnedFilter,
  }),
}));

vi.mock("../../../src/composables/useEdhrecData", () => ({
  useEdhrecData: () => ({
    cardlists,
    error,
    readerLoading,
  }),
}));

vi.mock("../../../src/composables/useEdhrecCardlists", () => ({
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

vi.mock("../../../src/composables/useScryfallCardData", () => ({
  useScryfallCardData: () => ({
    bulkCardsLoading,
    getTableRows,
  }),
}));

const DashboardBrowseRailStub = defineComponent({
  name: "DashboardBrowseRail",
  props: ["showSectionNavigation"],
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
  setup(props, { emit, expose }) {
    expose({
      focusPrimarySearch: browseRailFocusPrimarySearch,
    });

    return () =>
      h("aside", { class: "browse-rail-stub", "data-show-sections": String(props.showSectionNavigation) }, [
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
  mount(CommanderRoutePage, {
    global: {
      stubs: {
        DashboardBrowseRail: DashboardBrowseRailStub,
        CommanderRouteMasthead: {
          template:
            "<header class='masthead-stub'><button class='masthead-open' @click=\"$emit('open-controls')\">Open</button><button class='masthead-utilities' @click=\"$emit('open-utilities')\">Utilities</button><button class='masthead-change' @click=\"$emit('change-commander')\">Change</button><button class='masthead-prev' @click=\"$emit('previous-printing', 0)\">Prev</button><button class='masthead-next' @click=\"$emit('next-printing', 0)\">Next</button></header>",
        },
        CommanderResultsCommandBar: {
          template:
            "<div class='results-command-bar-stub'><button class='results-nav' @click=\"$emit('navigate', 'new-cards')\">Jump</button><button class='results-expand' @click=\"$emit('toggle-expand-all')\">Toggle Expand</button></div>",
        },
        CommanderCardlistSection: {
          template:
            "<article class='cardlist-section-stub'><button class='section-toggle' @click=\"$emit('toggle')\">Toggle</button><button class='section-copy' @click=\"$emit('copy')\">Copy</button><button class='section-download' @click=\"$emit('download')\">Download</button></article>",
        },
        DashboardUtilityTray: {
          template:
            "<aside class='dashboard-utility-tray-stub'><button class='tray-close-trigger' @click=\"$emit('close')\">Close Tray</button><slot /></aside>",
        },
        DashboardUtilityContent: {
          template:
            "<div class='dashboard-utility-content-stub'><button class='utility-upload' @click=\"$emit('open-upload')\">Upload</button><button class='utility-copy' @click=\"$emit('copy-decklist')\">Copy decklist</button></div>",
        },
        GlobalLoadingBanner: { template: "<div class='banner-stub'><slot /></div>" },
      },
    },
  });

describe("CommanderRoutePage", () => {
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
    openControlPanel.mockClear();
    closeControlPanel.mockClear();
    openUtilityTray.mockClear();
    closeUtilityTray.mockClear();
    openUploadModal.mockClear();
    clearUploadedCollection.mockClear();
    handleDecklistUpdate.mockClear();
    handleSelectionChange.mockClear();
    copyDecklistFromHeader.mockClear();
    downloadDecklistFromHeader.mockClear();
    showNextCommanderPrinting.mockClear();
    showPreviousCommanderPrinting.mockClear();
    setOwnedFilter.mockClear();
    browseRailFocusPrimarySearch.mockClear();
    error.value = "";
    readerLoading.value = false;
    allSectionsExpanded.value = false;
  });

  it("renders the dedicated commander page shell and hides section navigation in the browse rail", async () => {
    const wrapper = mountComponent();
    await flushPromises();

    expect(wrapper.find(".masthead-stub").exists()).toBe(true);
    expect(wrapper.find(".results-command-bar-stub").exists()).toBe(true);
    expect(wrapper.find(".dashboard-utility-tray-stub").exists()).toBe(true);
    expect(wrapper.get(".browse-rail-stub").attributes("data-show-sections")).toBe("false");
    expect(handleDecklistUpdate).toHaveBeenCalledWith(decklistPayload.value);
  });

  it("delegates commander route actions to the shared state and cardlist composables", async () => {
    const wrapper = mountComponent();
    await flushPromises();

    await wrapper.get(".masthead-open").trigger("click");
    await wrapper.get(".masthead-utilities").trigger("click");
    await wrapper.get(".masthead-change").trigger("click");
    await wrapper.get(".masthead-prev").trigger("click");
    await wrapper.get(".masthead-next").trigger("click");
    await wrapper.get(".browse-rail-close").trigger("click");
    await wrapper.get(".browse-rail-filter").trigger("click");
    await wrapper.get(".browse-rail-nav").trigger("click");
    await wrapper.get(".browse-rail-selection").trigger("click");
    await wrapper.get(".browse-rail-commander").trigger("click");
    await wrapper.get(".results-nav").trigger("click");
    await wrapper.get(".results-expand").trigger("click");
    await wrapper.get(".section-toggle").trigger("click");
    await wrapper.get(".section-copy").trigger("click");
    await wrapper.get(".section-download").trigger("click");
    await wrapper.get(".tray-close-trigger").trigger("click");
    await wrapper.get(".utility-upload").trigger("click");
    await wrapper.get(".utility-copy").trigger("click");

    expect(openControlPanel).toHaveBeenCalledTimes(1);
    expect(openUtilityTray).toHaveBeenCalledTimes(1);
    expect(browseRailFocusPrimarySearch).toHaveBeenCalledTimes(1);
    expect(showPreviousCommanderPrinting).toHaveBeenCalledWith(0);
    expect(showNextCommanderPrinting).toHaveBeenCalledWith(0);
    expect(closeControlPanel).toHaveBeenCalledTimes(1);
    expect(setOwnedFilter).toHaveBeenCalledWith(true);
    expect(handleSelectionChange).toHaveBeenCalledWith({
      primary: "Atraxa, Grand Unifier",
      partner: "",
      hasPartner: false,
    });
    expect(setCommanderSlug).toHaveBeenCalledWith("edgar-markov");
    expect(scrollToSection).toHaveBeenCalledWith("new-cards");
    expect(expandAllSections).toHaveBeenCalledTimes(1);
    expect(toggleSection).toHaveBeenCalledWith("new-cards");
    expect(handleCopyDecklist).toHaveBeenCalledWith(cardlists.value[0], 0);
    expect(handleDownloadDecklist).toHaveBeenCalledWith(cardlists.value[0], 0);
    expect(closeUtilityTray).toHaveBeenCalledTimes(1);
    expect(openUploadModal).toHaveBeenCalledTimes(1);
    expect(copyDecklistFromHeader).toHaveBeenCalledTimes(1);
  });

  it("collapses all sections when the command bar toggles from an expanded state", async () => {
    allSectionsExpanded.value = true;
    const wrapper = mountComponent();
    await flushPromises();

    await wrapper.get(".results-expand").trigger("click");

    expect(collapseAllSections).toHaveBeenCalledTimes(1);
  });
});
