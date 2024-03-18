import type { SchemaLike } from '@logto/schemas';
import { assert } from '@silverhand/essentials';
import {
  createPool,
  parseDsn,
  sql,
  stringifyDsn,
  createInterceptorsPreset,
} from '@silverhand/slonik';
import decamelize from 'decamelize';
import { DatabaseError } from 'pg-protocol';

import { convertToPrimitiveOrSql } from './sql.js';
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
    interceptors: createInterceptorsPreset(),
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
      interceptors: createInterceptorsPreset(),
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

/**
 * Build an `insert into` query from the given payload. If the payload is an array, it will insert
 * multiple rows.
 */
export const insertInto = <T extends SchemaLike<string>>(payload: T | T[], table: string) => {
  const first = Array.isArray(payload) ? payload[0] : payload;

  if (!first) {
    throw new Error('Payload cannot be empty');
  }

  const keys = Object.keys(first);
  const values = Array.isArray(payload) ? payload : [payload];

  return sql`
    insert into ${sql.identifier([table])}
    (${sql.join(
      keys.map((key) => sql.identifier([decamelize(key)])),
      sql`, `
    )})
    values ${sql.join(
      values.map(
        (object) =>
          sql`(${sql.join(
            keys.map((key) => convertToPrimitiveOrSql(key, object[key] ?? null)),
            sql`, `
          )})`
      ),
      sql`, `
    )}
  `;
};
