import type { StorageProviderData } from '@logto/schemas';
import { storageProviderDataGuard, StorageProviderKey, Systems } from '@logto/schemas';
import { convertToIdentifiers } from '@logto/shared';
import type { CommonQueryMethods } from 'slonik';
import { sql } from 'slonik';

import { consoleLog } from '#src/utils/console.js';

const { table, fields } = convertToIdentifiers(Systems);

export default class SystemContext {
  static shared = new SystemContext();
  public storageProviderConfig: StorageProviderData | undefined;

  async loadStorageProviderConfig(pool: CommonQueryMethods) {
    const record = await pool.maybeOne<Record<string, unknown>>(sql`
      select ${fields.value} from ${table}
      where ${fields.key} = ${StorageProviderKey.StorageProvider}
    `);

    if (!record) {
      return;
    }

    const result = storageProviderDataGuard.safeParse(record.value);

    if (!result.success) {
      consoleLog.error('Failed to parse storage provider config:', result.error);

      return;
    }

    this.storageProviderConfig = result.data;
  }
}
