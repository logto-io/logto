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
        appInsights.trackException(error);
      });
    }
  }

  async set(key: string, value: string) {
    await this.client?.set(key, value, {
      EX: 30 * 60 /* 30 minutes */,
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
      consoleLog.info('[CACHE] Connected to Redis');
    } else {
      consoleLog.warn('[CACHE] No Redis client initialized, skipping');
    }
  }

  async disconnect() {
    if (this.client) {
      await this.client.disconnect();
      consoleLog.info('[CACHE] Disconnected from Redis');
    }
  }
}

export const redisCache = new RedisCache();
