import { Falsy, notFalsy } from '@logto/essentials';
import { SchemaValuePrimitive, SchemaValue } from '@logto/schemas';
import { sql, SqlSqlTokenType } from 'slonik';
import { FieldIdentifiers, Table } from './types';

export const conditionalSql = <T>(
  value: T,
  buildSql: (value: Exclude<T, Falsy>) => SqlSqlTokenType
) => (notFalsy(value) ? buildSql(value) : sql``);

export const autoSetFields = Object.freeze(['createdAt', 'updatedAt'] as const);
// `Except` type will require omit fields to be the key of given type
// eslint-disable-next-line @typescript-eslint/ban-types
export type OmitAutoSetFields<T> = Omit<T, typeof autoSetFields[number]>;
export type ExcludeAutoSetFields<T> = Exclude<T, typeof autoSetFields[number]>;
export const excludeAutoSetFields = <T extends string>(fields: readonly T[]) =>
  Object.freeze(
    fields.filter(
      (field): field is ExcludeAutoSetFields<T> =>
        !(autoSetFields as readonly string[]).includes(field)
    )
  );

export const convertToPrimitive = (value: SchemaValue): SchemaValuePrimitive => {
  if (value === null) {
    return value;
  }

  if (typeof value === 'object') {
    return JSON.stringify(value);
  }

  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return value;
  }

  throw new Error(`Cannot convert to primitive from ${typeof value}`);
};

export const convertToIdentifiers = <T extends Table>(
  { table, fields }: T,
  withPrefix = false
) => ({
  table: sql.identifier([table]),
  fields: Object.entries<string>(fields).reduce(
    (previous, [key, value]) => ({
      ...previous,
      [key]: sql.identifier(withPrefix ? [table, value] : [value]),
    }),
    // eslint-disable-next-line @typescript-eslint/prefer-reduce-type-parameter
    {} as FieldIdentifiers<keyof T['fields']>
  ),
});
