import type { CreateScope, Scope } from '@logto/schemas';
import { Scopes } from '@logto/schemas';
import type { OmitAutoSetFields } from '@logto/shared';
import { conditionalSql, convertToIdentifiers } from '@logto/shared';
import { sql } from 'slonik';

import { buildFindEntityById } from '#src/database/find-entity-by-id.js';
import { buildInsertInto } from '#src/database/insert-into.js';
import { buildUpdateWhere } from '#src/database/update-where.js';
import envSet from '#src/env-set/index.js';
import { DeletionError } from '#src/errors/SlonikError/index.js';
import type { Search } from '#src/utils/search.js';
import { buildConditionsFromSearch } from '#src/utils/search.js';

const { table, fields } = convertToIdentifiers(Scopes);

export const findScopesByResourceId = async (resourceId: string) =>
  envSet.pool.any<Scope>(sql`
    select ${sql.join(Object.values(fields), sql`, `)}
    from ${table}
    where ${fields.resourceId}=${resourceId}
  `);

const buildResourceConditions = (search: Search) => {
  const hasSearch = search.matches.length > 0;
  const searchFields = [Scopes.fields.id, Scopes.fields.name, Scopes.fields.description];

  return conditionalSql(
    hasSearch,
    () => sql`and ${buildConditionsFromSearch(search, searchFields)}`
  );
};

export const findScopes = async (
  resourceId: string,
  search: Search,
  limit?: number,
  offset?: number
) =>
  envSet.pool.any<Scope>(sql`
    select ${sql.join(Object.values(fields), sql`, `)}
    from ${table}
    where ${fields.resourceId}=${resourceId}
    ${buildResourceConditions(search)}
    ${conditionalSql(limit, (value) => sql`limit ${value}`)}
    ${conditionalSql(offset, (value) => sql`offset ${value}`)}
  `);

export const countScopes = async (resourceId: string, search: Search) =>
  envSet.pool.one<{ count: number }>(sql`
    select count(*)
    from ${table}
    where ${fields.resourceId}=${resourceId}
    ${buildResourceConditions(search)}
  `);

export const findScopesByResourceIds = async (resourceIds: string[]) =>
  resourceIds.length > 0
    ? envSet.pool.any<Scope>(sql`
      select ${sql.join(Object.values(fields), sql`, `)}
      from ${table}
      where ${fields.resourceId} in (${sql.join(resourceIds, sql`, `)})
    `)
    : [];

export const findScopesByIds = async (scopeIds: string[]) =>
  scopeIds.length > 0
    ? envSet.pool.any<Scope>(sql`
      select ${sql.join(Object.values(fields), sql`, `)}
      from ${table}
      where ${fields.id} in (${sql.join(scopeIds, sql`, `)})
    `)
    : [];

export const insertScope = buildInsertInto<CreateScope, Scope>(Scopes, {
  returning: true,
});

export const findScopeById = buildFindEntityById<CreateScope, Scope>(Scopes);

const updateScope = buildUpdateWhere<CreateScope, Scope>(Scopes, true);

export const updateScopeById = async (id: string, set: Partial<OmitAutoSetFields<CreateScope>>) =>
  updateScope({ set, where: { id }, jsonbMode: 'merge' });

export const deleteScopeById = async (id: string) => {
  const { rowCount } = await envSet.pool.query(sql`
    delete from ${table}
    where ${fields.id}=${id}
  `);

  if (rowCount < 1) {
    throw new DeletionError(Scopes.table, id);
  }
};
