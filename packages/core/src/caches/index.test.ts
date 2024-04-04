import { createMockUtils } from '@logto/shared/esm';

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

const { RedisCache, RedisClusterCache } = await import('./index.js');

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
      const cache = new RedisCache(url);

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
    }
  });

  it('should successfully construct with a Redis Cluster client', async () => {
    for (const url of ['redis://url', 'redis:?host=h1&host=h2&host=h3']) {
      jest.clearAllMocks();
      const cache = new RedisClusterCache(new URL(url));

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
    }
  });
});
