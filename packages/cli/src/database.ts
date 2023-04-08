import type { SchemaLike } from '@logto/schemas';
import { convertToPrimitiveOrSql } from '@logto/shared';
import { assert } from '@silverhand/essentials';
import decamelize from 'decamelize';
import { DatabaseError } from 'pg-protocol';
import { createPool, parseDsn, sql, stringifyDsn } from 'slonik';
import { createInterceptors } from 'slonik-interceptor-preset';

import { ConfigKey, consoleLog, getCliConfigWithPrompt } from './utils.js';

export const defaultDatabaseUrl = 'postgresql://localhost:5432/logto';

export const getDatabaseUrlFromConfig = async () =>
  (await getCliConfigWithPrompt({
    key: ConfigKey.DatabaseUrl,
    readableKey: 'Logto database URL',
    defaultValue: defaultDatabaseUrl,
  })) ?? '';

export const createPoolFromConfig = async () => {
  const databaseUrl = await getDatabaseUrlFromConfig();
  assert(parseDsn(databaseUrl).databaseName, new Error('Database name is required in URL'));

  return createPool(databaseUrl, {
    interceptors: createInterceptors(),
  });
};

/**
 * Create a database pool with the URL in CLI config; if no URL found, prompt to input.
 * If the given database does not exists, it will try to create a new database by connecting to the maintenance database `postgres`.
 *
 * @returns A new database pool with the database URL in config.
 */
export const createPoolAndDatabaseIfNeeded = async () => {
  try {
    return await createPoolFromConfig();
  } catch (error: unknown) {
    // Database does not exist, try to create one
    // https://www.postgresql.org/docs/14/errcodes-appendix.html
    if (!(error instanceof DatabaseError && error.code === '3D000')) {
      consoleLog.fatal(error);
    }

    const databaseUrl = await getDatabaseUrlFromConfig();
    const dsn = parseDsn(databaseUrl);
    // It's ok to fall back to '?' since:
    // - Database name is required to connect in the previous pool
    // - It will throw error when creating database using '?'
    const databaseName = dsn.databaseName ?? '?';
    const maintenancePool = await createPool(stringifyDsn({ ...dsn, databaseName: 'postgres' }), {
      interceptors: createInterceptors(),
    });
    await maintenancePool.query(sql`
      create database ${sql.identifier([databaseName])}
        with
        encoding = 'UTF8'
        connection_limit = -1;
    `);
    await maintenancePool.end();

    consoleLog.succeed(`Created database ${databaseName}`);

    return createPoolFromConfig();
  }
};

export const insertInto = <T extends SchemaLike>(object: T, table: string) => {
  const keys = Object.keys(object);

  return sql`
    insert into ${sql.identifier([table])}
    (${sql.join(
      keys.map((key) => sql.identifier([decamelize(key)])),
      sql`, `
    )})
    values (${sql.join(
      keys.map((key) => convertToPrimitiveOrSql(key, object[key] ?? null)),
      sql`, `
    )})
  `;
};
