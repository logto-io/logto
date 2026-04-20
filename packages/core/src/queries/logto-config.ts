import {
  type jwtCustomizerConfigGuard,
  LogtoConfigs,
  LogtoTenantConfigKey,
  type AdminConsoleData,
  type IdTokenConfig,
  type LogtoConfig,
  type LogtoConfigKey,
  LogtoOidcConfigKey,
  type LogtoJwtTokenKey,
  type OidcPrivateKey,
  oidcPrivateKeyGuard,
  idTokenConfigGuard,
  type LogtoOidcConfigType,
} from '@logto/schemas';
import type { CommonQueryMethods } from '@silverhand/slonik';
import { sql } from '@silverhand/slonik';
import { type z } from 'zod';

import { type WellKnownCache } from '#src/caches/well-known.js';
import { DeletionError } from '#src/errors/SlonikError/index.js';
import { normalizeOidcPrivateKeys } from '#src/libraries/oidc-private-key.js';
import { convertToIdentifiers } from '#src/utils/sql.js';

const { table, fields } = convertToIdentifiers(LogtoConfigs);

export const createLogtoConfigQueries = (
  pool: CommonQueryMethods,
  wellKnownCache: WellKnownCache
) => {
  const upsertPrivateSigningKeys = async (
    executor: CommonQueryMethods,
    privateKeys: OidcPrivateKey[]
  ) =>
    executor.one<{ key: LogtoOidcConfigKey.PrivateKeys; value: unknown }>(sql`
      insert into ${table} (${fields.key}, ${fields.value})
        values (${LogtoOidcConfigKey.PrivateKeys}, ${sql.jsonb(privateKeys)})
        on conflict (${fields.tenantId}, ${fields.key}) do update set ${fields.value} = ${sql.jsonb(
          privateKeys
        )}
        returning ${fields.key}, ${fields.value}
    `);

  const getAdminConsoleConfig = async () =>
    pool.one<{ value: unknown }>(sql`
      select ${fields.value} from ${table}
      where ${fields.key} = ${LogtoTenantConfigKey.AdminConsole}
    `);

  const updateAdminConsoleConfig = async (value: Partial<AdminConsoleData>) =>
    pool.one<{ value: unknown }>(sql`
      update ${table}
      set ${fields.value} = coalesce(${fields.value},'{}'::jsonb) || ${sql.jsonb(value)}
      where ${fields.key} = ${LogtoTenantConfigKey.AdminConsole}
      returning ${fields.value}
    `);

  const getCloudConnectionData = async () =>
    pool.one<{ value: unknown }>(sql`
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

  const updatePrivateSigningKeys = async (privateKeys: OidcPrivateKey[]) =>
    upsertPrivateSigningKeys(pool, privateKeys);

  const getPrivateSigningKeys = async (): Promise<OidcPrivateKey[]> => {
    const { rows } = await getRowsByKeys([LogtoOidcConfigKey.PrivateKeys]);

    return normalizeOidcPrivateKeys(oidcPrivateKeyGuard.array().parse(rows[0]?.value));
  };

  const updatePrivateSigningKeysWithLock = async (
    updater: (privateKeys: OidcPrivateKey[]) => OidcPrivateKey[]
  ): Promise<OidcPrivateKey[]> =>
    pool.transaction(async (transaction) => {
      await transaction.query(sql`
        select ${fields.key}
        from ${table}
        where ${fields.key} = ${LogtoOidcConfigKey.PrivateKeys}
        for update
      `);

      const { rows } = await transaction.query<LogtoConfig>(sql`
        select ${sql.join([fields.key, fields.value], sql`,`)} from ${table}
        where ${fields.key} = ${LogtoOidcConfigKey.PrivateKeys}
      `);

      const privateKeys = normalizeOidcPrivateKeys(
        oidcPrivateKeyGuard.array().parse(rows[0]?.value)
      );
      const updatedPrivateKeys = updater(privateKeys);

      await upsertPrivateSigningKeys(transaction, updatedPrivateKeys);

      return updatedPrivateKeys;
    });

  const updateOidcConfigsByKey = async <
    T extends Exclude<LogtoOidcConfigKey, LogtoOidcConfigKey.PrivateKeys>,
  >(
    key: T,
    value: LogtoOidcConfigType[T]
  ) =>
    pool.query(sql`
      insert into ${table} (${fields.key}, ${fields.value})
        values (${key}, ${sql.jsonb(value)})
        on conflict (${fields.tenantId}, ${fields.key}) do update set ${fields.value} = ${sql.jsonb(value)}
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

  const getIdTokenConfig = wellKnownCache.memoize(async () => {
    const { rows } = await getRowsByKeys([LogtoTenantConfigKey.IdToken]);

    if (rows.length === 0) {
      return null;
    }

    return idTokenConfigGuard.parse(rows[0]?.value);
  }, ['id-token-config']);

  const upsertIdTokenConfig = wellKnownCache.mutate(
    async (value: IdTokenConfig) =>
      pool.one<{ value: unknown }>(sql`
        insert into ${table} (${fields.key}, ${fields.value})
          values (${LogtoTenantConfigKey.IdToken}, ${sql.jsonb(value)})
          on conflict (${fields.tenantId}, ${fields.key}) do update set ${fields.value} = ${sql.jsonb(value)}
          returning ${fields.value}
      `),
    ['id-token-config']
  );

  return {
    getAdminConsoleConfig,
    updateAdminConsoleConfig,
    getCloudConnectionData,
    getRowsByKeys,
    getPrivateSigningKeys,
    updatePrivateSigningKeys,
    updatePrivateSigningKeysWithLock,
    updateOidcConfigsByKey,
    upsertJwtCustomizer,
    deleteJwtCustomizer,
    getIdTokenConfig,
    upsertIdTokenConfig,
  };
};
