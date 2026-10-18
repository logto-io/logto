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
const fallbackCache = new TtlCache<string, WafConfig>();
const cacheKey = 'global';
const { table, fields } = convertToIdentifiers(LogtoConfigs);

const loadWafConfig = async (pool: CommonQueryMethods): Promise<WafConfig> => {
  const row = await pool.maybeOne<{ value: unknown }>(sql`
    select ${fields.value} from ${table}
    where ${fields.tenantId} = ${adminTenantId}
    and ${fields.key} = ${LogtoTenantConfigKey.AdminConsole}
  `);

  const config = row
    ? (adminConsoleDataGuard.parse(row.value).waf ?? defaultWafConfig)
    : defaultWafConfig;
  fallbackCache.set(cacheKey, config);
  return config;
};

export const getWafConfig = async (pool: CommonQueryMethods): Promise<WafConfig> => {
  const cached = cache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const pending = (async () => {
    try {
      return await loadWafConfig(pool);
    } catch {
      return fallbackCache.get(cacheKey) ?? defaultWafConfig;
    }
  })();
  cache.set(cacheKey, pending);
  return pending;
};

export const updateWafConfig = async (pool: CommonQueryMethods, config: WafConfig) => {
  await pool.query(sql`
    update ${table}
    set ${fields.value} = coalesce(${fields.value}, '{}'::jsonb) || ${sql.jsonb({ waf: config })}
    where ${fields.tenantId} = ${adminTenantId}
    and ${fields.key} = ${LogtoTenantConfigKey.AdminConsole}
  `);
  fallbackCache.set(cacheKey, config);
  cache.set(cacheKey, Promise.resolve(config));
  return config;
};

export const invalidateWafConfig = () => {
  cache.delete(cacheKey);
  fallbackCache.delete(cacheKey);
};
