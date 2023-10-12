import type {
  AdminConsoleData,
  LogtoConfig,
  LogtoConfigKey,
  LogtoOidcConfigKey,
  OidcConfigKey,
} from '@logto/schemas';
import { LogtoTenantConfigKey, LogtoConfigs } from '@logto/schemas';
import { convertToIdentifiers } from '@logto/shared';
import type { CommonQueryMethods } from 'slonik';
import { sql } from 'slonik';

import { WellKnownCache } from '#src/caches/well-known.js';

const { table, fields } = convertToIdentifiers(LogtoConfigs);

export const createLogtoConfigQueries = (
  pool: CommonQueryMethods,
  wellKnownCache?: WellKnownCache
) => {
  const getAdminConsoleConfig = async () =>
    pool.one<Record<string, unknown>>(sql`
      select ${fields.value} from ${table}
      where ${fields.key} = ${LogtoTenantConfigKey.AdminConsole}
    `);

  const updateAdminConsoleConfig = async (value: Partial<AdminConsoleData>) =>
    pool.one<Record<string, unknown>>(sql`
      update ${table}
      set ${fields.value} = coalesce(${fields.value},'{}'::jsonb) || ${sql.jsonb(value)}
      where ${fields.key} = ${LogtoTenantConfigKey.AdminConsole}
      returning ${fields.value}
    `);

  const getCloudConnectionData = async () =>
    pool.one<Record<string, unknown>>(sql`
      select ${fields.value} from ${table}
      where ${fields.key} = ${LogtoTenantConfigKey.CloudConnection}
    `);

  const getRowsByKeys = async (keys: LogtoConfigKey[]) =>
    pool.query<LogtoConfig>(sql`
      select ${sql.join([fields.key, fields.value], sql`,`)} from ${table}
        where ${fields.key} in (${sql.join(keys, sql`,`)})
    `);

  const updateOidcConfigsByKey = async (key: LogtoOidcConfigKey, value: OidcConfigKey[]) => {
    // Set a expiration timestamp in redis cache, and check it before returning the tenant LRU cache. This helps
    // determine when to invalidate the cached tenant and force a in-place rolling reload of the OIDC provider.
    void wellKnownCache?.set('tenant-cache-expires-at', WellKnownCache.defaultKey, Date.now());

    return pool.query(sql`
      update ${table}
      set ${fields.value} = ${sql.jsonb(value)}
      where ${fields.key} = ${key}
      returning *
    `);
  };

  return {
    getAdminConsoleConfig,
    updateAdminConsoleConfig,
    getCloudConnectionData,
    getRowsByKeys,
    updateOidcConfigsByKey,
  };
};
