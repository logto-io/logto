import { type GeneratedSchema } from '@logto/schemas';
import { type SchemaLike, type Table } from '@logto/shared';
import { type SqlSqlToken, sql } from '@silverhand/slonik';

import { conditionalSql, convertToIdentifiers } from '#src/utils/sql.js';

/**
 * Options for searching for a string within a set of fields (case-insensitive).
 */
export type SearchOptions<Keys extends string> = {
  fields: readonly Keys[];
  keyword: string;
};

/**
 * Build the SQL for searching for a string within a set of fields (case-insensitive) of a
 * schema. Fields are joined by `or`.
 *
 * - If `search` is `undefined`, it will return an empty SQL.
 * - If `search` is defined, it will return a SQL that is wrapped in a pair of parentheses.
 *
 * @param schema The schema to search.
 * @param search The search options.
 * @param prefixSql The SQL to prefix the generated SQL. Defaults to `where `. Ignored if
 * `search` is `undefined`.
 * @returns The generated SQL.
 */
export const buildSearchSql = <
  Keys extends string,
  CreateSchema extends Partial<SchemaLike<Keys>>,
  Schema extends SchemaLike<Keys>,
  SearchKeys extends Keys,
>(
  schema: GeneratedSchema<Keys, CreateSchema, Schema>,
  search?: SearchOptions<SearchKeys>,
  prefixSql: SqlSqlToken = sql`where `
) => {
  const { fields } = convertToIdentifiers(schema, true);

  return conditionalSql(search, (search) => {
    const { fields: searchFields, keyword } = search;
    const searchSql = sql.join(
      searchFields.map((field) => sql`${fields[field]} ilike ${`%${keyword}%`}`),
      sql` or `
    );
    return sql`${prefixSql}(${searchSql})`;
  });
};

/**
 * Expand the fields of a schema into a SQL list. Useful for `select` statements.
 *
 * @param schema The schema to expand.
 * @param tablePrefix Whether to prefix the fields with the table name.
 * @returns The generated SQL list separated by `, `.
 */
export const expandFields = <Keys extends string>(schema: Table<Keys>, tablePrefix = false) => {
  const { fields } = convertToIdentifiers(schema, tablePrefix);
  return sql.join(Object.values(fields), sql`, `);
};
