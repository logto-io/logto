import { SchemaLike, SchemaValue, SchemaValuePrimitive } from '@logto/schemas';
import chalk from 'chalk';
import decamelize from 'decamelize';
import inquirer from 'inquirer';
import { createPool, IdentifierSqlToken, parseDsn, sql, SqlToken, stringifyDsn } from 'slonik';
import { createInterceptors } from 'slonik-interceptor-preset';
import { z } from 'zod';

import { getConfig, patchConfig } from './config';
import { log } from './utilities';

export const defaultDatabaseUrl = 'postgresql://localhost:5432/logto';

export const getDatabaseUrlFromConfig = async () => {
  const { databaseUrl } = await getConfig();

  if (!databaseUrl) {
    const { value } = await inquirer
      .prompt<{ value: string }>({
        type: 'input',
        name: 'value',
        message: 'Enter your Logto database URL',
        default: defaultDatabaseUrl,
      })
      .catch(async (error) => {
        if (error.isTtyError) {
          log.error(
            `No database URL configured. Set it via ${chalk.green(
              'database set-url'
            )} command first.`
          );
        }

        // The type definition does not give us type except `any`, throw it directly will honor the original behavior.
        // eslint-disable-next-line @typescript-eslint/no-throw-literal
        throw error;
      });
    await patchConfig({ databaseUrl: value });

    return value;
  }

  return databaseUrl;
};

export const createPoolFromConfig = async () => {
  const databaseUrl = await getDatabaseUrlFromConfig();

  return createPool(databaseUrl, {
    interceptors: createInterceptors(),
  });
};

/**
 * Create a database pool with the database URL in config.
 * If the given database does not exists, it will try to create a new database by connecting to the maintenance database `postgres`.
 *
 * @returns A new database pool with the database URL in config.
 */
export const createPoolAndDatabaseIfNeeded = async () => {
  try {
    return await createPoolFromConfig();
  } catch (error: unknown) {
    const result = z.object({ code: z.string() }).safeParse(error);

    // Database does not exist, try to create one
    // https://www.postgresql.org/docs/14/errcodes-appendix.html
    if (!(result.success && result.data.code === '3D000')) {
      log.error(error);
    }

    const databaseUrl = await getDatabaseUrlFromConfig();
    const dsn = parseDsn(databaseUrl);
    // It's ok to fall back to '?' since:
    // - Database name is required to connect in the previous pool
    // - It will throw error when creating database using '?'
    const databaseName = dsn.databaseName ?? '?';
    const maintenancePool = await createPool(stringifyDsn({ ...dsn, databaseName: 'postgres' }));
    await maintenancePool.query(sql`
      create database ${sql.identifier([databaseName])}
        with
        encoding = 'UTF8'
        connection_limit = -1;
    `);
    await maintenancePool.end();

    log.info(`${chalk.green('✔')} Created database ${databaseName}`);

    return createPoolFromConfig();
  }
};

// TODO: Move database utils to `core-kit`
export type Table = { table: string; fields: Record<string, string> };
export type FieldIdentifiers<Key extends string | number | symbol> = {
  [key in Key]: IdentifierSqlToken;
};

export const convertToIdentifiers = <T extends Table>({ table, fields }: T, withPrefix = false) => {
  const fieldsIdentifiers = Object.entries<string>(fields).map<
    [keyof T['fields'], IdentifierSqlToken]
  >(([key, value]) => [key, sql.identifier(withPrefix ? [table, value] : [value])]);

  return {
    table: sql.identifier([table]),
    // Key value inferred from the original fields directly
    // eslint-disable-next-line no-restricted-syntax
    fields: Object.fromEntries(fieldsIdentifiers) as FieldIdentifiers<keyof T['fields']>,
  };
};

/**
 * Note `undefined` is removed from the acceptable list,
 * since you should NOT call this function if ignoring the field is the desired behavior.
 * Calling this function with `null` means an explicit `null` setting in database is expected.
 * @param key The key of value. Will treat as `timestamp` if it ends with `_at` or 'At' AND value is a number;
 * @param value The value to convert.
 * @returns A primitive that can be saved into database.
 */
// eslint-disable-next-line complexity
export const convertToPrimitiveOrSql = (
  key: string,
  // eslint-disable-next-line @typescript-eslint/ban-types
  value: NonNullable<SchemaValue> | null
  // eslint-disable-next-line @typescript-eslint/ban-types
): NonNullable<SchemaValuePrimitive> | SqlToken | null => {
  if (value === null) {
    return null;
  }

  if (typeof value === 'object') {
    return JSON.stringify(value);
  }

  if (['_at', 'At'].some((value) => key.endsWith(value)) && typeof value === 'number') {
    return sql`to_timestamp(${value}::double precision / 1000)`;
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'string') {
    if (value === '') {
      return null;
    }

    return value;
  }

  throw new Error(`Cannot convert ${key} to primitive`);
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
