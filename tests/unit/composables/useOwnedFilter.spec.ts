import { describe, it, expect } from "vitest";
import { useOwnedFilter } from "../../../src/composables/useOwnedFilter";

describe("useOwnedFilter", () => {
  it("exposes a readonly reactive value", () => {
    const { showOwned } = useOwnedFilter();
    expect(showOwned.value).toBeNull();
  });

  it("updates the filter value", () => {
    const { showOwned, setOwnedFilter } = useOwnedFilter();
    setOwnedFilter(true);
    expect(showOwned.value).toBe(true);
    setOwnedFilter(false);
    expect(showOwned.value).toBe(false);
    setOwnedFilter(null);
    expect(showOwned.value).toBeNull();
  });

  it("shares state across multiple instances", () => {
    const first = useOwnedFilter();
    const second = useOwnedFilter();
    first.setOwnedFilter(true);
    expect(second.showOwned.value).toBe(true);
  });
});
