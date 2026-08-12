import { generateStandardId } from '@logto/shared';
import { trySafe, type Optional } from '@silverhand/essentials';
import { type ZodType } from 'zod';

import { type CacheStore } from './types.js';
import { cacheConsole } from './utils.js';

type CacheKeyOf<CacheMapT extends Record<string, unknown>> = Extract<keyof CacheMapT, string>;

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
  Type extends string,
  CacheKey = (...args: Args) => string,
> = [Type] | [Type, CacheKey];

export abstract class BaseCache<CacheMapT extends Record<string, unknown>> {
  static defaultKey = '#';

  /**
   * For logging and debugging purposes only.
   * This name will be used in the log messages.
   */
  abstract name: string;

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
   * Note: Redis connection and format errors will be silently caught and result an `undefined` return.
   */
  async get<Type extends CacheKeyOf<CacheMapT>>(
    type: Type,
    key: string
  ): Promise<Optional<CacheMapT[Type]>> {
    return trySafe(async () => {
      const data = await this.cacheStore.get(this.cacheKey(type, key));
      return this.getValueGuard(type).parse(JSON.parse(data ?? ''));
    });
  }

  /**
   * Set value to the inner cache store for the given type and key.
   * The given value will be stringify without format validation before storing into the cache.
   *
   * @param expire The expire time in seconds. If not given, use the default expire time  30 * 60 seconds.
   */
  async set<Type extends CacheKeyOf<CacheMapT>>(
    type: Type,
    key: string,
    value: Readonly<CacheMapT[Type]>,
    expire?: number
  ) {
    return this.cacheStore.set(this.cacheKey(type, key), JSON.stringify(value), expire);
  }

  /** Delete value from the inner cache store for the given type and key. */
  async delete(type: CacheKeyOf<CacheMapT>, key: string) {
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
    ...types: Array<CacheKeyConfig<Args, CacheKeyOf<CacheMapT>>>
  ) {
    // Intended. We're going to use `this` cache inside another closure.
    // eslint-disable-next-line @typescript-eslint/no-this-alias, unicorn/no-this-assignment
    const kvCache = this;

    const mutated = async function (this: unknown, ...args: Args): Promise<Return> {
      const value = await run.apply(this, args);

      /**
       * We don't leverage `finally` here since we want to ensure cache invalidation
       * only happens when the original function executed successfully.
       *
       * The generation must be bumped before deleting, and both must be awaited: this
       * guarantees that once this function returns, in-flight reads that computed from
       * pre-mutation state either fail the generation check in {@link BaseCache.memoize}
       * or have their write-back removed by the deletion below.
       */
      await Promise.all(
        types.map(async ([type, cacheKey]) => {
          const key = cacheKey?.(...args) ?? BaseCache.defaultKey;
          await trySafe(kvCache.bumpGeneration(type, key));
          await trySafe(kvCache.delete(type, key));
        })
      );

      return value;
    };

    return mutated;
  }

  /**
   * [Memoize](https://en.wikipedia.org/wiki/Memoization) a function and cache the result. The function execution
   * will be also cached, which means there will be only one execution at a time.
   *
   * Results computed before an invalidation (see {@link mutate}) are discarded instead of
   * written back, so the cache can never serve pre-mutation data after the mutation returns.
   *
   * @param run The function to memoize.
   * @param config The object to determine how cache key will be built. See {@link CacheKeyConfig} for details.
   * @param getExpiresIn A function to determine how long the cache will be expired. The function will be called
   * with the resolved value from the original function. The return value should be the expire time in seconds.
   */
  memoize<
    Type extends CacheKeyOf<CacheMapT>,
    Args extends unknown[],
    Value extends Readonly<CacheMapT[Type]>,
  >(
    run: (...args: Args) => Promise<Value>,
    [type, cacheKey]: CacheKeyConfig<Args, Type>,
    getExpiresIn?: (value: Value) => number
  ) {
    const promiseCache = new Map<unknown, Promise<Readonly<CacheMapT[Type]>>>();
    // Intended. We're going to use `this` cache inside another closure.
    // eslint-disable-next-line @typescript-eslint/no-this-alias, unicorn/no-this-assignment
    const kvCache = this;

    const memoized = async function (
      this: unknown,
      ...args: Args
    ): Promise<Readonly<CacheMapT[Type]>> {
      const promiseKey = cacheKey?.(...args) ?? BaseCache.defaultKey;
      const cachedPromise = promiseCache.get(promiseKey);

      if (cachedPromise) {
        return cachedPromise;
      }

      const promise = (async () => {
        try {
          // Wrap with `trySafe()` here to ignore Redis errors
          const cachedValue = await trySafe(kvCache.get(type, promiseKey));

          if (cachedValue !== undefined) {
            cacheConsole.info(
              `${kvCache.name} cache hit for, ${kvCache.tenantId}, ${type}, ${promiseKey}`
            );
            return cachedValue;
          }

          const generation = await kvCache.getGeneration(type, promiseKey);
          const value = await run.apply(this, args);

          // Skip the write-back when an invalidation happened while `run` was in flight,
          // since the result may be computed from pre-mutation state.
          if ((await kvCache.getGeneration(type, promiseKey)) === generation) {
            await trySafe(kvCache.set(type, promiseKey, value, getExpiresIn?.(value)));

            // Undo the write if an invalidation landed between the check and the write,
            // so a stale value can never persist in the cache.
            if ((await kvCache.getGeneration(type, promiseKey)) !== generation) {
              await trySafe(kvCache.delete(type, promiseKey));
            }
          }

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

  abstract getValueGuard<Type extends CacheKeyOf<CacheMapT>>(type: Type): ZodType<CacheMapT[Type]>;

  /**
   * Get the current invalidation generation for the given type and key.
   * Note: Store errors will be silently caught and result an `undefined` return.
   *
   * The generation is bumped by every {@link mutate} invalidation. {@link memoize} snapshots it
   * before computing and discards results written under an outdated generation, so a read that
   * started before a mutation can never write its stale result back into the cache.
   */
  protected async getGeneration(type: CacheKeyOf<CacheMapT>, key: string) {
    return trySafe(async () => this.cacheStore.get(this.generationKey(type, key)));
  }

  /** Bump the invalidation generation for the given type and key. See {@link getGeneration}. */
  protected async bumpGeneration(type: CacheKeyOf<CacheMapT>, key: string) {
    return this.cacheStore.set(this.generationKey(type, key), generateStandardId());
  }

  protected generationKey(type: CacheKeyOf<CacheMapT>, key: string) {
    return `${this.cacheKey(type, key)}:generation`;
  }

  protected cacheKey(type: CacheKeyOf<CacheMapT>, key: string) {
    return `${this.tenantId}:${type}:${key}`;
  }
}
