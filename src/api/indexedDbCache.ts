import type { ScryfallCard } from "./scryfallApi";

interface CachedCard {
  id: string;
  data: ScryfallCard;
  timestamp: number;
  expiresAt: number;
}

class CardCache {
  private db: IDBDatabase | null = null;
  private initPromise: Promise<IDBDatabase | null> | null = null;
  private readonly DB_NAME = "commander-scout-cache";
  private readonly CARD_STORE = "cards";
  private readonly SYMBOL_STORE = "symbols";
  private readonly TTL = 1000 * 60 * 60 * 24 * 7; // 7 days
  private readonly isSupported = typeof indexedDB !== "undefined";

  async init(): Promise<void> {
    await this.getDb();
  }

  private async getDb(): Promise<IDBDatabase | null> {
    if (!this.isSupported) {
      return null;
    }

    if (this.db) {
      return this.db;
    }

    if (!this.initPromise) {
      this.initPromise = this.openDatabase();
    }

    this.db = await this.initPromise;
    return this.db;
  }

  private async openDatabase(): Promise<IDBDatabase | null> {
    return new Promise<IDBDatabase | null>((resolve, reject) => {
      const indexedDbFactory = globalThis.indexedDB;
      if (!indexedDbFactory) {
        console.warn("IndexedDB unavailable, card caching disabled.");
        resolve(null);
        return;
      }

      const request = indexedDbFactory.open(this.DB_NAME, 2);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        if (event.oldVersion < 1) {
          db.createObjectStore(this.CARD_STORE, { keyPath: "id" });
        }
        if (event.oldVersion < 2) {
          db.createObjectStore(this.SYMBOL_STORE, { keyPath: "id" });
        }
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(request.error);
      };
    }).catch((error) => {
      console.warn("Failed to initialize IndexedDB cache.", error);
      return null;
    });
  }

  async getCachedCard(cacheKey: string): Promise<ScryfallCard | null> {
    const db = await this.getDb();
    if (!db) {
      return null;
    }

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.CARD_STORE, "readonly");
      const store = transaction.objectStore(this.CARD_STORE);
      const request = store.get(cacheKey);

      request.onsuccess = () => {
        const result: CachedCard | undefined = request.result;
        if (result && result.expiresAt > Date.now()) {
          resolve(result.data);
        } else {
          resolve(null);
        }
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  async setCachedCard(cacheKey: string, data: ScryfallCard): Promise<void> {
    const db = await this.getDb();
    if (!db) {
      return;
    }

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.CARD_STORE, "readwrite");
      const store = transaction.objectStore(this.CARD_STORE);
      const now = Date.now();
      const cachedCard: CachedCard = {
        id: cacheKey,
        data,
        timestamp: now,
        expiresAt: now + this.TTL,
      };
      const request = store.put(cachedCard);

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  async clearExpired(): Promise<void> {
    const db = await this.getDb();
    if (!db) {
      return;
    }

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.CARD_STORE, "readwrite");
      const store = transaction.objectStore(this.CARD_STORE);
      const request = store.openCursor();

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          const record: CachedCard = cursor.value;
          if (record.expiresAt <= Date.now()) {
            cursor.delete();
          }
          cursor.continue();
        } else {
          resolve();
        }
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  async clearAll(): Promise<void> {
    const db = await this.getDb();
    if (!db) {
      return;
    }

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.CARD_STORE, "readwrite");
      const store = transaction.objectStore(this.CARD_STORE);
      const request = store.clear();

      request.onsuccess = () => {
        resolve();
      };
      request.onerror = () => {
        reject(request.error);
      };
    });
  }
}

// Create and export a singleton instance
export const cardCache = new CardCache();

// Initialize the cache when the module is loaded
cardCache.init().catch(console.error);
