import { SchemaLike, GeneratedSchema } from '@logto/schemas';
import { notFalsy, Truthy } from '@silverhand/essentials';
import { DatabasePoolType, sql } from 'slonik';

import { isKeyOf } from '@/utils/schema';

import { conditionalSql, convertToIdentifiers, convertToPrimitiveOrSql } from './utils';

export type FindManyData<Schema extends SchemaLike> = {
  where?: Partial<Schema>;
  limit?: number;
  offset?: number;
};

export const buildFindMany = <Schema extends SchemaLike, ReturnType extends SchemaLike>(
  pool: DatabasePoolType,
  schema: GeneratedSchema<Schema>
) => {
  const { table, fields } = convertToIdentifiers(schema);
  const isKeyOfSchema = isKeyOf(schema);
  const connectKeyValueWithEqualSign = (data: Partial<Schema>) =>
    Object.entries(data)
      .map(
        ([key, value]) =>
          isKeyOfSchema(key) && sql`${fields[key]}=${convertToPrimitiveOrSql(key, value)}`
      )
      .filter((value): value is Truthy<typeof value> => notFalsy(value));

  return async ({ where, limit, offset }: FindManyData<Schema> = {}) => {
    return pool.any<ReturnType>(sql`
      select ${sql.join(Object.values(fields), sql`, `)}
      from ${table}
      ${conditionalSql(
        where,
        (where) => sql`where ${sql.join(connectKeyValueWithEqualSign(where), sql` and `)}`
      )}
      ${conditionalSql(limit, (limit) => sql`limit ${limit}`)}
      ${conditionalSql(offset, (offset) => sql`offset ${offset}`)}
    `);
  };
};
