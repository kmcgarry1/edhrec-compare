import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import { ref } from "vue";
import Dashboard from "../../../src/components/Dashboard.vue";

const toggleTheme = vi.hoisted(() => vi.fn());
const toggleBackground = vi.hoisted(() => vi.fn());
const setOwnedFilter = vi.hoisted(() => vi.fn());

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

const downloadTextFile = vi.hoisted(() => vi.fn());

vi.mock("../../../src/utils/downloadTextFile", () => ({
  downloadTextFile,
}));

const mountComponent = () =>
  mount(Dashboard, {
    global: {
      stubs: {
        Card: { template: "<section><slot /></section>" },
        EdhrecReader: {
          template:
            "<div class='reader-stub' @decklistUpdate=\"$emit('decklistUpdate', $event)\"></div>",
        },
        CSVUpload: { template: "<div class='upload-stub'></div>" },
        GlobalLoadingBanner: { template: "<div class='banner-stub'></div>" },
        SiteNotice: { template: "<footer class='notice-stub'></footer>" },
      },
    },
  });

describe("Dashboard", () => {
  beforeEach(() => {
    toggleTheme.mockClear();
    toggleBackground.mockClear();
    setOwnedFilter.mockClear();
    downloadTextFile.mockClear();
    csvRows.value = [];
  });

  it("shows onboarding prompt until dismissed or data uploaded", async () => {
    const wrapper = mountComponent();
    expect(document.body.textContent ?? "").toContain(
      "Upload your collection or scout first"
    );

    await (wrapper.vm as { dismissOnboarding: () => Promise<void> }).dismissOnboarding();
    await wrapper.vm.$nextTick();
    expect(document.body.textContent ?? "").not.toContain(
      "Upload your collection or scout first"
    );
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
