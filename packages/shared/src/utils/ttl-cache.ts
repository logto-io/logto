export class TtlCache<Key, Value> {
  data = new Map<Key, Value>();
  expiration = new Map<Key, number>();

  constructor(public readonly ttl = Number.POSITIVE_INFINITY) {}

  set(key: Key, value: Value, ttl = this.ttl) {
    if (value === undefined) {
      throw new TypeError('Value cannot be undefined');
    }

    this.expiration.set(key, Date.now() + ttl);
    this.data.set(key, value);
  }

  get(key: Key): Value | undefined {
    this.#purge(key);

    return this.data.get(key);
  }

  has(key: Key) {
    this.#purge(key);

    return this.data.has(key);
  }

  delete(key: Key) {
    this.expiration.delete(key);

    return this.data.delete(key);
  }

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
