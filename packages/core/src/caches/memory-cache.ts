import { CacheStore } from '#src/caches/types.js';
import { conditional, Optional } from '@silverhand/essentials';
import { consoleLog } from '#src/utils/console.js';

declare type CacheItem = {
  value: string;
  expire: number;
  timestamp: number;
};

export class MemoryCache implements CacheStore {
  cache: Map<string, CacheItem>;

  constructor() {
    this.cache = new Map();

    // Clean up expired cache every 10 seconds
    setInterval(() => {
      for (const [key, value] of this.cache.entries()) {
        const now = Date.now();
        if (value.timestamp + value.expire < now) {
          this.cache.delete(key);
        }
      }
    }, 1000 * 30);
  }

  async set(key: string, value: string, expire: number = 30 * 60) {
    this.cache.set(key, {
      value,
      expire,
      timestamp: Date.now(),
    });
  }

  async get(key: string): Promise<Optional<string>> {
    const item = this.cache.get(key);
    if (item) {
      // Expired cache is deleted
      if (item.timestamp + item.expire < Date.now()) {
        this.cache.delete(key);
        return undefined;
      }
      return conditional(item.value);
    }
    return undefined;
  }

  async delete(key: string) {
    this.cache.delete(key);
  }

  async connect() {
    consoleLog.warn(
      '[CACHE] The in-memory cache is being used, and in the case of clustering there are data response issues.'
    );
  }

  async disconnect() {
    this.cache.clear();
  }
}
