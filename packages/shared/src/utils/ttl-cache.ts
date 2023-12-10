/**
 * A cache that expires entries after a given time-to-live (TTL). It uses a
 * `Map` in memory to store the entries.
 */
export class TtlCache<Key, Value> {
  data = new Map<Key, Value>();
  expiration = new Map<Key, number>();

  /**
   * @param ttl The default TTL for entries in milliseconds. Defaults to
   * `Number.POSITIVE_INFINITY`.
   */
  constructor(public readonly ttl = Number.POSITIVE_INFINITY) {}

  /**
   * Sets a value in the cache.
   * @param key The key to set.
   * @param value The value to set.
   * @param ttl The TTL for the entry in milliseconds. Defaults to the default
   * TTL.
   * @throws If the value is `undefined`.
   */
  set(key: Key, value: Value, ttl = this.ttl) {
    if (value === undefined) {
      throw new TypeError('Value cannot be undefined');
    }

    this.expiration.set(key, Date.now() + ttl);
    this.data.set(key, value);
  }

  /**
   * Gets a value from the cache.
   * @param key The key to get.
   * @returns The value or `undefined` if the entry has expired or does not
   * exist.
   */
  get(key: Key): Value | undefined {
    this.#purge(key);

    return this.data.get(key);
  }

  /**
   * Checks if a key exists in the cache.
   * @param key The key to check.
   * @returns `true` if the key exists and has not expired, `false` otherwise.
   */
  has(key: Key) {
    this.#purge(key);

    return this.data.has(key);
  }

  /**
   * Deletes a key and its value from the cache. If the key does not exist, this
   * method does nothing.
   * @param key The key to delete.
   * @returns `true` if the key existed and was deleted, `false` otherwise.
   */
  delete(key: Key) {
    this.expiration.delete(key);

    return this.data.delete(key);
  }

  /**
   * Clears the cache. All entries will be deleted.
   */
  clear() {
    this.expiration.clear();
    this.data.clear();
  }

  #purge(key: Key) {
    const expiration = this.expiration.get(key);

    if (expiration !== undefined && expiration < Date.now()) {
      this.delete(key);
    }
  }
}
