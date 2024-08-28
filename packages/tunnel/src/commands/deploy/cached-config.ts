import { existsSync, mkdirSync } from 'node:fs';
import { writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import type { Config } from './types.js';

const basePath = os.homedir() || process.cwd();
const logtoConfigPath = path.join(basePath, '.logto');
const configFile = path.join(logtoConfigPath, 'config.json');

export class CachedConfig {
  static async load(): Promise<CachedConfig> {
    if (!existsSync(logtoConfigPath)) {
      mkdirSync(logtoConfigPath);
    }
    if (!existsSync(configFile)) {
      await writeFile(configFile, '{}');
    }

    // eslint-disable-next-line no-restricted-syntax
    const { default: config } = (await import(configFile, { assert: { type: 'json' } })) as {
      default: Partial<Config>;
    };

    return new CachedConfig(config);
  }

  private readonly config: Config = {};
  private constructor(config: Config) {
    this.config = config;
  }

  async get(key: keyof Config): Promise<string | undefined> {
    return this.config[key];
  }

  async set(key: keyof Config, value: string): Promise<void> {
    this.config[key] = value;
    await this.save();
  }

  async save(): Promise<void> {
    await writeFile(configFile, JSON.stringify(this.config, undefined, 2));
  }
}
