import { GeneratedSchema, SchemaLike } from '@logto/schemas';
import { notFalsy } from '@silverhand/essentials';
import { DatabasePoolType, sql } from 'slonik';

import { isKeyOf } from '@/utils/schema';

import { FindManyData, OrderBy } from './types';
import { conditionalSql, convertToIdentifiers, convertToPrimitiveOrSql } from './utils';

export const buildFindMany = <Schema extends SchemaLike, ReturnType extends SchemaLike>(
  pool: DatabasePoolType,
  schema: GeneratedSchema<Schema>
) => {
  const { table, fields } = convertToIdentifiers(schema);
  const isKeyOfSchema = isKeyOf(schema);
  const connectKeyValueWithEqualSign = (partialSchema: Partial<Schema>) =>
    Object.entries(partialSchema)
      .map(
        ([key, value]) =>
          isKeyOfSchema(key) && sql`${fields[key]}=${convertToPrimitiveOrSql(key, value)}`
      )
      .filter((entry) => notFalsy(entry));

  const buildOrderBy = (orderBySchema: OrderBy<Schema>) =>
    Object.entries(orderBySchema)
      .map(([key, order]) => {
        if (!isKeyOfSchema(key)) {
          return false;
        }

        const orderDirection = order === 'asc' ? sql`asc` : sql`desc`;

        return sql`${fields[key]} ${orderDirection}`;
      })
      .filter((entry) => notFalsy(entry));

  return async ({ where, orderBy, limit, offset }: FindManyData<Schema> = {}) =>
    pool.any<ReturnType>(sql`
      select ${sql.join(Object.values(fields), sql`, `)}
      from ${table}
      ${conditionalSql(
        where,
        (where) => sql`where ${sql.join(connectKeyValueWithEqualSign(where), sql` and `)}`
      )}
      ${conditionalSql(
        orderBy,
        (orderBy) => sql`order by ${sql.join(buildOrderBy(orderBy), sql`, `)}`
      )}
      ${conditionalSql(limit, (limit) => sql`limit ${limit}`)}
      ${conditionalSql(offset, (offset) => sql`offset ${offset}`)}
    `);
};
