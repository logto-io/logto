import { SchemaLike, SchemaValue, SchemaValuePrimitive } from '@logto/schemas';
import chalk from 'chalk';
import decamelize from 'decamelize';
import { createPool, IdentifierSqlToken, sql, SqlToken } from 'slonik';
import { createInterceptors } from 'slonik-interceptor-preset';

import { getConfig } from './config';
import { log } from './utilities';

export const getDatabaseUrlFromConfig = async () => {
  const { databaseUrl } = await getConfig();

  if (!databaseUrl) {
    log.error(
      `No database URL configured. Set it via ${chalk.green('database set-url')} command first.`
    );
  }

  return databaseUrl;
};

export const createPoolFromConfig = async () => {
  const databaseUrl = await getDatabaseUrlFromConfig();

  return createPool(databaseUrl, {
    interceptors: createInterceptors(),
  });
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
