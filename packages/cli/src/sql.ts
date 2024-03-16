/**
 * @fileoverview Copied from `@logto/core`. Originally we put them in `@logto/shared` but it
 * requires `slonik` which makes the package too heavy.
 *
 * Since `@logto/cli` only use these functions in a stable manner, we copy them here for now. If
 * the number of functions grows, we should consider moving them to a separate package. (Actually,
 * we should remove the dependency on `slonik` at all, and this may not be an issue then.)
 */

import { type SchemaValue, type SchemaValuePrimitive, type Table } from '@logto/shared';
import { type IdentifierSqlToken, type SqlToken, sql } from '@silverhand/slonik';

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
