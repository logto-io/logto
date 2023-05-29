import {
  CloudflareKey,
  type HostnameProviderData,
  type StorageProviderData,
  hostnameProviderDataGuard,
  storageProviderDataGuard,
  StorageProviderKey,
  Systems,
  type SystemKey,
} from '@logto/schemas';
import { convertToIdentifiers } from '@logto/shared';
import type { CommonQueryMethods } from 'slonik';
import { sql } from 'slonik';
import { type ZodType } from 'zod';

import { consoleLog } from '#src/utils/console.js';

const { table, fields } = convertToIdentifiers(Systems);

export default class SystemContext {
  static shared = new SystemContext();
  public storageProviderConfig: StorageProviderData | undefined;
  public hostnameProviderConfig: HostnameProviderData | undefined;

  async loadProviderConfigs(pool: CommonQueryMethods) {
    this.storageProviderConfig = await this.loadConfig<StorageProviderData>(
      pool,
      StorageProviderKey.StorageProvider,
      storageProviderDataGuard
    );
    this.hostnameProviderConfig = await this.loadConfig<HostnameProviderData>(
      pool,
      CloudflareKey.HostnameProvider,
      hostnameProviderDataGuard
    );
  }

  private async loadConfig<T>(
    pool: CommonQueryMethods,
    key: SystemKey,
    guard: ZodType
  ): Promise<T | undefined> {
    const record = await pool.maybeOne<Record<string, unknown>>(sql`
      select ${fields.value} from ${table}
      where ${fields.key} = ${key}
    `);

    if (!record) {
      return;
    }

    const result = guard.safeParse(record.value);

    if (!result.success) {
      consoleLog.error('Failed to parse cloudflare hostname provider config:', result.error);

      return;
    }

    // eslint-disable-next-line no-restricted-syntax
    return result.data as T;
  }
}
