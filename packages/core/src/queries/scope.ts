import type { CreateScope, Scope } from '@logto/schemas';
import { Scopes } from '@logto/schemas';
import type { OmitAutoSetFields } from '@logto/shared';
import { conditionalSql, convertToIdentifiers } from '@logto/shared';
import type { CommonQueryMethods } from 'slonik';
import { sql } from 'slonik';

import { buildFindEntityByIdWithPool } from '#src/database/find-entity-by-id.js';
import { buildInsertIntoWithPool } from '#src/database/insert-into.js';
import { buildUpdateWhereWithPool } from '#src/database/update-where.js';
import { DeletionError } from '#src/errors/SlonikError/index.js';
import type { Search } from '#src/utils/search.js';
import { buildConditionsFromSearch } from '#src/utils/search.js';

const { table, fields } = convertToIdentifiers(Scopes);

const buildResourceConditions = (search: Search) => {
  const hasSearch = search.matches.length > 0;
  const searchFields = [Scopes.fields.id, Scopes.fields.name, Scopes.fields.description];

  return conditionalSql(
    hasSearch,
    () => sql`and ${buildConditionsFromSearch(search, searchFields)}`
  );
};

export const createScopeQueries = (pool: CommonQueryMethods) => {
  const findScopes = async (resourceId: string, search: Search, limit?: number, offset?: number) =>
    pool.any<Scope>(sql`
      select ${sql.join(Object.values(fields), sql`, `)}
      from ${table}
      where ${fields.resourceId}=${resourceId}
      ${buildResourceConditions(search)}
      ${conditionalSql(limit, (value) => sql`limit ${value}`)}
      ${conditionalSql(offset, (value) => sql`offset ${value}`)}
    `);

  const countScopes = async (resourceId: string, search: Search) =>
    pool.one<{ count: number }>(sql`
      select count(*)
      from ${table}
      where ${fields.resourceId}=${resourceId}
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

  const findScopesByIds = async (scopeIds: string[]) =>
    scopeIds.length > 0
      ? pool.any<Scope>(sql`
        select ${sql.join(Object.values(fields), sql`, `)}
        from ${table}
        where ${fields.id} in (${sql.join(scopeIds, sql`, `)})
      `)
      : [];

  const insertScope = buildInsertIntoWithPool(pool)<CreateScope, Scope>(Scopes, {
    returning: true,
  });

  const findScopeById = buildFindEntityByIdWithPool(pool)<CreateScope, Scope>(Scopes);

  const updateScope = buildUpdateWhereWithPool(pool)<CreateScope, Scope>(Scopes, true);

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
    findScopes,
    countScopes,
    findScopeByNameAndResourceId,
    findScopesByResourceId,
    findScopesByResourceIds,
    findScopesByIds,
    insertScope,
    findScopeById,
    updateScope,
    updateScopeById,
    deleteScopeById,
  };
};
