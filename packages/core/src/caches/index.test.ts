import { createMockUtils } from '@logto/shared/esm';
import Sinon from 'sinon';

import { EnvSet } from '#src/env-set/index.js';

const { jest } = import.meta;
const { mockEsm } = createMockUtils(jest);

const mockFunction = jest.fn();

mockEsm('redis', () => ({
  createClient: () => ({
    // Standalone clients report readiness via `isReady`; default to ready so commands run.
    isReady: true,
    set: mockFunction,
    get: mockFunction,
    del: mockFunction,
    ping: async () => 'PONG',
    connect: mockFunction,
    disconnect: mockFunction,
    on: mockFunction,
  }),
  createCluster: () => ({
    // The cluster client only exposes `isOpen`; default to open so commands run.
    isOpen: true,
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
const { cacheConsole } = await import('./utils.js');

// Intentionally never resolve to simulate a stuck Redis command without extra timers.
const hang = async () =>
  new Promise<never>((resolve) => {
    void resolve;
  });

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

  it('should short-circuit get and set when the client is not ready, but still issue delete', async () => {
    jest.clearAllMocks();
    const cache = new RedisCache('redis://url');
    // Simulate a down or reconnecting socket so the readiness guard kicks in.
    Sinon.stub(cache.client!, 'isReady').value(false);
    // Independent stubs per command — the shared `mockFunction` can't tell which method ran.
    const getStub = Sinon.stub(cache.client!, 'get');
    const setStub = Sinon.stub(cache.client!, 'set');
    const deleteStub = Sinon.stub(cache.client!, 'del');

    await expect(cache.get('foo')).resolves.toBeUndefined();
    await cache.set('foo', 'bar');
    await cache.delete('foo');

    // `get`/`set` short-circuit without touching Redis; `delete` is exempt so its command still runs
    // (and flushes on reconnect).
    expect(getStub.called).toBe(false);
    expect(setStub.called).toBe(false);
    expect(deleteStub.calledOnce).toBe(true);
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

  it('should fail fast when cache set/delete hang past the write timeout', async () => {
    jest.clearAllMocks();
    const cache = new RedisCache('redis://url');
    jest.spyOn(cache.client!, 'set').mockImplementation(hang);
    jest.spyOn(cache.client!, 'del').mockImplementation(hang);
    // Capture timeout warnings — both to keep test output clean and to assert observability.
    const warnSpy = jest.spyOn(cacheConsole, 'warn').mockReturnValue();

    try {
      const start = Date.now();
      // Run set and delete in parallel so the suite only waits one write-timeout window.
      await Promise.all([
        expect(cache.set('foo', 'bar')).resolves.toBeUndefined(),
        expect(cache.delete('foo')).resolves.toBeUndefined(),
      ]);
      const elapsed = Date.now() - start;

      // Lower bound proves the 5s timeout fired; upper bound (with generous CI jitter headroom)
      // catches regressions where the constant is accidentally bumped higher.
      expect(elapsed).toBeGreaterThanOrEqual(4900);
      expect(elapsed).toBeLessThan(7000);

      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('Redis SET on key "foo"'));
      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('Redis DEL on key "foo"'));
    } finally {
      // Restore in finally so the spy never leaks into later tests on assertion failure.
      warnSpy.mockRestore();
    }
  }, 8000);
});
