import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { mount, type VueWrapper } from "@vue/test-utils";
import { h, nextTick } from "vue";
import CardTable from "../../../src/components/CardTable.vue";

// Mock IntersectionObserver for all tests
class MockIntersectionObserver {
  callback?: IntersectionObserverCallback;
  observe = vi.fn();
  disconnect = vi.fn();
  unobserve = vi.fn();
  takeRecords = vi.fn();
  root = null;
  rootMargin = "";
  thresholds = [];

  constructor(callback?: IntersectionObserverCallback) {
    this.callback = callback;
  }
}

const columns = [
  { key: "name", label: "Name" },
  { key: "type", label: "Type" },
];

const rows = [
  { id: 1, name: "Sol Ring", type: "Artifact" },
  { id: 2, name: "Cultivate", type: "Sorcery" },
];

describe("CardTable", () => {
  let originalIntersectionObserver: typeof IntersectionObserver;

  beforeEach(() => {
    // Save original and set global mock
    originalIntersectionObserver = global.IntersectionObserver;
    global.IntersectionObserver = MockIntersectionObserver as unknown as typeof IntersectionObserver;
  });

  afterEach(() => {
    // Restore original
    global.IntersectionObserver = originalIntersectionObserver;
  });

  const mountComponent = (slot?: VueWrapper["vm"]) =>
    mount(CardTable, {
      props: {
        columns,
        rows,
        rowKey: "id",
      },
      slots: slot
        ? {
            default: slot,
          }
        : undefined,
    });

  it("renders table headers and rows", () => {
    const wrapper = mountComponent();
    const headerCells = wrapper.findAll("thead th");
    expect(headerCells).toHaveLength(columns.length);
    expect(headerCells[0]?.text()).toBe("Name");
    expect(wrapper.findAll("tbody tr")).toHaveLength(rows.length);
    expect(wrapper.find("tbody tr").text()).toContain("Sol Ring");
  });

  it("uses slot content when provided", () => {
    const wrapper = mount(CardTable, {
      props: {
        columns,
        rows,
        rowKey: "id",
      },
      slots: {
        default: ({ row, index }: { row: typeof rows[number]; index: number }) =>
          h(
            "tr",
            { class: "custom-row", "data-index": index },
            [h("td", { class: "custom-cell" }, row.name)]
          ),
      },
    });

    const customRows = wrapper.findAll(".custom-row");
    expect(customRows).toHaveLength(rows.length);
    expect(customRows[0]?.text()).toContain("Sol Ring");
  });

  it("invokes function rowKey prop for each row", () => {
    const rowKeyFn = vi.fn((row: Record<string, unknown>, index: number) => {
      return `${row.id}-${index}`;
    });
    mount(CardTable, {
      props: {
        columns,
        rows,
        rowKey: rowKeyFn,
      },
    });

    expect(rowKeyFn).toHaveBeenCalledTimes(rows.length);
  });

  it("virtualizes rows when enabled for large datasets", async () => {
    const largeRows = Array.from({ length: 200 }, (_, index) => ({
      id: index,
      name: `Card ${index}`,
      type: "Artifact",
    }));

    const wrapper = mount(CardTable, {
      props: {
        columns,
        rows: largeRows,
        rowKey: "id",
        virtual: true,
        virtualItemSize: 40,
        virtualMaxHeight: 200,
        virtualOverscan: 0,
      },
    });

    await nextTick();

    const renderedRows = wrapper
      .findAll("tbody tr")
      .filter((row) => row.attributes("aria-hidden") !== "true");

    expect(renderedRows.length).toBeLessThan(largeRows.length);
    expect(wrapper.find(".overflow-y-auto").exists()).toBe(true);
  });

  it("does not enable virtualization for small datasets", () => {
    const wrapper = mount(CardTable, {
      props: {
        columns,
        rows,
      },
    });

    expect(wrapper.find(".overflow-y-auto").exists()).toBe(false);
  });

  it("shows and hides scroll shadows based on scroll position", async () => {
    const wrapper = mount(CardTable, {
      props: {
        columns,
        rows: Array.from({ length: 20 }, (_, index) => ({
          id: index,
          name: `Card ${index}`,
          type: "Creature",
        })),
        rowKey: "id",
        virtual: true,
        virtualMaxHeight: 200,
      },
    });

    const scrollParent = wrapper.get(".overflow-x-auto").element as HTMLElement;
    Object.defineProperty(scrollParent, "scrollHeight", { value: 200, configurable: true });
    Object.defineProperty(scrollParent, "clientHeight", { value: 100, configurable: true });
    Object.defineProperty(scrollParent, "scrollTop", { value: 0, writable: true, configurable: true });

    scrollParent.dispatchEvent(new Event("scroll"));
    await nextTick();

    expect(wrapper.find(".absolute.inset-x-0.top-0").exists()).toBe(false);
    expect(wrapper.find(".absolute.inset-x-0.bottom-0").exists()).toBe(true);

    scrollParent.scrollTop = 100;
    scrollParent.dispatchEvent(new Event("scroll"));
    await nextTick();

    expect(wrapper.find(".absolute.inset-x-0.top-0").exists()).toBe(true);
    expect(wrapper.find(".absolute.inset-x-0.bottom-0").exists()).toBe(false);
  });

  it("progressively renders rows with scrollMode='page'", async () => {
    const largeRows = Array.from({ length: 200 }, (_, index) => ({
      id: index,
      name: `Card ${index}`,
      type: "Artifact",
    }));

    const wrapper = mount(CardTable, {
      props: {
        columns,
        rows: largeRows,
        rowKey: "id",
        scrollMode: "page",
        virtualTriggerCount: 80,
      },
    });

    await nextTick();

    // Should only render an initial slice of rows
    const renderedRows = wrapper
      .findAll("tbody tr")
      .filter((row) => row.attributes("aria-hidden") !== "true");

    expect(renderedRows.length).toBeLessThan(largeRows.length);
    expect(renderedRows.length).toBeGreaterThan(0);

    // Should have a load-more sentinel row
    const sentinel = wrapper.findAll("tbody tr").find((row) => row.attributes("aria-hidden") === "true");
    expect(sentinel).toBeDefined();
  });

  it("increases rendered row count when sentinel is intersected with scrollMode='page'", async () => {
    const largeRows = Array.from({ length: 200 }, (_, index) => ({
      id: index,
      name: `Card ${index}`,
      type: "Artifact",
    }));

    // Track intersection callback and mock methods
    let intersectionCallback: IntersectionObserverCallback | undefined;
    const mockObserve = vi.fn();
    const mockDisconnect = vi.fn();
    const mockUnobserve = vi.fn();
    
    // Extend the base mock to capture the callback
    class CallbackCapturingMock extends MockIntersectionObserver {
      constructor(callback: IntersectionObserverCallback) {
        super(callback);
        intersectionCallback = callback;
      }
      observe = mockObserve;
      disconnect = mockDisconnect;
      unobserve = mockUnobserve;
    }
    
    global.IntersectionObserver = CallbackCapturingMock as unknown as typeof IntersectionObserver;

    const wrapper = mount(CardTable, {
      props: {
        columns,
        rows: largeRows,
        rowKey: "id",
        scrollMode: "page",
        virtualTriggerCount: 80,
      },
    });

    await nextTick();

    const initialRowCount = wrapper
      .findAll("tbody tr")
      .filter((row) => row.attributes("aria-hidden") !== "true").length;

    expect(mockObserve).toHaveBeenCalled();
    expect(intersectionCallback).toBeDefined();

    // Simulate intersection
    if (intersectionCallback) {
      intersectionCallback(
        [{ isIntersecting: true } as IntersectionObserverEntry],
        {} as IntersectionObserver
      );
    }

    await nextTick();

    const updatedRowCount = wrapper
      .findAll("tbody tr")
      .filter((row) => row.attributes("aria-hidden") !== "true").length;

    expect(updatedRowCount).toBeGreaterThan(initialRowCount);
  });
});
