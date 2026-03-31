import { beforeEach, describe, expect, it, vi } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";
import { ref } from "vue";
import Dashboard from "../../../src/components/Dashboard.vue";

const hasCommander = ref(false);
const hasCsvData = ref(false);
const csvCount = ref(0);
const controlPanelOpen = ref(false);
const utilityTrayOpen = ref(false);
const decklistExport = ref<{ text: string } | null>(null);
const decklistCopied = ref(false);
const mainContentRef = ref<HTMLElement | null>(null);
const commanderSelection = ref({
  primary: "",
  partner: "",
  hasPartner: false,
});

const openUploadModal = vi.fn();
const clearUploadedCollection = vi.fn();
const openControlPanel = vi.fn();
const closeControlPanel = vi.fn();
const openUtilityTray = vi.fn();
const closeUtilityTray = vi.fn();
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

vi.mock("../../../src/composables/useDashboardState", () => ({
  useDashboardState: () => ({
    decklistExport,
    decklistCopied,
    mainContentRef,
    controlPanelOpen,
    utilityTrayOpen,
    commanderSelection,
    commanderProfiles: ref([]),
    commanderSpotlightLoading: ref(false),
    commanderSpotlightBackdropUrl: ref(""),
    canonicalEdhrecHref: ref("https://edhrec.com/commanders/atraxa-grand-unifier"),
    hasCommander,
    hasCsvData,
    csvCount,
    inventorySummary: ref("Collection ready."),
    theme: ref("dark"),
    toggleTheme,
    backgroundEnabled: ref(true),
    toggleBackground,
    density: ref("comfortable"),
    setDensity,
    densityOptions: ref([
      { value: "comfortable", label: "Comfortable" },
      { value: "cozy", label: "Cozy" },
      { value: "compact", label: "Compact" },
    ]),
    collectionModeLabel: ref("Commander compare"),
    collectionModeHint: ref("Collection ready for compare."),
    collectionSourceName: ref("collection.csv"),
    collectionImportedAt: ref(new Date("2026-03-25T12:00:00Z")),
    nextStepLabel: ref("Decklist ready to export."),
    exportHelperText: ref("Copy or download the filtered decklist."),
    filterOptions: ref([
      { label: "Owned", value: true, active: false },
      { label: "Missing", value: false, active: false },
      { label: "All cards", value: null, active: true },
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

const mountComponent = () =>
  mount(Dashboard, {
    global: {
      stubs: {
        DashboardSelectionStage: {
          template:
            "<section class='dashboard-selection-stage-stub'><button class='selection-upload-trigger' @click=\"$emit('open-upload')\">Upload</button><button class='selection-utility-trigger' @click=\"$emit('open-utilities')\">Utilities</button><button class='selection-change-trigger' @click=\"$emit('selection-change', { primary: 'Atraxa, Grand Unifier', partner: '', hasPartner: false })\">Select</button></section>",
        },
        DashboardWorkspace: {
          template:
            "<section class='dashboard-workspace-stub'><button class='workspace-controls-trigger' @click=\"$emit('open-control-panel')\">Controls</button><button class='workspace-close-trigger' @click=\"$emit('close-control-panel')\">Close</button><button class='workspace-utility-trigger' @click=\"$emit('open-utilities')\">Utilities</button><button class='workspace-decklist-trigger' @click=\"$emit('decklistUpdate', { text: '1 Sol Ring' })\">Decklist</button></section>",
          props: [
            "controlPanelOpen",
            "commanderSelection",
            "commanderProfiles",
            "commanderSpotlightLoading",
            "commanderSpotlightBackdropUrl",
            "canonicalEdhrecHref",
            "nextStepLabel",
            "hasCsvData",
            "inventorySummary",
            "filterOptions",
          ],
        },
        DashboardUtilityTray: {
          template:
            "<aside class='dashboard-utility-tray-stub'><button class='tray-close-trigger' @click=\"$emit('close')\">Close Tray</button><slot /></aside>",
          props: ["open", "title", "description"],
        },
        DashboardUtilityContent: {
          template: "<div class='dashboard-utility-content-stub'></div>",
        },
        GlobalLoadingBanner: { template: "<div class='banner-stub'></div>" },
      },
    },
  });

describe("Dashboard", () => {
  beforeEach(() => {
    hasCommander.value = false;
    hasCsvData.value = false;
    csvCount.value = 0;
    controlPanelOpen.value = false;
    utilityTrayOpen.value = false;
    decklistExport.value = null;
    decklistCopied.value = false;
    commanderSelection.value = {
      primary: "",
      partner: "",
      hasPartner: false,
    };
    openUploadModal.mockClear();
    clearUploadedCollection.mockClear();
    openControlPanel.mockClear();
    closeControlPanel.mockClear();
    openUtilityTray.mockClear();
    closeUtilityTray.mockClear();
    handleDecklistUpdate.mockClear();
    handleSelectionChange.mockClear();
    copyDecklistFromHeader.mockClear();
    downloadDecklistFromHeader.mockClear();
    showNextCommanderPrinting.mockClear();
    showPreviousCommanderPrinting.mockClear();
    setOwnedFilter.mockClear();
    toggleTheme.mockClear();
    toggleBackground.mockClear();
    setDensity.mockClear();
  });

  it("renders the selection stage when no commander is active", async () => {
    const wrapper = mountComponent();
    await flushPromises();

    expect(wrapper.find(".dashboard-selection-stage-stub").exists()).toBe(true);
    expect(wrapper.find(".dashboard-workspace-stub").exists()).toBe(false);
  });

  it("keeps the selection stage visible when a CSV is loaded but no commander is selected", async () => {
    hasCsvData.value = true;
    csvCount.value = 42;

    const wrapper = mountComponent();
    await flushPromises();

    expect(wrapper.find(".dashboard-selection-stage-stub").exists()).toBe(true);
    expect(wrapper.find(".dashboard-workspace-stub").exists()).toBe(false);
  });

  it("delegates upload actions from the selection stage to dashboard state", async () => {
    const wrapper = mountComponent();
    await flushPromises();

    await wrapper.get(".selection-upload-trigger").trigger("click");

    expect(openUploadModal).toHaveBeenCalledTimes(1);
  });

  it("opens the shared utility tray from the selection stage", async () => {
    const wrapper = mountComponent();
    await flushPromises();

    await wrapper.get(".selection-utility-trigger").trigger("click");

    expect(openUtilityTray).toHaveBeenCalledTimes(1);
  });

  it("delegates selection changes from the onboarding stage to dashboard state", async () => {
    const wrapper = mountComponent();
    await flushPromises();

    await wrapper.get(".selection-change-trigger").trigger("click");

    expect(handleSelectionChange).toHaveBeenCalledWith({
      primary: "Atraxa, Grand Unifier",
      partner: "",
      hasPartner: false,
    });
  });

  it("renders the workspace when a commander is active", async () => {
    hasCommander.value = true;
    commanderSelection.value = {
      primary: "Atraxa, Grand Unifier",
      partner: "",
      hasPartner: false,
    };

    const wrapper = mountComponent();
    await flushPromises();

    expect(wrapper.find(".dashboard-selection-stage-stub").exists()).toBe(false);
    expect(wrapper.find(".dashboard-workspace-stub").exists()).toBe(true);
  });

  it("delegates workspace shell actions to dashboard state", async () => {
    hasCommander.value = true;
    const wrapper = mountComponent();
    await flushPromises();

    await wrapper.get(".workspace-controls-trigger").trigger("click");
    await wrapper.get(".workspace-close-trigger").trigger("click");
    await wrapper.get(".workspace-utility-trigger").trigger("click");
    await wrapper.get(".workspace-decklist-trigger").trigger("click");

    expect(openControlPanel).toHaveBeenCalledTimes(1);
    expect(closeControlPanel).toHaveBeenCalledTimes(1);
    expect(openUtilityTray).toHaveBeenCalledTimes(1);
    expect(handleDecklistUpdate).toHaveBeenCalledWith({ text: "1 Sol Ring" });
  });

  it("delegates utility tray close actions to dashboard state", async () => {
    const wrapper = mountComponent();
    await flushPromises();

    await wrapper.get(".tray-close-trigger").trigger("click");

    expect(closeUtilityTray).toHaveBeenCalledTimes(1);
  });
});
