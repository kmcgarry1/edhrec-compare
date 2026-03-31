import { beforeEach, describe, expect, it, vi } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";
import { ref } from "vue";
import Dashboard from "../../../src/components/Dashboard.vue";

const hasCommander = ref(false);
const hasCsvData = ref(false);
const csvCount = ref(0);
const utilityTrayOpen = ref(false);
const decklistExport = ref<{ text: string } | null>(null);
const decklistCopied = ref(false);
const mainContentRef = ref<HTMLElement | null>(null);

const openUploadModal = vi.fn();
const clearUploadedCollection = vi.fn();
const openUtilityTray = vi.fn();
const closeUtilityTray = vi.fn();
const handleSelectionChange = vi.fn();
const copyDecklistFromHeader = vi.fn();
const downloadDecklistFromHeader = vi.fn();
const toggleTheme = vi.fn();
const toggleBackground = vi.fn();
const setDensity = vi.fn();

vi.mock("../../../src/composables/useDashboardState", () => ({
  useDashboardState: () => ({
    decklistExport,
    decklistCopied,
    mainContentRef,
    utilityTrayOpen,
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
    openUploadModal,
    clearUploadedCollection,
    openUtilityTray,
    closeUtilityTray,
    handleSelectionChange,
    copyDecklistFromHeader,
    downloadDecklistFromHeader,
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
    utilityTrayOpen.value = false;
    decklistExport.value = null;
    decklistCopied.value = false;
    openUploadModal.mockClear();
    clearUploadedCollection.mockClear();
    openUtilityTray.mockClear();
    closeUtilityTray.mockClear();
    handleSelectionChange.mockClear();
    copyDecklistFromHeader.mockClear();
    downloadDecklistFromHeader.mockClear();
    toggleTheme.mockClear();
    toggleBackground.mockClear();
    setDensity.mockClear();
  });

  it("renders the selection stage when no commander is active", async () => {
    const wrapper = mountComponent();
    await flushPromises();

    expect(wrapper.find(".dashboard-selection-stage-stub").exists()).toBe(true);
  });

  it("keeps the selection stage visible when a CSV is loaded but no commander is selected", async () => {
    hasCsvData.value = true;
    csvCount.value = 42;

    const wrapper = mountComponent();
    await flushPromises();

    expect(wrapper.find(".dashboard-selection-stage-stub").exists()).toBe(true);
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

  it("keeps the landing shell active even if commander state flips true locally", async () => {
    hasCommander.value = true;
    const wrapper = mountComponent();
    await flushPromises();

    expect(wrapper.find(".dashboard-selection-stage-stub").exists()).toBe(true);
  });

  it("delegates utility tray close actions to dashboard state", async () => {
    const wrapper = mountComponent();
    await flushPromises();

    await wrapper.get(".tray-close-trigger").trigger("click");

    expect(closeUtilityTray).toHaveBeenCalledTimes(1);
  });

  it("delegates upload actions from the selection stage to dashboard state", async () => {
    const wrapper = mountComponent();
    await flushPromises();

    await wrapper.get(".selection-upload-trigger").trigger("click");

    expect(openUploadModal).toHaveBeenCalledTimes(1);
  });
});
