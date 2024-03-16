import {
  type jwtCustomizerConfigGuard,
  LogtoTenantConfigKey,
  LogtoConfigs,
  type AdminConsoleData,
  type LogtoConfig,
  type LogtoConfigKey,
  type LogtoOidcConfigKey,
  type OidcConfigKey,
  type LogtoJwtTokenKey,
} from '@logto/schemas';
import type { CommonQueryMethods } from '@silverhand/slonik';
import { sql } from '@silverhand/slonik';
import { type z } from 'zod';

import { DeletionError } from '#src/errors/SlonikError/index.js';
import { convertToIdentifiers } from '#src/utils/sql.js';

const { table, fields } = convertToIdentifiers(LogtoConfigs);

export const createLogtoConfigQueries = (pool: CommonQueryMethods) => {
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

  const deleteRowByKey = async (key: LogtoConfigKey) => {
    const { rowCount } = await pool.query(sql`
      delete from ${table}
      where ${fields.key}=${key}
    `);

    if (rowCount < 1) {
      throw new DeletionError(LogtoConfigs.table, key);
    }
  };

  const updateOidcConfigsByKey = async (key: LogtoOidcConfigKey, value: OidcConfigKey[]) =>
    pool.query(sql`
      update ${table}
      set ${fields.value} = ${sql.jsonb(value)}
      where ${fields.key} = ${key}
      returning *
    `);

  // Can not narrow down the type of value if we utilize `buildInsertIntoWithPool` method.
  const upsertJwtCustomizer = async <T extends LogtoJwtTokenKey>(
    key: T,
    value: z.infer<(typeof jwtCustomizerConfigGuard)[T]>
  ) =>
    pool.one<{ key: T; value: Record<string, string> }>(
      sql`
        insert into ${table} (${fields.key}, ${fields.value})
          values (${key}, ${sql.jsonb(value)})
          on conflict (${fields.tenantId}, ${fields.key}) do update set ${
            fields.value
          } = ${sql.jsonb(value)}
          returning *
      `
    );

  const deleteJwtCustomizer = async <T extends LogtoJwtTokenKey>(key: T) => deleteRowByKey(key);

  return {
    getAdminConsoleConfig,
    updateAdminConsoleConfig,
    getCloudConnectionData,
    getRowsByKeys,
    updateOidcConfigsByKey,
    upsertJwtCustomizer,
    deleteJwtCustomizer,
  };
};
