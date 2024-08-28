import {
  CloudflareKey,
  type HostnameProviderData,
  type StorageProviderData,
  hostnameProviderDataGuard,
  storageProviderDataGuard,
  StorageProviderKey,
  type SystemKey,
  type ProtectedAppConfigProviderData,
  protectedAppConfigProviderDataGuard,
} from '@logto/schemas';
import type { CommonQueryMethods } from '@silverhand/slonik';
import { type ZodType } from 'zod';

import { createSystemsQuery } from '#src/queries/system.js';
import { devConsole } from '#src/utils/console.js';

export default class SystemContext {
  static shared = new SystemContext();
  public storageProviderConfig?: StorageProviderData;
  public hostnameProviderConfig?: HostnameProviderData;
  public protectedAppConfigProviderConfig?: ProtectedAppConfigProviderData;
  public protectedAppHostnameProviderConfig?: HostnameProviderData;

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
        this.protectedAppConfigProviderConfig = await this.loadConfig(
          pool,
          CloudflareKey.ProtectedAppConfigProvider,
          protectedAppConfigProviderDataGuard
        );
      })(),
      (async () => {
        this.protectedAppHostnameProviderConfig = await this.loadConfig(
          pool,
          CloudflareKey.ProtectedAppHostnameProvider,
          hostnameProviderDataGuard
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
      devConsole.error(`Failed to parse ${key} config:`, result.error);

      return;
    }

    return result.data;
  }
}
