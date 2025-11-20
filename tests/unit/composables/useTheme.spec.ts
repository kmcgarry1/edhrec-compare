import { describe, it, expect, beforeEach, vi } from "vitest";

const matchMediaMock = (matches: boolean) => {
  const mql = {
    matches,
    media: "(prefers-color-scheme: dark)",
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    onchange: null,
    dispatchEvent: vi.fn(),
  } as MediaQueryList;
  vi.spyOn(window, "matchMedia").mockReturnValue(mql);
  return mql;
};

describe("useTheme", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.className = "";
    delete document.documentElement.dataset.theme;
    vi.resetModules();
    vi.restoreAllMocks();
  });

  it("initializes from stored value when present", async () => {
    localStorage.setItem("edhrec-color-scheme", "dark");
    matchMediaMock(false);
    const { useTheme } = await vi.importActual<typeof import("../../../src/composables/useTheme")>(
      "../../../src/composables/useTheme"
    );
    const { theme } = useTheme();
    expect(theme.value).toBe("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(document.documentElement.dataset.theme).toBe("dark");
  });

  it("uses system preference when storage empty", async () => {
    matchMediaMock(true);
    const { useTheme } = await vi.importActual<typeof import("../../../src/composables/useTheme")>(
      "../../../src/composables/useTheme"
    );
    const { theme } = useTheme();
    expect(theme.value).toBe("dark");
  });

  it("toggles and persists theme", async () => {
    matchMediaMock(false);
    const { useTheme } = await vi.importActual<typeof import("../../../src/composables/useTheme")>(
      "../../../src/composables/useTheme"
    );
    const { theme, toggleTheme } = useTheme();
    expect(theme.value).toBe("light");
    toggleTheme();
    expect(theme.value).toBe("dark");
    expect(localStorage.getItem("edhrec-color-scheme")).toBe("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  it("reacts to system preference changes when no stored override", async () => {
    const media = matchMediaMock(false);
    const addListenerSpy = vi.spyOn(media, "addEventListener");
    const { useTheme } = await vi.importActual<typeof import("../../../src/composables/useTheme")>(
      "../../../src/composables/useTheme"
    );
    const { theme } = useTheme();
    expect(addListenerSpy).toHaveBeenCalled();
    media.matches = true;
    addListenerSpy.mock.calls[0][1]({ matches: true } as MediaQueryListEvent);
    expect(theme.value).toBe("dark");
  });
});
