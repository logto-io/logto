import type { SchemaValue, SchemaValuePrimitive, Table } from '@logto/shared';
import type { Falsy } from '@silverhand/essentials';
import { notFalsy } from '@silverhand/essentials';
import type { SqlSqlToken, SqlToken, IdentifierSqlToken, QueryResult } from '@silverhand/slonik';
import { sql } from '@silverhand/slonik';

export const conditionalSql = <T>(value: T, buildSql: (value: Exclude<T, Falsy>) => SqlSqlToken) =>
  notFalsy(value) ? buildSql(value) : sql``;

export const conditionalArraySql = <T>(
  value: T[],
  buildSql: (value: Exclude<T[], Falsy>) => SqlSqlToken
) => (value.length > 0 ? buildSql(value) : sql``);

export const autoSetFields = Object.freeze(['tenantId', 'createdAt', 'updatedAt'] as const);
export type OmitAutoSetFields<T> = Omit<T, (typeof autoSetFields)[number]>;
type ExcludeAutoSetFields<T> = Exclude<T, (typeof autoSetFields)[number]>;

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
export const convertToPrimitiveOrSql = (
  key: string,
  value: SchemaValue
  // eslint-disable-next-line @typescript-eslint/ban-types
): NonNullable<SchemaValuePrimitive> | SqlToken | null => {
  if (value === null) {
    return null;
  }

  if (typeof value === 'object') {
    return JSON.stringify(value);
  }

  if (
    (['_at', 'At'].some((value) => key.endsWith(value)) || key === 'date') &&
    typeof value === 'number'
  ) {
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

type FieldIdentifiers<Key extends string> = {
  [key in Key]: IdentifierSqlToken;
};

export const convertToIdentifiers = <Key extends string>(
  { table, fields }: Table<Key>,
  withPrefix = false
) => {
  const fieldsIdentifiers = Object.entries<string>(fields).map<[Key, IdentifierSqlToken]>(
    // eslint-disable-next-line no-restricted-syntax -- Object.entries can only return string keys
    ([key, value]) => [key as Key, sql.identifier(withPrefix ? [table, value] : [value])]
  );

  return {
    table: sql.identifier([table]),
    // Key value inferred from the original fields directly
    // eslint-disable-next-line no-restricted-syntax
    fields: Object.fromEntries(fieldsIdentifiers) as FieldIdentifiers<Key>,
  };
};

export const convertToTimestamp = (time = new Date()) =>
  sql`to_timestamp(${time.valueOf() / 1000})`;

export const manyRows = async <T>(query: Promise<QueryResult<T>>): Promise<readonly T[]> => {
  const { rows } = await query;

  return rows;
};
