import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import { ref } from "vue";
import Dashboard from "../../../src/components/Dashboard.vue";

const toggleTheme = vi.hoisted(() => vi.fn());
const toggleBackground = vi.hoisted(() => vi.fn());
const setOwnedFilter = vi.hoisted(() => vi.fn());
const setDensity = vi.hoisted(() => vi.fn());

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

const downloadTextFile = vi.hoisted(() => vi.fn());

vi.mock("../../../src/utils/downloadTextFile", () => ({
  downloadTextFile,
}));

const mountComponent = () =>
  mount(Dashboard, {
    global: {
      stubs: {
        AccessibilityControls: { template: "<div class='a11y-controls-stub'></div>" },
        Card: { template: "<section><slot /></section>" },
        EdhrecReader: {
          template:
            "<div class='reader-stub' @decklistUpdate=\"$emit('decklistUpdate', $event)\"></div>",
        },
        GlobalLoadingBanner: { template: "<div class='banner-stub'></div>" },
        SiteNotice: { template: "<footer class='notice-stub'></footer>" },
        DecklistExport: { template: "<div class='decklist-stub'></div>" },
        OnboardingModal: {
          template:
            "<div v-if='open' class='onboarding-stub'>Upload your collection or scout first <button @click=\"$emit('dismiss')\">Dismiss</button><button @click=\"$emit('upload')\">Upload</button></div>",
          props: ["open"],
        },
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
  });

  it("shows onboarding prompt until dismissed or data uploaded", async () => {
    const wrapper = mountComponent();
    // Wait for async component to load
    await flushPromises();
    await wrapper.vm.$nextTick();
    
    // Check if onboarding modal stub exists
    const modalStub = wrapper.find('.onboarding-stub');
    expect(modalStub.exists()).toBe(true);
    expect(modalStub.text()).toContain("Upload your collection or scout first");

    // Dismiss the onboarding
    await modalStub.find('button').trigger('click');
    await wrapper.vm.$nextTick();
    
    // After dismissal, modal should not exist
    expect(wrapper.find('.onboarding-stub').exists()).toBe(false);
  });

  it("downloads decklist when export is available", async () => {
    const wrapper = mountComponent();
    const payload = {
      text: "1 Sol Ring",
      filterLabel: "Owned cards",
      sections: [],
    };
    (wrapper.vm as { handleDecklistUpdate: (payload: typeof payload) => void }).handleDecklistUpdate(
      payload
    );
    (
      wrapper.vm as {
        downloadDecklistFromHeader: () => void;
      }
    ).downloadDecklistFromHeader();
    expect(downloadTextFile).toHaveBeenCalledWith("1 Sol Ring", "commander-scout-owned-cards.txt");
  });
});
