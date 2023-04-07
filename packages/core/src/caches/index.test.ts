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
    connect: mockFunction,
    disconnect: mockFunction,
    on: mockFunction,
  }),
}));

const { RedisCache } = await import('./index.js');

const stubRedisUrl = (url?: string) =>
  Sinon.stub(EnvSet, 'values').value({
    ...EnvSet.values,
    redisUrl: url,
  });

describe('RedisCache', () => {
  it('should successfully construct with no REDIS_URL', async () => {
    stubRedisUrl();
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
      stubRedisUrl(url);
      const cache = new RedisCache();

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
