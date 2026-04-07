import { createMockUtils } from '@logto/shared/esm';
import Sinon from 'sinon';

import { EnvSet } from '#src/env-set/index.js';

const { jest } = import.meta;
const { mockEsm } = createMockUtils(jest);

const mockFunction = jest.fn();

mockEsm('redis', () => ({
  createClient: () => ({
    set: mockFunction,
    get: mockFunction,
    del: mockFunction,
    ping: async () => 'PONG',
    connect: mockFunction,
    disconnect: mockFunction,
    on: mockFunction,
  }),
  createCluster: () => ({
    set: mockFunction,
    get: mockFunction,
    del: mockFunction,
    sendCommand: async () => 'PONG',
    connect: mockFunction,
    disconnect: mockFunction,
    on: mockFunction,
  }),
}));

const { RedisCache, RedisClusterCache, redisCacheFactory } = await import('./index.js');

describe('RedisCache', () => {
  it('should successfully construct with no REDIS_URL', async () => {
    const cache = new RedisCache();

    expect(cache.client).toBeUndefined();
    // Not to throw
    await Promise.all([
      cache.set('foo', 'bar'),
      cache.get('foo'),
      cache.delete('foo'),
      cache.connect(),
      cache.disconnect(),
    ]);
  });

  it('should successfully construct with a Redis client', async () => {
    for (const url of ['1', 'redis://url']) {
      jest.clearAllMocks();
      const stub = Sinon.stub(EnvSet, 'values').value({
        ...EnvSet.values,
        redisUrl: url,
      });

      const cache = redisCacheFactory();
      expect(cache instanceof RedisCache).toBeTruthy();
      expect(cache.client).toBeTruthy();

      // eslint-disable-next-line no-await-in-loop
      await Promise.all([
        cache.set('foo', 'bar'),
        cache.get('foo'),
        cache.delete('foo'),
        cache.connect(),
        cache.disconnect(),
      ]);

      // Do sanity check only
      expect(mockFunction).toBeCalledTimes(6);
      stub.restore();
    }
  });

  it('should successfully construct with a Redis Cluster client', async () => {
    for (const url of ['redis://url?cluster=1', 'redis:?host=h1&host=h2&host=h3&cluster=true']) {
      jest.clearAllMocks();
      const stub = Sinon.stub(EnvSet, 'values').value({
        ...EnvSet.values,
        redisUrl: url,
      });

      const cache = redisCacheFactory();
      expect(cache instanceof RedisClusterCache).toBeTruthy();
      expect(cache.client).toBeTruthy();

      // eslint-disable-next-line no-await-in-loop
      await Promise.all([
        cache.set('foo', 'bar'),
        cache.get('foo'),
        cache.delete('foo'),
        cache.connect(),
        cache.disconnect(),
      ]);

      // Do sanity check only
      expect(mockFunction).toBeCalledTimes(6);
      stub.restore();
    }
  });

  it('should fail fast when cache read hangs for more than 1 second', async () => {
    jest.clearAllMocks();
    const cache = new RedisCache('redis://url');
    jest.spyOn(cache.client!, 'get').mockImplementation(
      async () =>
        new Promise<string>((resolve) => {
          // Intentionally never resolve to simulate a stuck Redis read without extra timers.
          void resolve;
        })
    );
    const start = Date.now();
    await expect(cache.get('foo')).resolves.toBeUndefined();
    expect(Date.now() - start).toBeGreaterThanOrEqual(900);
  }, 4000);
});
