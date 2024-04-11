import { type GeneratedSchema, type SchemaLike } from '@logto/schemas';
import { sql, type CommonQueryMethods } from '@silverhand/slonik';

import { conditionalSql, convertToIdentifiers, manyRows } from '#src/utils/sql.js';

import { buildSearchSql, expandFields, type SearchOptions } from './utils.js';

export const buildFindAllEntitiesWithPool =
  (pool: CommonQueryMethods) =>
  <
    Keys extends string,
    CreateSchema extends Partial<SchemaLike<Keys>>,
    Schema extends SchemaLike<Keys>,
  >(
    schema: GeneratedSchema<Keys, CreateSchema, Schema>,
    orderBy?: Array<{
      field: Keys;
      order: 'asc' | 'desc';
    }>
  ) => {
    const { table, fields } = convertToIdentifiers(schema);

    return async <SearchKeys extends Keys>(
      limit?: number,
      offset?: number,
      search?: SearchOptions<SearchKeys>
    ) =>
      manyRows(
        pool.query<Schema>(sql`
          select ${expandFields(schema)}
          from ${table}
          ${buildSearchSql(schema, search)}
          ${conditionalSql(orderBy, (orderBy) => {
            const orderBySql = orderBy.map(({ field, order }) =>
              // Note: 'desc' and 'asc' are keywords, so we don't pass them as values
              order === 'desc' ? sql`${fields[field]} desc` : sql`${fields[field]} asc`
            );
            return sql`order by ${sql.join(orderBySql, sql`, `)}`;
          })}
          ${conditionalSql(limit, (limit) => sql`limit ${limit}`)}
          ${conditionalSql(offset, (offset) => sql`offset ${offset}`)}
        `)
      );
  };
