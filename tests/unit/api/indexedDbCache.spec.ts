import { describe, it, expect, vi, afterEach } from "vitest";

const createRequest = () => ({
  result: undefined as unknown,
  error: null as unknown,
  onsuccess: null as ((event?: Event) => void) | null,
  onerror: null as ((event?: Event) => void) | null,
  onupgradeneeded: null as ((event: Event) => void) | null,
});

class FakeObjectStore {
  private store: Map<string, unknown>;

  constructor(store: Map<string, unknown>) {
    this.store = store;
  }

  get(key: string) {
    const request = createRequest();
    queueMicrotask(() => {
      request.result = this.store.get(key);
      request.onsuccess?.({ target: request } as unknown as Event);
    });
    return request;
  }

  put(value: { id: string }) {
    const request = createRequest();
    queueMicrotask(() => {
      this.store.set(value.id, value);
      request.onsuccess?.({ target: request } as unknown as Event);
    });
    return request;
  }

  clear() {
    const request = createRequest();
    queueMicrotask(() => {
      this.store.clear();
      request.onsuccess?.({ target: request } as unknown as Event);
    });
    return request;
  }

  openCursor() {
    const request = createRequest();
    const entries = Array.from(this.store.entries());
    let index = 0;

    const trigger = () => {
      if (index >= entries.length) {
        request.result = null;
        request.onsuccess?.({ target: request } as unknown as Event);
        return;
      }

      const [key, value] = entries[index];
      const cursor = {
        value,
        delete: () => {
          this.store.delete(key);
        },
        continue: () => {
          index += 1;
          trigger();
        },
      };

      request.result = cursor;
      request.onsuccess?.({ target: request } as unknown as Event);
    };

    queueMicrotask(trigger);
    return request;
  }
}

class FakeIDBDatabase {
  name: string;
  version: number;
  private stores = new Map<string, Map<string, unknown>>();

  constructor(name: string, version: number) {
    this.name = name;
    this.version = version;
  }

  createObjectStore(name: string) {
    if (!this.stores.has(name)) {
      this.stores.set(name, new Map());
    }
    return new FakeObjectStore(this.stores.get(name)!);
  }

  transaction(name: string) {
    if (!this.stores.has(name)) {
      this.stores.set(name, new Map());
    }
    return {
      objectStore: (storeName: string) => {
        if (!this.stores.has(storeName)) {
          this.stores.set(storeName, new Map());
        }
        return new FakeObjectStore(this.stores.get(storeName)!);
      },
    };
  }
}

const createFakeIndexedDB = () => {
  const databases = new Map<string, FakeIDBDatabase>();

  return {
    open: (name: string, version: number) => {
      const request = createRequest();
      queueMicrotask(() => {
        const existing = databases.get(name);
        const oldVersion = existing?.version ?? 0;
        const db = existing ?? new FakeIDBDatabase(name, version);
        if (!existing) {
          databases.set(name, db);
        }
        db.version = Math.max(db.version, version);
        request.result = db;
        if (request.onupgradeneeded && oldVersion < version) {
          request.onupgradeneeded({
            target: request,
            oldVersion,
          } as unknown as Event);
        }
        request.onsuccess?.({ target: request } as unknown as Event);
      });
      return request;
    },
  };
};

const installIndexedDb = () => {
  const fakeIndexedDb = createFakeIndexedDB();
  vi.stubGlobal("indexedDB", fakeIndexedDb);
  return fakeIndexedDb;
};

const TTL = 1000 * 60 * 60 * 24 * 7;

const makeCard = (name: string) => ({
  id: name.toLowerCase().replace(/\s/g, "-"),
  name,
});

describe("cardCache", () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it("returns null when IndexedDB is unavailable", async () => {
    vi.unstubAllGlobals();
    const { cardCache } = await import("../../../src/api/indexedDbCache");
    const result = await cardCache.getCachedCard("sol-ring");
    expect(result).toBeNull();
  });

  it("stores and retrieves cached cards", async () => {
    installIndexedDb();
    const { cardCache } = await import("../../../src/api/indexedDbCache");

    await cardCache.setCachedCard("sol-ring", makeCard("Sol Ring") as never);
    const result = await cardCache.getCachedCard("sol-ring");

    expect(result?.name).toBe("Sol Ring");
  });

  it("expires old entries and keeps fresh ones", async () => {
    installIndexedDb();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2020-01-01T00:00:00Z"));

    const { cardCache } = await import("../../../src/api/indexedDbCache");
    await cardCache.setCachedCard("old-card", makeCard("Old Card") as never);

    vi.setSystemTime(new Date("2020-01-01T00:00:00Z").getTime() + TTL + 1000);
    await cardCache.setCachedCard("new-card", makeCard("New Card") as never);

    await cardCache.clearExpired();

    const oldResult = await cardCache.getCachedCard("old-card");
    const newResult = await cardCache.getCachedCard("new-card");

    expect(oldResult).toBeNull();
    expect(newResult?.name).toBe("New Card");
  });

  it("clears all cached entries", async () => {
    installIndexedDb();
    const { cardCache } = await import("../../../src/api/indexedDbCache");

    await cardCache.setCachedCard("sol-ring", makeCard("Sol Ring") as never);
    await cardCache.clearAll();

    const result = await cardCache.getCachedCard("sol-ring");
    expect(result).toBeNull();
  });
});
