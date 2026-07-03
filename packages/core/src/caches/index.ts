import fs from 'node:fs';
import { setTimeout } from 'node:timers/promises';

import { appInsights } from '@logto/app-insights/node';
import { type Optional, conditional, yes, trySafe } from '@silverhand/essentials';
import { createClient, createCluster, type RedisClientType, type RedisClusterType } from 'redis';

import { EnvSet } from '#src/env-set/index.js';

import { type CacheStore } from './types.js';
import { cacheConsole } from './utils.js';

// Reads are best-effort and short-circuit to a miss when Redis stalls.
const redisCacheReadTimeout = 1000;
// Writes are allowed more headroom but still bounded so a Redis stall can never hold a request.
const redisCacheWriteTimeout = 5000;

const timeoutSentinel = Symbol('redis-cache-timeout');

/**
 * Safely decode URL-encoded strings from new URL()
 *
 * `new URL()` percent-encodes reserved characters (e.g. `^` becomes `%5E`)
 * so the raw values must be decoded before being passed to Redis `AUTH`.
 * However, `decodeURIComponent` throw `URIError` if the string contains a literal `%`
 * `safeDecode` decode only maximal runs of valid `%XX` sequences and leave any stray `%` untouched.
 * Takes into account multi-byte UTF-8 sequences like `%C3%A9`
 */
const safeDecode = (value: string): string =>
  value.replaceAll(
    /(?:%[\dA-Fa-f]{2})+/g,
    (sequence) => trySafe(() => decodeURIComponent(sequence)) ?? sequence
  );

/**
 * Race a Redis command against a deadline so cache I/O can never block a request indefinitely.
 * On timeout, logs a warning and resolves to `undefined` so callers degrade to a cache miss.
 * Errors from the underlying Redis command are not caught here — they still reject as usual,
 * and call sites wrap writes in `trySafe` to swallow them.
 */
const raceWithTimeout = async <T>(
  operation: 'GET' | 'SET' | 'DEL',
  key: string,
  promise: Promise<T> | undefined,
  timeoutMs: number
): Promise<T | undefined> => {
  if (!promise) {
    return;
  }

  const abortController = new AbortController();
  const timeoutPromise = setTimeout(timeoutMs, timeoutSentinel, {
    // Cache is best-effort; timeout timers should not keep the process alive.
    ref: false,
    signal: abortController.signal,
  });

  try {
    const result = await Promise.race([promise, timeoutPromise]);
    if (result === timeoutSentinel) {
      cacheConsole.warn(`Redis ${operation} on key "${key}" timed out after ${timeoutMs}ms`);
      return;
    }
    return result;
  } finally {
    // Cancel pending timeout when Redis resolves first, preventing timer accumulation.
    abortController.abort();
  }
};

abstract class RedisCacheBase implements CacheStore {
  readonly client?: RedisClientType | RedisClusterType;

  /**
   * Whether the client is connected and ready to accept commands. When it isn't (no client, or
   * the socket is down/reconnecting), `get` and `set` short-circuit to a miss instead of issuing
   * a command and paying the full {@link raceWithTimeout} deadline on every call — which is what
   * piles up into request latency, and ultimately upstream 499s, during a Redis outage. `delete`
   * is deliberately exempt so invalidations are not silently dropped (see its comment below).
   *
   * Standalone clients expose `isReady` (connected and past handshake); the cluster client only
   * exposes `isOpen`, so fall back to that.
   */
  protected get isClientReady(): boolean {
    const { client } = this;

    if (!client) {
      return false;
    }

    return 'isReady' in client ? client.isReady : client.isOpen;
  }

  async set(key: string, value: string, expire: number = 30 * 60) {
    if (!this.isClientReady) {
      return;
    }

    await raceWithTimeout(
      'SET',
      key,
      this.client?.set(key, value, { EX: expire }),
      redisCacheWriteTimeout
    );
  }

  async get(key: string): Promise<Optional<string>> {
    if (!this.isClientReady) {
      return;
    }

    return conditional(
      await raceWithTimeout('GET', key, this.client?.get(key), redisCacheReadTimeout)
    );
  }

  // Unlike `get`/`set`, `delete` is not gated on `isClientReady`: a dropped invalidation could
  // serve stale data until TTL, so let it queue and flush once the connection recovers. It stays
  // bounded by `raceWithTimeout` and never blocks a request beyond the write deadline.
  async delete(key: string) {
    await raceWithTimeout('DEL', key, this.client?.del(key), redisCacheWriteTimeout);
  }

  async connect() {
    if (this.client) {
      try {
        await this.client.connect();
        const pong = await this.ping();

        if (pong === 'PONG') {
          cacheConsole.info('Connected to Redis');
          return;
        }
      } catch (error: unknown) {
        cacheConsole.error(error);
      }
    }
    cacheConsole.warn('No Redis client initialized, skipping');
  }

  async disconnect() {
    if (this.client) {
      await this.client.disconnect();
      cacheConsole.info('Disconnected from Redis');
    }
  }

  protected getSocketOptions(url?: URL) {
    const certFile = url?.searchParams.get('cert');
    const keyFile = url?.searchParams.get('key');
    const caFile = url?.searchParams.get('certroot');

    return {
      rejectUnauthorized: yes(url?.searchParams.get('reject_unauthorized')),
      tls: url?.protocol === 'rediss',
      cert: certFile ? fs.readFileSync(certFile).toString() : undefined,
      key: keyFile ? fs.readFileSync(keyFile).toString() : undefined,
      ca: caFile ? fs.readFileSync(caFile).toString() : undefined,
      reconnectStrategy: (retries: number, cause: Error) => {
        if ('code' in cause && cause.code === 'SELF_SIGNED_CERT_IN_CHAIN') {
          // This will throw only if reject unauthorized is true (default).
          // Doesn't make sense to retry.
          return false;
        }

        if (retries > 5) {
          return new Error('Too many retries');
        }

        return retries * 500;
      },
    };
  }

  protected abstract ping(): Promise<string | undefined>;
}

export class RedisCache extends RedisCacheBase {
  readonly client?: RedisClientType;

  constructor(redisUrl?: string | undefined) {
    super();

    if (redisUrl) {
      this.client = createClient({
        url: conditional(!yes(redisUrl) && redisUrl),
        socket: this.getSocketOptions(trySafe(() => new URL(redisUrl))),
        // Keep the connection warm with a frequent heartbeat. The interval must stay below the
        // shortest idle timeout on the network path: load balancers, NAT, and firewalls commonly
        // drop idle TCP at 4-5 min, well under Azure Redis' 10 min. A silently dropped socket
        // otherwise surfaces later as `read ETIMEDOUT`.
        // @see https://learn.microsoft.com/en-us/azure/azure-cache-for-redis/cache-best-practices-connection#idle-timeout
        pingInterval: 60 * 1000, // 1 minute
      });

      this.client.on('error', (error) => {
        void appInsights.trackException(error);
        cacheConsole.error(error);
      });
    }
  }

  protected async ping(): Promise<string | undefined> {
    return this.client?.ping();
  }
}

export class RedisClusterCache extends RedisCacheBase {
  readonly client?: RedisClusterType;

  constructor(connectionUrl: URL) {
    super();

    /* eslint-disable @silverhand/fp/no-mutating-methods */
    const hosts = [];
    if (connectionUrl.host) {
      hosts.push(connectionUrl.host);
    }
    hosts.push(...connectionUrl.searchParams.getAll('host'));
    /* eslint-enable @silverhand/fp/no-mutating-methods */

    const rootNodes = hosts.map((host) => {
      return {
        url: 'redis://' + host,
      };
    });

    this.client = createCluster({
      rootNodes,
      useReplicas: true,
      defaults: {
        socket: this.getSocketOptions(connectionUrl),
        username: connectionUrl.username ? safeDecode(connectionUrl.username) : undefined,
        password: connectionUrl.password ? safeDecode(connectionUrl.password) : undefined,
      },
    });

    this.client.on('error', (error) => {
      void appInsights.trackException(error);
      cacheConsole.error(error);
    });
  }

  protected async ping(): Promise<string | undefined> {
    return this.client?.sendCommand(undefined, true, ['PING']);
  }
}

export const redisCacheFactory = (): RedisCacheBase => {
  const { redisUrl } = EnvSet.values;

  if (redisUrl) {
    const url = trySafe(() => new URL(redisUrl));
    if (url && yes(url.searchParams.get('cluster'))) {
      return new RedisClusterCache(url);
    }
  }

  return new RedisCache(redisUrl);
};

export const redisCache = redisCacheFactory();
