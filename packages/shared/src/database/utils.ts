import { SchemaValuePrimitive, SchemaValue } from '@logto/schemas';
import { Falsy, notFalsy } from '@silverhand/essentials';
import dayjs from 'dayjs';
import { sql, SqlSqlToken, SqlToken, QueryResult, IdentifierSqlToken } from 'slonik';

import { FieldIdentifiers, Table } from './types';

export const conditionalSql = <T>(value: T, buildSql: (value: Exclude<T, Falsy>) => SqlSqlToken) =>
  notFalsy(value) ? buildSql(value) : sql``;

export const autoSetFields = Object.freeze(['createdAt', 'updatedAt'] as const);
export type OmitAutoSetFields<T> = Omit<T, typeof autoSetFields[number]>;
export type ExcludeAutoSetFields<T> = Exclude<T, typeof autoSetFields[number]>;
export const excludeAutoSetFields = <T extends string>(fields: readonly T[]) =>
  Object.freeze(
    fields.filter(
      (field): field is ExcludeAutoSetFields<T> =>
        // Read only string arrays
        // eslint-disable-next-line no-restricted-syntax
        !(autoSetFields as readonly string[]).includes(field)
    )
  );

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
  value: NonNullable<SchemaValue> | null
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

export const convertToTimestamp = (time = dayjs()) => sql`to_timestamp(${time.valueOf() / 1000})`;

export const manyRows = async <T>(query: Promise<QueryResult<T>>): Promise<readonly T[]> => {
  const { rows } = await query;

  return rows;
};
