import { type SignInExperience, SignInExperiences } from '@logto/schemas';
import { type Optional, trySafe } from '@silverhand/essentials';
import { type ZodType, z } from 'zod';

import { type ConnectorWellKnown, connectorWellKnownGuard } from '#src/utils/connectors/types.js';

import { type CacheStore } from './types.js';

type WellKnownMap = {
  sie: SignInExperience;
  'connectors-well-known': ConnectorWellKnown[];
  'custom-phrases': Record<string, unknown>;
  'custom-phrases-tags': string[];
};

const defaultCacheKey = '#';

export type WellKnownCacheType = keyof WellKnownMap;

type CacheKeyConfig<Args extends unknown[], Type = WellKnownCacheType> =
  | [Type]
  | [Type, (...args: Args) => string];

// Cannot use generic type here, but direct type works.
// See https://github.com/microsoft/TypeScript/issues/27808#issuecomment-1207161877
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
    default: {
      throw new Error(`No proper value guard found for cache key "${String(type)}".`);
    }
  }
}

export class WellKnownCache {
  constructor(public tenantId: string, protected cacheStore: CacheStore) {}

  async get<Type extends WellKnownCacheType>(
    type: Type,
    key: string
  ): Promise<Optional<WellKnownMap[Type]>> {
    const data = await this.cacheStore.get(this.cacheKey(type, key));

    return trySafe(() => getValueGuard(type).parse(JSON.parse(data ?? '')));
  }

  async set<Type extends WellKnownCacheType>(
    type: Type,
    key: string,
    value: Readonly<WellKnownMap[Type]>
  ) {
    return this.cacheStore.set(this.cacheKey(type, key), JSON.stringify(value));
  }

  async delete(type: WellKnownCacheType, key: string) {
    return this.cacheStore.delete(this.cacheKey(type, key));
  }

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
          trySafe(kvCache.delete(type, cacheKey?.(...args) ?? defaultCacheKey))
        )
      );

      return value;
    };

    return mutated;
  }

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
      const promiseKey = cacheKey?.(...args) ?? defaultCacheKey;
      const cachedPromise = promiseCache.get(promiseKey);

      if (cachedPromise) {
        return cachedPromise;
      }

      const promise = (async () => {
        // Wrap with `trySafe()` here to ignore Redis errors
        const cachedValue = await trySafe(kvCache.get(type, promiseKey));

        if (cachedValue) {
          return cachedValue;
        }

        const value = await run.apply(this, args);
        await trySafe(kvCache.set(type, promiseKey, value));
        promiseCache.delete(promiseKey);

        return value;
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
