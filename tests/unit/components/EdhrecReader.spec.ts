import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import { ref } from "vue";
import EdhrecReader from "../../../src/components/EdhrecReader.vue";
import { requestCache } from "../../../src/api/requestCache";

const downloadTextFile = vi.hoisted(() => vi.fn());

vi.mock("../../../src/utils/downloadTextFile", () => ({
  downloadTextFile,
}));

const notifyError = vi.hoisted(() => vi.fn());

vi.mock("../../../src/composables/useGlobalNotices", () => ({
  useGlobalNotices: () => ({
    notifyError,
  }),
}));

vi.mock("../../../src/composables/useOwnedFilter", () => ({
  useOwnedFilter: () => ({
    showOwned: ref(null),
  }),
}));

const csvRows = ref<string[][]>([]);
const csvHeaders = ref<string[]>(["Name"]);

vi.mock("../../../src/composables/useCsvUpload", () => ({
  useCsvUpload: () => ({
    rows: csvRows,
    headers: csvHeaders,
  }),
}));

vi.mock("../../../src/composables/useGlobalLoading", () => ({
  useGlobalLoading: () => {
    const scopes: Record<string, ReturnType<typeof ref>> = {};
    const getScopeLoading = (scope: string) => {
      if (!scopes[scope]) {
        scopes[scope] = ref(false);
      }
      return scopes[scope];
    };
    return {
      withLoading: async (action: () => Promise<unknown>) => action(),
      getScopeLoading,
    };
  },
}));

vi.mock("../../../src/components/helpers/cardlistIconMap", () => ({
  getCardlistIcon: () => ({ path: "M0 0h24v24H0z", color: "#000" }),
}));

const getCardsByNames = vi.hoisted(() => vi.fn().mockResolvedValue([]));

vi.mock("../../../src/api/scryfallApi", () => ({
  getCardsByNames,
}));

type CommandSelectionHandler = {
  handleCommanderSelection: (slug: string) => Promise<void>;
  handleDownloadDecklist: (
    cardlist: { header: string; cardviews: { id: string; name: string }[] },
    index: number
  ) => Promise<void>;
};

const mountComponent = () =>
  mount<InstanceType<typeof EdhrecReader>>(EdhrecReader, {
    global: {
      stubs: {
        Card: { template: "<div class='card-stub'><slot /></div>" },
        CommanderSearch: { template: "<div class='search-stub'></div>" },
        GlobalLoadingBanner: { template: "<div class='banner-stub'></div>" },
        CardlistSection: { template: "<div class='cardlist-section-stub'></div>" },
        CommanderFilters: { template: "<div class='filters-stub'></div>" },
        FloatingCardlistNav: { template: "<nav class='nav-stub'></nav>" },
      },
    },
  });

const mockResponse = {
  container: {
    json_dict: {
      cardlists: [
        {
          header: "Top Cards",
          cardviews: [
            { id: "1", name: "Sol Ring" },
            { id: "2", name: "Cultivate" },
          ],
        },
      ],
    },
  },
};

type Cardlist = {
  header: string;
  cardviews: { id: string; name: string }[];
};

type EdhrecReaderVm = CommandSelectionHandler & {
  cardlists: Cardlist[];
};

describe("EdhrecReader", () => {
  beforeEach(() => {
    downloadTextFile.mockClear();
    notifyError.mockClear();
    getCardsByNames.mockClear();
    csvRows.value = [];
    csvHeaders.value = ["Name"];
    requestCache.clear(); // Clear request cache between tests
    (globalThis.fetch as unknown) = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    } as Response);
  });

  it("fetches EDHREC data when a commander is selected", async () => {
    const wrapper = mountComponent();
    const vm = wrapper.vm as EdhrecReaderVm;
    await vm.handleCommanderSelection("atraxa");
    await flushPromises();

    expect(globalThis.fetch).toHaveBeenCalledWith(
      "https://json.edhrec.com/pages/commanders/atraxa.json"
    );
    expect(vm.cardlists.length).toBe(1);
  });

  it("downloads decklist text for the first cardlist", async () => {
    const wrapper = mountComponent();
    const vm = wrapper.vm as EdhrecReaderVm;
    await vm.handleCommanderSelection("atraxa");
    await flushPromises();

    const [firstCardlist] = vm.cardlists;
    await vm.handleDownloadDecklist(firstCardlist, 0);
    expect(downloadTextFile).toHaveBeenCalled();
    expect(downloadTextFile.mock.calls[0][0]).toContain("1 Sol Ring");
  });
});
