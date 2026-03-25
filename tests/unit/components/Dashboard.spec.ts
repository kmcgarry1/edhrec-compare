import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import { ref } from "vue";
import Dashboard from "../../../src/components/Dashboard.vue";

const toggleTheme = vi.hoisted(() => vi.fn());
const toggleBackground = vi.hoisted(() => vi.fn());
const setOwnedFilter = vi.hoisted(() => vi.fn());
const setDensity = vi.hoisted(() => vi.fn());
const currentCommanderSlug = ref<string | null>(null);
const commanderUrl = ref<string | null>(null);

const density = ref("comfortable");
const densityOptions = [
  { value: "comfortable", label: "Comfortable" },
  { value: "cozy", label: "Cozy" },
  { value: "compact", label: "Compact" },
] as const;

vi.mock("../../../src/composables/useTheme", () => ({
  useTheme: () => ({
    theme: ref("light"),
    toggleTheme,
  }),
}));

vi.mock("../../../src/composables/useBackgroundPreference", () => ({
  useBackgroundPreference: () => ({
    backgroundEnabled: ref(true),
    toggleBackground,
  }),
}));

const csvRows = ref<string[][]>([]);

vi.mock("../../../src/composables/useCsvUpload", () => ({
  useCsvUpload: () => ({
    rows: csvRows,
  }),
}));

vi.mock("../../../src/composables/useOwnedFilter", () => ({
  useOwnedFilter: () => ({
    showOwned: ref(null),
    setOwnedFilter,
  }),
}));

vi.mock("../../../src/composables/useLayoutDensity", () => ({
  useLayoutDensity: () => ({
    density,
    setDensity,
    densityOptions,
  }),
}));

vi.mock("../../../src/composables/useEdhrecRouteState", () => ({
  useEdhrecRouteState: () => ({
    currentCommanderSlug,
    commanderUrl,
  }),
}));

const downloadTextFile = vi.hoisted(() => vi.fn());

vi.mock("../../../src/utils/downloadTextFile", () => ({
  downloadTextFile,
}));

const mountComponent = () =>
  mount(Dashboard, {
    global: {
      stubs: {
        DashboardCommanderMasthead: {
          template:
            "<header class='dashboard-masthead-stub'><button @click=\"$emit('browse')\">Browse</button><button @click=\"$emit('upload')\">Upload</button></header>",
        },
        DashboardSelectionStage: {
          template:
            "<section class='dashboard-selection-stage-stub'><button class='selection-upload-trigger' @click=\"$emit('open-upload')\">Upload</button></section>",
        },
        DashboardToolbar: {
          template: "<nav class='dashboard-toolbar-stub'></nav>",
        },
        DashboardWorkspace: {
          template: "<section class='dashboard-workspace-stub'></section>",
        },
        TopCommanderScanPanel: {
          template: "<section class='top-commander-scan-stub'></section>",
        },
        SiteNotice: {
          template: "<section class='site-notice-stub'></section>",
        },
        GlobalLoadingBanner: { template: "<div class='banner-stub'></div>" },
        CsvUploadModal: {
          template: "<div v-if='open' class='csv-modal-stub'></div>",
          props: ["open"],
        },
      },
    },
  });

describe("Dashboard", () => {
  beforeEach(() => {
    toggleTheme.mockClear();
    toggleBackground.mockClear();
    setOwnedFilter.mockClear();
    setDensity.mockClear();
    downloadTextFile.mockClear();
    csvRows.value = [];
    density.value = "comfortable";
    currentCommanderSlug.value = null;
    commanderUrl.value = null;
  });

  it("renders the selection stage immediately when no commander is selected", async () => {
    const wrapper = mountComponent();
    await flushPromises();
    await wrapper.vm.$nextTick();

    expect(wrapper.find(".dashboard-selection-stage-stub").exists()).toBe(true);
    expect(wrapper.find(".dashboard-toolbar-stub").exists()).toBe(false);
    expect(wrapper.find(".dashboard-workspace-stub").exists()).toBe(false);
  });

  it("opens the CSV modal from the landing selection stage", async () => {
    const wrapper = mountComponent();
    await flushPromises();
    await wrapper.vm.$nextTick();

    await wrapper.find(".selection-upload-trigger").trigger("click");
    await wrapper.vm.$nextTick();

    expect(wrapper.find(".csv-modal-stub").exists()).toBe(true);
  });

  it("downloads decklist when export is available", async () => {
    const wrapper = mountComponent();
    const payload = {
      text: "1 Sol Ring",
      filterLabel: "Owned cards",
      sections: [],
    };
    (
      wrapper.vm as { handleDecklistUpdate: (payload: typeof payload) => void }
    ).handleDecklistUpdate(payload);
    (
      wrapper.vm as {
        downloadDecklistFromHeader: () => void;
      }
    ).downloadDecklistFromHeader();
    expect(downloadTextFile).toHaveBeenCalledWith("1 Sol Ring", "commander-scout-owned-cards.txt");
  });

  it("renders the selection stage after a CSV is loaded but before commander selection", async () => {
    const wrapper = mountComponent();
    csvRows.value = [["Sol Ring"]];
    await flushPromises();
    await wrapper.vm.$nextTick();

    expect(wrapper.find(".dashboard-selection-stage-stub").exists()).toBe(true);
    expect(wrapper.find(".dashboard-toolbar-stub").exists()).toBe(false);
    expect(wrapper.find(".dashboard-workspace-stub").exists()).toBe(false);
  });

  it("renders the comparison workspace shell after commander selection", async () => {
    const wrapper = mountComponent();
    await flushPromises();

    (
      wrapper.vm as {
        handleSelectionChange: (payload: {
          primary: string;
          partner: string;
          hasPartner: boolean;
        }) => void;
      }
    ).handleSelectionChange({
      primary: "Atraxa, Grand Unifier",
      partner: "",
      hasPartner: false,
    });
    await wrapper.vm.$nextTick();

    expect(wrapper.find(".dashboard-toolbar-stub").exists()).toBe(true);
    expect(wrapper.find(".dashboard-workspace-stub").exists()).toBe(true);
    expect(wrapper.find(".top-commander-scan-stub").exists()).toBe(true);
    expect(wrapper.find(".site-notice-stub").exists()).toBe(true);
  });

  it("renders the comparison workspace shell from a commander route", async () => {
    currentCommanderSlug.value = "atraxa-grand-unifier";

    const wrapper = mountComponent();
    await flushPromises();
    await wrapper.vm.$nextTick();

    expect(wrapper.find(".dashboard-masthead-stub").exists()).toBe(true);
    expect(wrapper.find(".dashboard-toolbar-stub").exists()).toBe(true);
    expect(wrapper.find(".dashboard-workspace-stub").exists()).toBe(true);
  });
});
