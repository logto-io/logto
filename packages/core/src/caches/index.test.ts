import { createMockUtils } from '@logto/shared/esm';
import Sinon from 'sinon';

import { EnvSet } from '#src/env-set/index.js';

const { jest } = import.meta;
const { mockEsm } = createMockUtils(jest);

const mockFunction = jest.fn();

type SocketOptions = {
  tls?: boolean;
  reconnectStrategy?: (retries: number, cause: Error) => number | false | Error;
};

const createClient = jest.fn((_config?: { socket?: SocketOptions }) => ({
  // Standalone clients report readiness via `isReady`; default to ready so commands run.
  isReady: true,
  isOpen: true,
  set: mockFunction,
  get: mockFunction,
  del: mockFunction,
  ping: async () => 'PONG',
  connect: mockFunction,
  disconnect: mockFunction,
  on: mockFunction,
}));

const createCluster = jest.fn(
  (_config?: {
    rootNodes?: Array<{ url: string; socket?: SocketOptions }>;
    defaults?: {
      username?: string;
      password?: string;
      disableOfflineQueue?: boolean;
      socket?: SocketOptions;
    };
  }) => ({
    // The cluster client only exposes `isOpen`; default to open so commands run.
    isOpen: true,
    set: mockFunction,
    get: mockFunction,
    del: mockFunction,
    sendCommand: async () => 'PONG',
    connect: mockFunction,
    disconnect: mockFunction,
    on: mockFunction,
  })
);

mockEsm('redis', () => ({
  createClient,
  createCluster,
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

      // Do sanity check only; `get` and `set` skip Redis until the cluster has connected.
      expect(mockFunction).toBeCalledTimes(4);
      stub.restore();
    }
  });

  it('should decode percent-encoded credentials for the cluster client', () => {
    jest.clearAllMocks();
    const stub = Sinon.stub(EnvSet, 'values').value({
      ...EnvSet.values,
      redisUrl: 'rediss://user:p%40ss%2Fword@redis.example:6379?cluster=1',
    });

    try {
      redisCacheFactory();

      const options = createCluster.mock.calls[0]?.[0];
      expect(options?.defaults?.username).toBe('user');
      expect(options?.defaults?.password).toBe('p@ss/word'); // `%40`->`@`, `%2F`->`/`
    } finally {
      stub.restore();
    }
  });

  it('should not throw and decode selectively when credentials mix literal `%` with encoded chars', () => {
    jest.clearAllMocks();
    const stub = Sinon.stub(EnvSet, 'values').value({
      ...EnvSet.values,
      redisUrl: 'rediss://user:pa%s^s@redis.example:6379?cluster=1', // `pa%s^s` parses to `pa%s%5Es`
    });

    try {
      redisCacheFactory();

      const options = createCluster.mock.calls[0]?.[0];
      expect(options?.defaults?.username).toBe('user');
      expect(options?.defaults?.password).toBe('pa%s^s'); // `%s` kept literal, `%5E`->`^`
    } finally {
      stub.restore();
    }
  });

  it('should decode multi-byte UTF-8 sequences in credentials', () => {
    jest.clearAllMocks();
    const stub = Sinon.stub(EnvSet, 'values').value({
      ...EnvSet.values,
      // `café`/`你好` -> `caf%C3%A9`/`%E4%BD%A0%E5%A5%BD`
      redisUrl: 'rediss://caf%C3%A9:%E4%BD%A0%E5%A5%BD@redis.example:6379?cluster=1',
    });

    try {
      redisCacheFactory();

      const options = createCluster.mock.calls[0]?.[0];
      expect(options?.defaults?.username).toBe('café');
      expect(options?.defaults?.password).toBe('你好');
    } finally {
      stub.restore();
    }
  });

  it('should pass undefined cluster credentials when the URL has none', () => {
    jest.clearAllMocks();
    const stub = Sinon.stub(EnvSet, 'values').value({
      ...EnvSet.values,
      redisUrl: 'rediss://redis.example:6379?cluster=1',
    });

    try {
      redisCacheFactory();
      const options = createCluster.mock.calls[0]?.[0];
      expect(options?.defaults?.username).toBeUndefined();
      expect(options?.defaults?.password).toBeUndefined();
    } finally {
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

const getReconnectStrategies = () => {
  jest.clearAllMocks();
  // eslint-disable-next-line no-new -- only the options passed to the factories are inspected
  new RedisCache('redis://url');
  // eslint-disable-next-line no-new -- only the options passed to the factories are inspected
  new RedisClusterCache(new URL('redis://url?cluster=1'));

  return [
    createClient.mock.calls[0]?.[0]?.socket?.reconnectStrategy,
    createCluster.mock.calls[0]?.[0]?.defaults?.socket?.reconnectStrategy,
  ];
};

const expectDelayBetween = (delay: unknown, min: number, max: number) => {
  expect(delay).toBeGreaterThanOrEqual(min);
  expect(delay).toBeLessThanOrEqual(max);
};

describe('Redis reconnection', () => {
  it('keeps retrying with a capped, jittered delay instead of giving up', () => {
    for (const reconnectStrategy of getReconnectStrategies()) {
      expectDelayBetween(reconnectStrategy?.(1, new Error('ECONNREFUSED')), 400, 500);
      expectDelayBetween(reconnectStrategy?.(6, new Error('ECONNREFUSED')), 2400, 3000);
      expectDelayBetween(reconnectStrategy?.(1000, new Error('ECONNREFUSED')), 4000, 5000);
    }
  });

  it('does not retry when the server certificate is self-signed', () => {
    for (const reconnectStrategy of getReconnectStrategies()) {
      const cause: Error & { code: string } = {
        name: 'Error',
        message: 'self-signed certificate in certificate chain',
        code: 'SELF_SIGNED_CERT_IN_CHAIN',
      };
      expect(reconnectStrategy?.(0, cause)).toBe(false);
    }
  });

  it('does not hold startup while Redis is unreachable', async () => {
    jest.clearAllMocks();
    const cache = new RedisCache('redis://url');
    // A standalone `connect()` only resolves once the socket is ready, which never happens here.
    jest.spyOn(cache.client!, 'connect').mockImplementation(hang);
    const warnSpy = jest.spyOn(cacheConsole, 'warn').mockReturnValue();

    try {
      const start = Date.now();
      await cache.connect();
      const elapsed = Date.now() - start;

      expect(elapsed).toBeGreaterThanOrEqual(4900);
      expect(elapsed).toBeLessThan(7000);
      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('Redis is not reachable'));
    } finally {
      warnSpy.mockRestore();
    }
  }, 8000);

  it('connects a standalone client and confirms it with a ping', async () => {
    jest.clearAllMocks();
    const cache = new RedisCache('redis://url');
    // Earlier tests leave the shared `mockFunction` hanging, so stub `connect` on its own.
    Sinon.stub(cache.client!, 'connect').resolves();
    const infoSpy = jest.spyOn(cacheConsole, 'info').mockReturnValue();

    try {
      await cache.connect();
      expect(infoSpy).toHaveBeenCalledWith('Connected to Redis');
    } finally {
      infoSpy.mockRestore();
    }
  });

  it('does not reconnect an open cluster when the ping after connecting fails', async () => {
    jest.clearAllMocks();
    const cache = new RedisClusterCache(new URL('redis://url?cluster=1'));
    const connectStub = Sinon.stub(cache.client!, 'connect').resolves();
    Sinon.stub(cache.client!, 'sendCommand').rejects(new Error('Socket closed unexpectedly'));
    const errorSpy = jest.spyOn(cacheConsole, 'error').mockReturnValue();

    try {
      await cache.connect();
      expect(connectStub.callCount).toBe(1);
    } finally {
      errorSpy.mockRestore();
    }
  });

  it('stops retrying a cluster connection once disconnected', async () => {
    jest.clearAllMocks();
    const cache = new RedisClusterCache(new URL('redis://url?cluster=1'));
    const connectStub = Sinon.stub(cache.client!, 'connect').callsFake(async () => {
      void cache.disconnect();
      throw new Error('All the root nodes are unavailable');
    });
    const errorSpy = jest.spyOn(cacheConsole, 'error').mockReturnValue();
    const infoSpy = jest.spyOn(cacheConsole, 'info').mockReturnValue();

    try {
      const start = Date.now();
      await cache.connect();

      // Resolves after one backoff delay rather than at the startup timeout.
      expect(Date.now() - start).toBeLessThan(2000);
      expect(connectStub.callCount).toBe(1);
    } finally {
      errorSpy.mockRestore();
      infoSpy.mockRestore();
    }
  });

  it('skips cluster reads and writes until connecting resolves, and fails fast on offline nodes', async () => {
    jest.clearAllMocks();
    const cache = new RedisClusterCache(new URL('redis://url?cluster=1'));
    // The cluster reports `isOpen` while topology discovery is still connecting to nodes.
    // eslint-disable-next-line no-use-extend-native/no-use-extend-native -- `Promise.withResolvers` is standard since ES2024; the rule's built-in method list predates it
    const connect = Promise.withResolvers<void>();
    Sinon.stub(cache.client!, 'connect').returns(connect.promise);
    const getStub = Sinon.stub(cache.client!, 'get').resolves('bar');
    const infoSpy = jest.spyOn(cacheConsole, 'info').mockReturnValue();

    try {
      const connecting = cache.connect();
      await expect(cache.get('foo')).resolves.toBeUndefined();
      expect(getStub.called).toBe(false);

      connect.resolve();
      await connecting;
      await expect(cache.get('foo')).resolves.toBe('bar');
      expect(createCluster.mock.calls[0]?.[0]?.defaults?.disableOfflineQueue).toBe(true);
    } finally {
      infoSpy.mockRestore();
    }
  });

  it('gives each cluster root node its own socket options so discovery cannot disable reconnects', () => {
    jest.clearAllMocks();
    // eslint-disable-next-line no-new -- only the options passed to the factory are inspected
    new RedisClusterCache(new URL('redis://h1?cluster=1&host=h2'));

    const options = createCluster.mock.calls[0]?.[0];
    expect(options?.rootNodes).toHaveLength(2);
    for (const rootNode of options?.rootNodes ?? []) {
      expect(rootNode.socket).toBeDefined();
      expect(rootNode.socket).not.toBe(options?.defaults?.socket);
    }
  });

  it('retries a cluster connection that failed because no root node answered', async () => {
    jest.clearAllMocks();
    const cache = new RedisClusterCache(new URL('redis://url?cluster=1'));
    const connectStub = Sinon.stub(cache.client!, 'connect')
      .onFirstCall()
      .rejects(new Error('All the root nodes are unavailable'))
      .onSecondCall()
      .resolves();
    const errorSpy = jest.spyOn(cacheConsole, 'error').mockReturnValue();
    const infoSpy = jest.spyOn(cacheConsole, 'info').mockReturnValue();

    try {
      await cache.connect();

      expect(connectStub.callCount).toBe(2);
      expect(infoSpy).toHaveBeenCalledWith('Connected to Redis');
    } finally {
      errorSpy.mockRestore();
      infoSpy.mockRestore();
    }
  });
});

describe('TLS socket options derived from the URL protocol', () => {
  it('enables TLS for a standalone client when the protocol is rediss', () => {
    jest.clearAllMocks();
    const cache = new RedisCache('rediss://url');

    expect(cache.client).toBeTruthy();
    expect(createClient.mock.calls[0]?.[0]?.socket?.tls).toBe(true);
  });

  it('does not enable TLS for a standalone client when the protocol is redis', () => {
    jest.clearAllMocks();
    const cache = new RedisCache('redis://url');

    expect(cache.client).toBeTruthy();
    expect(createClient.mock.calls[0]?.[0]?.socket?.tls).toBe(false);
  });

  it('enables TLS on the cluster node defaults when the protocol is rediss', () => {
    jest.clearAllMocks();
    const cache = new RedisClusterCache(new URL('rediss://url?cluster=1'));

    expect(cache.client).toBeTruthy();
    expect(createCluster.mock.calls[0]?.[0]?.defaults?.socket?.tls).toBe(true);
  });

  it('does not enable TLS on the cluster node defaults when the protocol is redis', () => {
    jest.clearAllMocks();
    const cache = new RedisClusterCache(new URL('redis://url?cluster=1'));

    expect(cache.client).toBeTruthy();
    expect(createCluster.mock.calls[0]?.[0]?.defaults?.socket?.tls).toBe(false);
  });
});
