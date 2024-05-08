import { appInsights } from '@logto/app-insights/node';
import { type Optional, conditional, yes } from '@silverhand/essentials';
import { createClient, type RedisClientType } from 'redis';

import { EnvSet } from '#src/env-set/index.js';
import { consoleLog } from '#src/utils/console.js';

import { type CacheStore } from './types.js';

export class RedisCache implements CacheStore {
  readonly client?: RedisClientType;

  constructor() {
    const { redisUrl } = EnvSet.values;

    if (redisUrl) {
      this.client = createClient({
        url: conditional(!yes(redisUrl) && redisUrl),
      });
      this.client.on('error', (error) => {
        consoleLog.error('Redis error', error);
        void appInsights.trackException(error);
      });
    }
  }

  async set(key: string, value: string, expire: number = 30 * 60) {
    await this.client?.set(key, value, {
      EX: expire,
    });
  }

  async get(key: string): Promise<Optional<string>> {
    return conditional(await this.client?.get(key));
  }

  async delete(key: string) {
    await this.client?.del(key);
  }

  async connect() {
    if (this.client) {
      await this.client.connect();
      const pong = await this.client.ping();

      if (pong === 'PONG') {
        consoleLog.info('[CACHE] Connected to Redis');
        return;
      }
    }
    consoleLog.warn('[CACHE] No Redis client initialized, skipping');
  }

  async disconnect() {
    if (this.client) {
      await this.client.disconnect();
      consoleLog.info('[CACHE] Disconnected from Redis');
    }
  }
}

export const redisCache = new RedisCache();
