import { describe, it, expect, vi } from "vitest";
import { mount, type VueWrapper } from "@vue/test-utils";
import { h, nextTick } from "vue";
import CardTable from "../../../src/components/CardTable.vue";

const columns = [
  { key: "name", label: "Name" },
  { key: "type", label: "Type" },
];

const rows = [
  { id: 1, name: "Sol Ring", type: "Artifact" },
  { id: 2, name: "Cultivate", type: "Sorcery" },
];

describe("CardTable", () => {
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
});
