import type {
  AdminConsoleData,
  LogtoConfig,
  LogtoConfigKey,
  LogtoSamlSigningKeyPair,
} from '@logto/schemas';
import { LogtoTenantConfigKey, LogtoConfigs, LogtoSamlConfigKey } from '@logto/schemas';
import { convertToIdentifiers } from '@logto/shared';
import type { CommonQueryMethods } from 'slonik';
import { sql } from 'slonik';

import { buildInsertIntoWithPool } from '#src/database/insert-into.js';

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

  const getSamlSigningKeyPair = async () => {
    const result = await pool.maybeOne<{ value: LogtoSamlSigningKeyPair }>(sql`
      select ${fields.value} from ${table}
      where ${fields.key} = ${LogtoSamlConfigKey.SigningKeyPair}
    `);

    return result ? result.value : undefined;
  };

  const insertSamlSigningKeyPair = async (keyPair: LogtoSamlSigningKeyPair) =>
    buildInsertIntoWithPool(pool)(LogtoConfigs, { returning: true })({
      key: LogtoSamlConfigKey.SigningKeyPair,
      value: keyPair,
    });

  const getRowsByKeys = async (keys: LogtoConfigKey[]) =>
    pool.query<LogtoConfig>(sql`
      select ${sql.join([fields.key, fields.value], sql`,`)} from ${table}
        where ${fields.key} in (${sql.join(keys, sql`,`)})
    `);

  return {
    getAdminConsoleConfig,
    updateAdminConsoleConfig,
    getCloudConnectionData,
    getRowsByKeys,
    getSamlSigningKeyPair,
    insertSamlSigningKeyPair,
  };
};
