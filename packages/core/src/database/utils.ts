import { type GeneratedSchema } from '@logto/schemas';
import { type SchemaLike, conditionalSql, convertToIdentifiers } from '@logto/shared';
import { type SqlSqlToken, sql } from 'slonik';

/**
 * Options for searching for a string within a set of fields (case-insensitive).
 */
export type SearchOptions<Keys extends string> = {
  fields: readonly Keys[];
  keyword: string;
};

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
