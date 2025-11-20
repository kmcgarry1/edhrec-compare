import { vi } from "vitest";

if (!globalThis.matchMedia) {
  Object.defineProperty(globalThis, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      onchange: null,
      dispatchEvent: vi.fn(),
    })),
  });
}

if (!globalThis.MutationObserver) {
  class MockMutationObserver {
    observe = vi.fn();
    disconnect = vi.fn();
    takeRecords = vi.fn();
  }
  Object.defineProperty(globalThis, "MutationObserver", {
    writable: true,
    value: MockMutationObserver,
  });
}
