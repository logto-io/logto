import { TtlCache } from '@logto/shared';
import { pick } from '@silverhand/essentials';

import { mockConnector0 } from '#src/__mocks__/connector-base-data.js';
import { mockSignInExperience } from '#src/__mocks__/sign-in-experience.js';

import { WellKnownCache } from './well-known.js';

const { jest } = import.meta;

const tenantId = 'mock_id';
const cacheStore = new TtlCache<string, string>(60_000);

afterEach(() => {
  jest.clearAllMocks();
  cacheStore.clear();
});

describe('Well-known cache basics', () => {
  it('should be able to get, set, and delete values', async () => {
    const cache = new WellKnownCache(tenantId, cacheStore);

    await cache.set('sie', WellKnownCache.defaultKey, mockSignInExperience);
    expect(await cache.get('sie', WellKnownCache.defaultKey)).toStrictEqual(mockSignInExperience);

    await cache.set('connectors-well-known', '123', [mockConnector0]);
    expect(await cache.get('connectors-well-known', '123')).toStrictEqual([
      pick(mockConnector0, 'connectorId', 'id', 'metadata'),
    ]);

    await cache.delete('sie', WellKnownCache.defaultKey);
    expect(await cache.get('sie', WellKnownCache.defaultKey)).toBe(undefined);
  });

  it('should be able to set the value with wrong structure', async () => {
    const cache = new WellKnownCache(tenantId, cacheStore);

    // @ts-expect-error
    await cache.set('custom-phrases-tags', WellKnownCache.defaultKey, 1);
    expect(await cache.get('custom-phrases-tags', WellKnownCache.defaultKey)).toBe(undefined);
  });

  it('should be able to set and get when cache type is wrong', async () => {
    const cache = new WellKnownCache(tenantId, cacheStore);

    // @ts-expect-error
    await cache.set('custom-phrases-tags-', WellKnownCache.defaultKey, []);

    expect(
      // @ts-expect-error
      await cache.get('custom-phrases-tags-', WellKnownCache.defaultKey)
    ).toBe(undefined);
  });
});

describe('Well-known cache function wrappers', () => {
  it('can memoize function and cache the promise', async () => {
    jest.useFakeTimers();
    const runResult = Object.freeze({ foo: 'bar' });
    const run = jest.fn(
      async () =>
        new Promise<Record<string, unknown>>((resolve) => {
          setTimeout(() => {
            resolve(runResult);
          }, 0);
          jest.runOnlyPendingTimers(); // Ensure this runs in fake timers
        })
    );
    const cache = new WellKnownCache(tenantId, cacheStore);
    const memoized = cache.memoize(run, ['custom-phrases']);

    const [result1, result2] = await Promise.all([memoized(), memoized()]);
    expect(result1).toStrictEqual(runResult);
    expect(result2).toStrictEqual(runResult);
    expect(await cache.get('custom-phrases', WellKnownCache.defaultKey)).toStrictEqual(runResult);
    expect(run).toBeCalledTimes(1);

    // Second call
    expect(await memoized()).toStrictEqual(runResult);
    expect(run).toBeCalledTimes(1);

    // Cache expired
    jest.setSystemTime(Date.now() + 100_000); // Ensure cache is expired

    expect(await memoized()).toStrictEqual(runResult);
    expect(run).toBeCalledTimes(2);
    expect(await cache.get('custom-phrases', WellKnownCache.defaultKey)).toStrictEqual(runResult);
    jest.useRealTimers();
  });

  it('can memoize function with customized cache key builder', async () => {
    const run = jest.fn(
      async (foo: string, bar: number) =>
        new Promise<Record<string, unknown>>((resolve) => {
          setTimeout(() => {
            resolve({ foo, bar });
          }, 0);
        })
    );
    const cache = new WellKnownCache(tenantId, cacheStore);
    const memoized = cache.memoize(run, ['custom-phrases', (foo, bar) => `${foo}+${bar}`]);

    const [result1, result2] = await Promise.all([memoized('1', 1), memoized('2', 2)]);
    expect(result1).toStrictEqual({ foo: '1', bar: 1 });
    expect(result2).toStrictEqual({ foo: '2', bar: 2 });

    expect(
      await Promise.all([cache.get('custom-phrases', '1+1'), cache.get('custom-phrases', '2+2')])
    ).toStrictEqual([
      { foo: '1', bar: 1 },
      { foo: '2', bar: 2 },
    ]);
  });

  it('can create mutate function wrapper with default cache key builder', async () => {
    const run = jest.fn(
      async () =>
        new Promise<Record<string, unknown>>((resolve) => {
          setTimeout(() => {
            resolve({});
          }, 0);
        })
    );
    const update = jest.fn(async () => true);
    const cache = new WellKnownCache(tenantId, cacheStore);
    const memoized = cache.memoize(run, ['custom-phrases']);
    const mutate = cache.mutate(update, ['custom-phrases']);

    await memoized();
    await mutate();

    expect(await cache.get('custom-phrases', WellKnownCache.defaultKey)).toBeUndefined();
    await memoized();
    expect(run).toBeCalledTimes(2);
  });

  it('can create mutate function wrapper with customized cache key builder', async () => {
    const run = jest.fn(
      async (foo: string, bar: number) =>
        new Promise<Record<string, unknown>>((resolve) => {
          setTimeout(() => {
            resolve({ foo, bar });
          }, 0);
        })
    );
    const update = jest.fn(async (value: number) => value);
    const cache = new WellKnownCache(tenantId, cacheStore);
    const memoized = cache.memoize(run, ['custom-phrases', (foo, bar) => `${foo}+${bar}`]);
    const mutate = cache.mutate(update, ['custom-phrases', (value) => `1+${value}`]);

    await Promise.all([memoized('1', 1), memoized('2', 2)]);
    await Promise.all([mutate(1), mutate(2)]);

    expect(
      await Promise.all([cache.get('custom-phrases', '1+1'), cache.get('custom-phrases', '2+2')])
    ).toStrictEqual([undefined, { foo: '2', bar: 2 }]);
    expect(run).toBeCalledTimes(2);

    const mutate2 = cache.mutate(update, ['custom-phrases', () => `2+2`]);
    await mutate2(1);

    expect(await cache.get('custom-phrases', '2+2')).toBeUndefined();
    expect(run).toBeCalledTimes(2);
  });
});
