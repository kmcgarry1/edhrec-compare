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

const createMemoryStorage = (): Storage => {
  const store = new Map<string, string>();
  return {
    get length() {
      return store.size;
    },
    clear: () => store.clear(),
    getItem: (key) => (store.has(key) ? store.get(key)! : null),
    key: (index) => Array.from(store.keys())[index] ?? null,
    removeItem: (key) => {
      store.delete(key);
    },
    setItem: (key, value) => {
      store.set(key, value);
    },
  };
};

const ensureLocalStorage = () => {
  const hasWorkingStorage = typeof globalThis.localStorage?.clear === "function";
  if (hasWorkingStorage) {
    return;
  }

  const storage =
    typeof window !== "undefined" && typeof window.localStorage?.clear === "function"
      ? window.localStorage
      : createMemoryStorage();

  Object.defineProperty(globalThis, "localStorage", {
    value: storage,
    writable: true,
    configurable: true,
  });

  if (typeof window !== "undefined") {
    Object.defineProperty(window, "localStorage", {
      value: storage,
      configurable: true,
    });
  }
};

ensureLocalStorage();

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
