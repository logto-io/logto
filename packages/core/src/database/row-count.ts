import { type GeneratedSchema } from '@logto/schemas';
import { type SchemaLike } from '@logto/shared';
import type { CommonQueryMethods, IdentifierSqlToken } from '@silverhand/slonik';
import { sql } from '@silverhand/slonik';

import { type SearchOptions, buildSearchSql } from './utils.js';

export const buildGetTotalRowCountWithPool =
  <
    Keys extends string,
    CreateSchema extends Partial<SchemaLike<Keys>>,
    Schema extends SchemaLike<Keys>,
  >(
    pool: CommonQueryMethods,
    schema: GeneratedSchema<Keys, CreateSchema, Schema>
  ) =>
  async <SearchKeys extends Keys>(search?: SearchOptions<SearchKeys>) => {
    // Postgres returns a bigint for count(*), which is then converted to a string by query library.
    // We need to convert it to a number.
    const { count } = await pool.one<{ count: string }>(sql`
      select count(*)
      from ${sql.identifier([schema.table])}
      ${buildSearchSql(schema, search)}
    `);

    return { count: Number(count) };
  };

export const getTotalRowCountWithPool =
  (pool: CommonQueryMethods) => async (table: IdentifierSqlToken) => {
    // Postgres returns a bigint for count(*), which is then converted to a string by query library.
    // We need to convert it to a number.
    const { count } = await pool.one<{ count: string }>(sql`
      select count(*)
      from ${table}
    `);

    return { count: Number(count) };
  };
