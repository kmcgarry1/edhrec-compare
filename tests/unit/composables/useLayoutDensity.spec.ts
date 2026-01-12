import { describe, it, expect, beforeEach, vi } from "vitest";
import { nextTick } from "vue";

const STORAGE_KEY = "commander-scout:layout-density";

const loadComposable = async () => {
  const module = await import("../../../src/composables/useLayoutDensity");
  return module.useLayoutDensity();
};

describe("useLayoutDensity", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.resetModules();
  });

  it("reads initial density from storage", async () => {
    localStorage.setItem(STORAGE_KEY, "compact");
    const { density, spacing } = await loadComposable();

    expect(density.value).toBe("compact");
    expect(spacing.value.cardPadding).toBe("p-2.5 sm:p-3");
  });

  it("falls back to comfortable for invalid stored value", async () => {
    localStorage.setItem(STORAGE_KEY, "ultra");
    const { density } = await loadComposable();

    expect(density.value).toBe("comfortable");
  });

  it("persists density changes to localStorage", async () => {
    const { density, setDensity } = await loadComposable();

    expect(density.value).toBe("comfortable");
    setDensity("cozy");
    await nextTick();

    expect(localStorage.getItem(STORAGE_KEY)).toBe("cozy");
  });
});
