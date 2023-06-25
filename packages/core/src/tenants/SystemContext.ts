import {
  CloudflareKey,
  EmailServiceProviderKey,
  type HostnameProviderData,
  type StorageProviderData,
  type EmailServiceData,
  hostnameProviderDataGuard,
  storageProviderDataGuard,
  emailServiceDataGuard,
  StorageProviderKey,
  type SystemKey,
} from '@logto/schemas';
import type { CommonQueryMethods } from 'slonik';
import { type ZodType } from 'zod';

import { createSystemsQuery } from '#src/queries/system.js';
import { consoleLog } from '#src/utils/console.js';

export default class SystemContext {
  static shared = new SystemContext();
  public storageProviderConfig?: StorageProviderData;
  public hostnameProviderConfig?: HostnameProviderData;
  public emailServiceProviderConfig?: EmailServiceData;

  async loadProviderConfigs(pool: CommonQueryMethods) {
    await Promise.all([
      (async () => {
        this.storageProviderConfig = await this.loadConfig(
          pool,
          StorageProviderKey.StorageProvider,
          storageProviderDataGuard
        );
      })(),
      (async () => {
        this.hostnameProviderConfig = await this.loadConfig(
          pool,
          CloudflareKey.HostnameProvider,
          hostnameProviderDataGuard
        );
      })(),
      (async () => {
        this.emailServiceProviderConfig = await this.loadConfig(
          pool,
          EmailServiceProviderKey.EmailServiceProvider,
          emailServiceDataGuard
        );
      })(),
    ]);
  }

  private async loadConfig<T>(
    pool: CommonQueryMethods,
    key: SystemKey,
    guard: ZodType<T>
  ): Promise<T | undefined> {
    const { findSystemByKey } = createSystemsQuery(pool);
    const record = await findSystemByKey(key);

    if (!record) {
      return;
    }

    const result = guard.safeParse(record.value);

    if (!result.success) {
      consoleLog.error(`Failed to parse ${key} config:`, result.error);

      return;
    }

    return result.data;
  }
}
