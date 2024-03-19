import type { CreateScope, Scope } from '@logto/schemas';
import { Resources, Scopes } from '@logto/schemas';
import type { CommonQueryMethods } from '@silverhand/slonik';
import { sql } from '@silverhand/slonik';

import { buildFindEntityByIdWithPool } from '#src/database/find-entity-by-id.js';
import { buildInsertIntoWithPool } from '#src/database/insert-into.js';
import { buildUpdateWhereWithPool } from '#src/database/update-where.js';
import { DeletionError } from '#src/errors/SlonikError/index.js';
import type { Search } from '#src/utils/search.js';
import { buildConditionsFromSearch } from '#src/utils/search.js';
import type { OmitAutoSetFields } from '#src/utils/sql.js';
import { conditionalSql, convertToIdentifiers } from '#src/utils/sql.js';

const { table, fields } = convertToIdentifiers(Scopes, true);
const resources = convertToIdentifiers(Resources, true);

const buildResourceConditions = (search?: Search) => {
  if (!search) {
    return sql``;
  }

  const hasSearch = search.matches.length > 0;
  const searchFields = [Scopes.fields.id, Scopes.fields.name, Scopes.fields.description];

  return conditionalSql(
    hasSearch,
    () => sql`and ${buildConditionsFromSearch(search, searchFields)}`
  );
};

export const createScopeQueries = (pool: CommonQueryMethods) => {
  const searchScopesByResourceId = async (
    resourceId: string,
    search: Search,
    limit?: number,
    offset?: number
  ) =>
    pool.any<Scope>(sql`
      select ${sql.join(Object.values(fields), sql`, `)}
      from ${table}
      where ${fields.resourceId}=${resourceId}
      ${buildResourceConditions(search)}
      ${conditionalSql(limit, (value) => sql`limit ${value}`)}
      ${conditionalSql(offset, (value) => sql`offset ${value}`)}
    `);

  const searchScopesByScopeIds = async (
    scopeIds: string[],
    search: Search,
    limit?: number,
    offset?: number
  ) =>
    pool.any<Scope>(sql`
      select ${sql.join(Object.values(fields), sql`, `)}
      from ${table}
      where ${fields.id} in (${scopeIds.length > 0 ? sql.join(scopeIds, sql`, `) : sql`null`})
      ${buildResourceConditions(search)}
      ${conditionalSql(limit, (value) => sql`limit ${value}`)}
      ${conditionalSql(offset, (value) => sql`offset ${value}`)}
    `);

  const countScopesByResourceId = async (resourceId: string, search?: Search) => {
    const { count } = await pool.one<{ count: string }>(sql`
      select count(*)
      from ${table}
      where ${fields.resourceId}=${resourceId}
      ${buildResourceConditions(search)}
    `);

    return { count: Number(count) };
  };

  const countScopesByScopeIds = async (scopeIds: string[], search: Search) =>
    pool.one<{ count: number }>(sql`
      select count(*)
      from ${table}
      where ${fields.id} in (${scopeIds.length > 0 ? sql.join(scopeIds, sql`, `) : sql`null`})
      ${buildResourceConditions(search)}
    `);

  const findScopeByNameAndResourceId = async (
    name: string,
    resourceId: string,
    excludeScopeId?: string
  ) =>
    pool.maybeOne<Scope>(sql`
      select ${sql.join(Object.values(fields), sql`, `)}
          from ${table}
          where ${fields.resourceId}=${resourceId} and ${fields.name}=${name}
          ${conditionalSql(excludeScopeId, (id) => sql`and ${fields.id}<>${id}`)}
    `);

  const findScopesByResourceId = async (resourceId: string) =>
    pool.any<Scope>(sql`
      select ${sql.join(Object.values(fields), sql`, `)}
      from ${table}
      where ${fields.resourceId}=${resourceId}
    `);

  const findScopesByResourceIds = async (resourceIds: string[]) =>
    resourceIds.length > 0
      ? pool.any<Scope>(sql`
        select ${sql.join(Object.values(fields), sql`, `)}
        from ${table}
        where ${fields.resourceId} in (${sql.join(resourceIds, sql`, `)})
      `)
      : [];

  const findScopesByIdsAndResourceIndicator = async (
    scopeIds: string[],
    resourceIndicator: string
  ): Promise<readonly Scope[]> =>
    scopeIds.length > 0
      ? pool.any<Scope>(sql`
        select ${sql.join(Object.values(fields), sql`, `)}
        from ${table}
        inner join ${resources.table}
          on ${resources.fields.id} = ${fields.resourceId}
        where ${fields.id} in (${sql.join(scopeIds, sql`, `)})
        and ${resources.fields.indicator} = ${resourceIndicator}
      `)
      : [];

  const findScopesByIds = async (scopeIds: string[]): Promise<readonly Scope[]> =>
    scopeIds.length > 0
      ? pool.any<Scope>(sql`
        select ${sql.join(Object.values(fields), sql`, `)}
        from ${table}
        where ${fields.id} in (${sql.join(scopeIds, sql`, `)})
      `)
      : [];

  const insertScope = buildInsertIntoWithPool(pool)(Scopes, {
    returning: true,
  });

  const findScopeById = buildFindEntityByIdWithPool(pool)(Scopes);

  const updateScope = buildUpdateWhereWithPool(pool)(Scopes, true);

  const updateScopeById = async (id: string, set: Partial<OmitAutoSetFields<CreateScope>>) =>
    updateScope({ set, where: { id }, jsonbMode: 'merge' });

  const deleteScopeById = async (id: string) => {
    const { rowCount } = await pool.query(sql`
      delete from ${table}
      where ${fields.id}=${id}
    `);

    if (rowCount < 1) {
      throw new DeletionError(Scopes.table, id);
    }
  };

  return {
    searchScopesByResourceId,
    searchScopesByScopeIds,
    countScopesByResourceId,
    countScopesByScopeIds,
    findScopeByNameAndResourceId,
    findScopesByResourceId,
    findScopesByResourceIds,
    findScopesByIds,
    findScopesByIdsAndResourceIndicator,
    insertScope,
    findScopeById,
    updateScope,
    updateScopeById,
    deleteScopeById,
  };
};
