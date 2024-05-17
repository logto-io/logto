import { type SignInExperience, SignInExperiences } from '@logto/schemas';
import { type Optional, trySafe } from '@silverhand/essentials';
import { type ZodType, z } from 'zod';

import { type ConnectorWellKnown, connectorWellKnownGuard } from '#src/utils/connectors/types.js';

import { type CacheStore } from './types.js';
import { cacheConsole } from './utils.js';

type WellKnownMap = {
  sie: SignInExperience;
  'connectors-well-known': ConnectorWellKnown[];
  'custom-phrases': Record<string, unknown>;
  'custom-phrases-tags': string[];
  'tenant-cache-expires-at': number;
};

type WellKnownCacheType = keyof WellKnownMap;

/**
 * The array tuple to determine how cache will be built.
 *
 * - If only `Type` is given, the cache key should be resolved as `${valueof Type}:#`.
 * - If both parameters are given, the cache key will be built dynamically by executing
 * the second element (which is a function) by passing current calling arguments:
 * `${valueof Type}:${valueof CacheKey(...args)}`.
 *
 * @template Args The function arguments for the cache key builder to resolve.
 * @template Type The {@link WellKnownCacheType cache type}.
 */
type CacheKeyConfig<
  Args extends unknown[],
  Type = WellKnownCacheType,
  CacheKey = (...args: Args) => string,
> = [Type] | [Type, CacheKey];

// Cannot use generic type here, but direct type works.
// See [this issue](https://github.com/microsoft/TypeScript/issues/27808#issuecomment-1207161877) for details.
// WARN: You should carefully check key and return type mapping since the implementation signature doesn't do this.
function getValueGuard<Type extends WellKnownCacheType>(type: Type): ZodType<WellKnownMap[Type]>;

function getValueGuard(type: WellKnownCacheType): ZodType<WellKnownMap[typeof type]> {
  switch (type) {
    case 'sie': {
      return SignInExperiences.guard;
    }
    case 'connectors-well-known': {
      return connectorWellKnownGuard.array();
    }
    case 'custom-phrases-tags': {
      return z.string().array();
    }
    case 'custom-phrases': {
      return z.record(z.unknown());
    }
    case 'tenant-cache-expires-at': {
      return z.number();
    }
  }
}

/**
 * A reusable cache for well-known data. The name "well-known" has no direct relation to the `.well-known` routes,
 * but indicates the data to store should be publicly viewable.
 *
 * **CAUTION** You should never store any data that is protected by any authentication method.
 *
 * For better code maintainability, we recommend to use the cache for database queries only unless you have a strong
 * reason.
 *
 * @see {@link getValueGuard} For how data will be guarded while getting from the cache.
 */
export class WellKnownCache {
  static defaultKey = '#';

  /**
   * @param tenantId The tenant ID this cache is intended for.
   * @param cacheStore The storage to use as the cache.
   */
  constructor(
    public tenantId: string,
    protected cacheStore: CacheStore
  ) {}

  /**
   * Get value from the inner cache store for the given type and key.
   * Note: Format errors will be silently caught and result an `undefined` return.
   */
  async get<Type extends WellKnownCacheType>(
    type: Type,
    key: string
  ): Promise<Optional<WellKnownMap[Type]>> {
    const data = await this.cacheStore.get(this.cacheKey(type, key));

    return trySafe(() => getValueGuard(type).parse(JSON.parse(data ?? '')));
  }

  /**
   * Set value to the inner cache store for the given type and key.
   * The given value will be stringify without format validation before storing into the cache.
   */
  async set<Type extends WellKnownCacheType>(
    type: Type,
    key: string,
    value: Readonly<WellKnownMap[Type]>
  ) {
    return this.cacheStore.set(this.cacheKey(type, key), JSON.stringify(value));
  }

  /** Delete value from the inner cache store for the given type and key. */
  async delete(type: WellKnownCacheType, key: string) {
    return this.cacheStore.delete(this.cacheKey(type, key));
  }

  /**
   * Create a wrapper of the given function, which invalidates a set of keys in cache
   * after the function runs successfully.
   *
   * @param run The function to wrap.
   * @param types An array of {@link CacheKeyConfig}.
   */
  mutate<Args extends unknown[], Return>(
    run: (...args: Args) => Promise<Return>,
    ...types: Array<CacheKeyConfig<Args>>
  ) {
    // Intended. We're going to use `this` cache inside another closure.
    // eslint-disable-next-line @typescript-eslint/no-this-alias, unicorn/no-this-assignment
    const kvCache = this;

    const mutated = async function (this: unknown, ...args: Args): Promise<Return> {
      const value = await run.apply(this, args);

      // We don't leverage `finally` here since we want to ensure cache deleting
      // only happens when the original function executed successfully
      void Promise.all(
        types.map(async ([type, cacheKey]) =>
          trySafe(kvCache.delete(type, cacheKey?.(...args) ?? WellKnownCache.defaultKey))
        )
      );

      return value;
    };

    return mutated;
  }

  /**
   * [Memoize](https://en.wikipedia.org/wiki/Memoization) a function and cache the result. The function execution
   * will be also cached, which means there will be only one execution at a time.
   *
   * @param run The function to memoize.
   * @param config The object to determine how cache key will be built. See {@link CacheKeyConfig} for details.
   */
  memoize<Type extends WellKnownCacheType, Args extends unknown[]>(
    run: (...args: Args) => Promise<Readonly<WellKnownMap[Type]>>,
    [type, cacheKey]: CacheKeyConfig<Args, Type>
  ) {
    const promiseCache = new Map<unknown, Promise<Readonly<WellKnownMap[Type]>>>();
    // Intended. We're going to use `this` cache inside another closure.
    // eslint-disable-next-line @typescript-eslint/no-this-alias, unicorn/no-this-assignment
    const kvCache = this;

    const memoized = async function (
      this: unknown,
      ...args: Args
    ): Promise<Readonly<WellKnownMap[Type]>> {
      const promiseKey = cacheKey?.(...args) ?? WellKnownCache.defaultKey;
      const cachedPromise = promiseCache.get(promiseKey);

      if (cachedPromise) {
        return cachedPromise;
      }

      const promise = (async () => {
        try {
          // Wrap with `trySafe()` here to ignore Redis errors
          const cachedValue = await trySafe(kvCache.get(type, promiseKey));

          if (cachedValue) {
            cacheConsole.info('Well-known cache hit for', type, promiseKey);
            return cachedValue;
          }

          const value = await run.apply(this, args);
          await trySafe(kvCache.set(type, promiseKey, value));

          return value;
        } finally {
          promiseCache.delete(promiseKey);
        }
      })();

      promiseCache.set(promiseKey, promise);

      return promise;
    };

    return memoized;
  }

  protected cacheKey(type: WellKnownCacheType, key: string) {
    return `${this.tenantId}:${type}:${key}`;
  }
}
