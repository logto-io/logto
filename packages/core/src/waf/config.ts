import {
  adminConsoleDataGuard,
  adminTenantId,
  defaultWafConfig,
  LogtoConfigs,
  LogtoTenantConfigKey,
  type WafConfig,
} from '@logto/schemas';
import { TtlCache } from '@logto/shared';
import { type CommonQueryMethods, sql } from '@silverhand/slonik';

import { convertToIdentifiers } from '#src/utils/sql.js';

const cache = new TtlCache<string, Promise<WafConfig>>(5000);
const cacheKey = 'global';
const { table, fields } = convertToIdentifiers(LogtoConfigs);

const loadWafConfig = async (pool: CommonQueryMethods): Promise<WafConfig> => {
  const row = await pool.maybeOne<{ value: unknown }>(sql`
    select ${fields.value} from ${table}
    where ${fields.tenantId} = ${adminTenantId}
    and ${fields.key} = ${LogtoTenantConfigKey.AdminConsole}
  `);

  return row ? (adminConsoleDataGuard.parse(row.value).waf ?? defaultWafConfig) : defaultWafConfig;
};

export const getWafConfig = async (pool: CommonQueryMethods): Promise<WafConfig> => {
  const cached = cache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const pending = (async () => {
    try {
      return await loadWafConfig(pool);
    } catch (error: unknown) {
      cache.delete(cacheKey);
      throw error;
    }
  })();
  cache.set(cacheKey, pending);
  return pending;
};

export const invalidateWafConfig = () => cache.delete(cacheKey);
