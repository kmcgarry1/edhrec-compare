/**
 * IndexedDB cache for Scryfall card data
 *
 * Provides persistent client-side caching of card data to reduce API calls
 * and improve performance. Cached data expires after 7 days.
 *
 * @module api/indexedDbCache
 *
 * @example
 * ```typescript
 * import { cardCache } from '@/api/indexedDbCache';
 *
 * // Cache initialization happens automatically
 * await cardCache.init();
 *
 * // Get cached card
 * const card = await cardCache.getCachedCard('sol-ring');
 *
 * // Cache a card
 * await cardCache.setCachedCard('sol-ring', cardData);
 * ```
 */

import type { ScryfallCard } from "./scryfallApi";

/**
 * Cached card entry with metadata
 */
interface CachedCard {
  id: string;
  data: ScryfallCard;
  timestamp: number;
  expiresAt: number;
}

/**
 * IndexedDB cache implementation for card data
 */
class CardCache {
  private db: IDBDatabase | null = null;
  private initPromise: Promise<IDBDatabase | null> | null = null;
  private readonly DB_NAME = "commander-scout-cache";
  private readonly CARD_STORE = "cards";
  private readonly SYMBOL_STORE = "symbols";
  private readonly TTL = 1000 * 60 * 60 * 24 * 7; // 7 days
  private readonly isSupported = typeof indexedDB !== "undefined";

  /**
   * Initialize the IndexedDB cache
   *
   * Opens the database connection. Safe to call multiple times.
   */
  async init(): Promise<void> {
    await this.getDb();
  }

  /**
   * Get or initialize the database connection
   *
   * @returns Database instance or null if IndexedDB is unavailable
   */
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

  /**
   * Open IndexedDB database connection
   *
   * Creates object stores if they don't exist. Handles version upgrades.
   *
   * @returns Database instance or null on error
   */
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

  /**
   * Retrieve a cached card by key
   *
   * Returns null if card is not found or has expired.
   *
   * @param cacheKey - Normalized card name (lowercase)
   * @returns Card data or null if not cached/expired
   *
   * @example
   * ```typescript
   * const card = await cardCache.getCachedCard('sol-ring');
   * if (card) {
   *   console.log('Cache hit:', card.name);
   * }
   * ```
   */
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

  /**
   * Store a card in the cache
   *
   * Sets expiration timestamp based on TTL (7 days).
   *
   * @param cacheKey - Normalized card name (lowercase)
   * @param data - Card data to cache
   *
   * @example
   * ```typescript
   * await cardCache.setCachedCard('lightning-bolt', cardData);
   * ```
   */
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

  /**
   * Remove expired entries from the cache
   *
   * Cleans up cards older than TTL to free storage space.
   */
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

/**
 * Singleton card cache instance
 *
 * Shared across the application for consistent caching.
 * Automatically initialized on module load.
 */
export const cardCache = new CardCache();

// Initialize the cache when the module is loaded
cardCache.init().catch(console.error);
