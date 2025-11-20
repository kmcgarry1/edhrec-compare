/* eslint-disable vue/one-component-per-file */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import { ref, defineComponent, h } from "vue";
import EdhrecReader from "../../../src/components/EdhrecReader.vue";

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

const CardTableStub = defineComponent({
  name: "CardTableStub",
  props: {
    columns: {
      type: Array as () => Array<Record<string, unknown>>,
      default: () => [],
    },
    rows: {
      type: Array as () => Array<Record<string, unknown>>,
      default: () => [],
    },
    rowKey: {
      type: [String, Function] as () => string | ((row: unknown, index: number) => string),
      default: "id",
    },
  },
  setup(props, { slots }) {
    return () =>
      h(
        "div",
        { class: "table-stub" },
        props.rows.map((row, index) =>
          slots.default ? slots.default({ row, index }) : null
        )
      );
  },
});

const DropdownSelectStub = defineComponent({
  name: "DropdownSelectStub",
  props: {
    options: {
      type: Array as () => Array<Record<string, unknown>>,
      default: () => [],
    },
    modelValue: {
      type: [String, Number] as () => string | number | null,
      default: "",
    },
    placeholder: {
      type: String,
      default: "",
    },
  },
  emits: ["update:modelValue"],
  template: "<div class='dropdown-stub'><slot /></div>",
});

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
        CardTable: CardTableStub,
        CommanderSearch: {
          template: "<div class='search-stub'></div>",
        },
        GlobalLoadingBanner: { template: "<div class='banner-stub'></div>" },
        ScryfallCardRow: { template: "<div class='row-stub'></div>" },
        DropdownSelect: DropdownSelectStub,
        FloatingCardlistNav: {
          template: "<nav class='nav-stub'></nav>",
        },
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
    (globalThis.fetch as unknown) = vi
      .fn()
      .mockResolvedValue({
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
