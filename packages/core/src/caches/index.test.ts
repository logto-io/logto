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

  it('should fail fast when cache read hangs for more than 5 seconds', async () => {
    jest.clearAllMocks();
    jest.useFakeTimers();

    try {
      mockFunction.mockImplementationOnce(
        async () =>
          new Promise<string>((resolve) => {
            setTimeout(() => resolve('never'), 60_000);
          })
      );
      const cache = new RedisCache('redis://url');
      const pendingRead = cache.get('foo');
      const marker = Symbol('marker');
      const beforeTimeout = Promise.race([
        pendingRead,
        new Promise<symbol>((resolve) => {
          setTimeout(() => resolve(marker), 4999);
        }),
      ]);

      jest.advanceTimersByTime(4999);
      await expect(beforeTimeout).resolves.toBe(marker);

      jest.advanceTimersByTime(1);
      await expect(pendingRead).resolves.toBeUndefined();
    } finally {
      jest.useRealTimers();
    }
  });
});
