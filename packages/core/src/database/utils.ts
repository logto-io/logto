import { type GeneratedSchema } from '@logto/schemas';
import {
  type SchemaLike,
  conditionalSql,
  convertToIdentifiers,
  type Table,
  type FieldIdentifiers,
} from '@logto/shared';
import { type SqlSqlToken, sql } from 'slonik';

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

/**
 * Given a set of identifiers, build a SQL that converts them into a JSON object by mapping
 * the keys to the values.
 *
 * @example
 * ```ts
 * buildJsonObjectSql({
 *   id: sql.identifier(['id']),
 *   firstName: sql.identifier(['first_name']),
 *   lastName: sql.identifier(['last_name']),
 *   createdAt: sql.identifier(['created_at']),
 * );
 * ```
 *
 * will generate
 *
 * ```sql
 * json_build_object(
 *   'id', "id",
 *   'firstName', "first_name",
 *   'lastName', "last_name",
 *   'createdAt', trunc(extract(epoch from "created_at") * 1000)
 * )
 * ```
 *
 * @remarks The values will be converted to epoch milliseconds if the key ends with `At` since
 * slonik has a default parser that converts timestamps to epoch milliseconds, but it does not
 * work for JSON objects.
 */
export const buildJsonObjectSql = <Identifiers extends FieldIdentifiers<string>>(
  identifiers: Identifiers
) => sql`
  json_build_object(
    ${sql.join(
      Object.entries(identifiers).map(
        ([key, value]) =>
          sql`${sql.literalValue(key)}, ${
            key.endsWith('At') ? sql`trunc(extract(epoch from ${value}) * 1000)` : value
          }`
      ),
      sql`, `
    )}
  )
`;
