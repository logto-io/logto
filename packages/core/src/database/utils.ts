import { conditionalSql } from '@logto/shared';
import { sql } from 'slonik';

/**
 * Options for searching for a string within a set of fields (case-insensitive).
 *
 * Note: `id` is excluded from the fields since it should be unique.
 */
export type SearchOptions<Keys extends string> = {
  fields: ReadonlyArray<Exclude<Keys, 'id'>>;
  keyword: string;
};

export const buildSearchSql = <SearchKeys extends string>(search?: SearchOptions<SearchKeys>) => {
  return conditionalSql(search, (search) => {
    const { fields: searchFields, keyword } = search;
    const searchSql = sql.join(
      searchFields.map((field) => sql`${sql.identifier([field])} ilike ${`%${keyword}%`}`),
      sql` or `
    );
    return sql`where ${searchSql}`;
  });
};
